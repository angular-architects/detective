import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    temporalCoupling: z
      .number()
      .describe(
        'Counts fields that are written in one method and later read inside a conditional in a different method. This indicates an implicit ordering dependency between methods. If one method must run before another for correct behavior, the class may be exposing temporal coupling. Consider encapsulating the sequence, deriving values on demand, or reducing hidden state dependencies.'
      ),
  }),
  ui: {
    metrics: [
      {
        path: 'temporalCoupling',
        label: 'Temporal Coupling',
        icon: 'timeline',
        threshold: { warnGte: 1 },
        refLink:
          'https://blog.ploeh.dk/2011/05/24/DesignSmellTemporalCoupling/',
      },
    ],
  },
})
export class TemporalCouplingMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    type MethodKey = string;
    let coupledFields = 0;

    const collectFieldWrites = (
      body: ts.Block | ts.ConciseBody,
      writer: (field: string) => void
    ): void => {
      const recordWrite = (n: ts.Node) => {
        if (
          ts.isBinaryExpression(n) &&
          (n.operatorToken.kind === ts.SyntaxKind.EqualsToken ||
            n.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken ||
            n.operatorToken.kind === ts.SyntaxKind.MinusEqualsToken ||
            n.operatorToken.kind === ts.SyntaxKind.AsteriskEqualsToken ||
            n.operatorToken.kind === ts.SyntaxKind.SlashEqualsToken)
        ) {
          if (
            ts.isPropertyAccessExpression(n.left) &&
            n.left.expression.kind === ts.SyntaxKind.ThisKeyword
          ) {
            writer(n.left.name.getText());
          }
        } else if (
          ts.isPrefixUnaryExpression(n) ||
          ts.isPostfixUnaryExpression(n)
        ) {
          const operand = ts.isPrefixUnaryExpression(n) ? n.operand : n.operand;
          if (
            ts.isPropertyAccessExpression(operand) &&
            operand.expression.kind === ts.SyntaxKind.ThisKeyword
          ) {
            writer(operand.name.getText());
          }
        }
        ts.forEachChild(n, recordWrite);
      };
      if (ts.isBlock(body)) ts.forEachChild(body, recordWrite);
      else recordWrite(body);
    };

    const collectFieldReadsInConditions = (
      body: ts.Block | ts.ConciseBody,
      reader: (field: string) => void
    ): void => {
      const scan = (n: ts.Node) => {
        if (
          ts.isIfStatement(n) ||
          ts.isWhileStatement(n) ||
          ts.isDoStatement(n) ||
          ts.isForStatement(n) ||
          ts.isConditionalExpression(n) ||
          ts.isCaseClause(n)
        ) {
          let condition: ts.Expression | undefined;
          if (ts.isIfStatement(n)) condition = n.expression;
          else if (ts.isWhileStatement(n)) condition = n.expression;
          else if (ts.isDoStatement(n)) condition = n.expression;
          else if (ts.isForStatement(n)) condition = n.condition ?? undefined;
          else if (ts.isConditionalExpression(n)) condition = n.condition;
          else if (ts.isCaseClause(n)) condition = n.expression;
          if (condition) {
            const findFieldName = (m: ts.Node) => {
              if (
                ts.isPropertyAccessExpression(m) &&
                m.expression.kind === ts.SyntaxKind.ThisKeyword
              ) {
                reader(m.name.getText());
              }
              ts.forEachChild(m, findFieldName);
            };
            findFieldName(condition);
          }
        }
        ts.forEachChild(n, scan);
      };
      if (ts.isBlock(body)) ts.forEachChild(body, scan);
      else scan(body);
    };

    const walk = (node: ts.Node) => {
      if (!ts.isClassDeclaration(node)) {
        ts.forEachChild(node, walk);
        return;
      }

      const className = node.name?.text || 'AnonymousClass';
      const writes: Map<string, Set<MethodKey>> = new Map();
      const readsInConds: Map<string, Set<MethodKey>> = new Map();

      const record = (
        map: Map<string, Set<MethodKey>>,
        key: string,
        methodKey: MethodKey
      ) => {
        const s = map.get(key) ?? new Set<MethodKey>();
        s.add(methodKey);
        map.set(key, s);
      };

      node.members.forEach((m) => {
        if (!ts.isMethodDeclaration(m) || !m.body) return;
        const methodName = m.name ? m.name.getText() : 'anonymous';
        const methodKey = `${className}.${methodName}`;

        collectFieldWrites(m.body, (field) => record(writes, field, methodKey));
        collectFieldReadsInConditions(m.body, (field) =>
          record(readsInConds, field, methodKey)
        );
      });

      writes.forEach((writers, field) => {
        const readers = readsInConds.get(field);
        if (!readers || readers.size === 0) return;
        const disjoint = Array.from(readers).some((r) => !writers.has(r));
        if (disjoint) coupledFields++;
      });

      ts.forEachChild(node, walk);
    };

    walk(context.sourceFile);
    return coupledFields;
  }
}
