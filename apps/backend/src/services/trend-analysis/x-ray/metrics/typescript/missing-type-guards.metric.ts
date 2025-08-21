import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    missingTypeGuards: z
      .number()
      .describe('Heuristic for missing user-defined type guards.'),
  }),
  ui: {
    metrics: [
      {
        path: 'missingTypeGuards',
        label: 'Missing Type Guards',
        icon: 'shield_moon',
        threshold: { warnGte: 1 },
        tooltip: 'Prefer narrowing with guards.',
        refLink:
          'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
      },
    ],
  },
})
export class MissingTypeGuardsMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;

    const isBooleanKeyword = (t: ts.TypeNode | undefined): boolean =>
      !!t && t.kind === ts.SyntaxKind.BooleanKeyword;
    const isTypePredicate = (t: ts.TypeNode | undefined): boolean =>
      !!t && ts.isTypePredicateNode(t);
    const startsWithGuardName = (name: string | undefined): boolean => {
      if (!name) return false;
      const lower = name.toLowerCase();
      return (
        lower.startsWith('is') ||
        lower.startsWith('has') ||
        lower.startsWith('assert')
      );
    };

    const getCallableName = (
      node: ts.FunctionLikeDeclaration | ts.ArrowFunction
    ): string | undefined => {
      if (
        (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
        node.name
      ) {
        return node.name.getText();
      }
      const parent = node.parent;
      if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
        return parent.name.text;
      }
      return undefined;
    };

    const hasParamNarrowingChecks = (
      fn: ts.FunctionLikeDeclarationBase | ts.ArrowFunction,
      paramName: string
    ): boolean => {
      let seen = false;
      const check = (node: ts.Node) => {
        if (seen) return;
        if (ts.isTypeOfExpression(node)) {
          if (
            ts.isIdentifier(node.expression) &&
            node.expression.text === paramName
          )
            seen = true;
        } else if (
          ts.isBinaryExpression(node) &&
          node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword
        ) {
          if (ts.isIdentifier(node.left) && node.left.text === paramName)
            seen = true;
        } else if (
          ts.isBinaryExpression(node) &&
          node.operatorToken.kind === ts.SyntaxKind.InKeyword
        ) {
          if (ts.isIdentifier(node.right) && node.right.text === paramName)
            seen = true;
        }
        ts.forEachChild(node, check);
      };
      if (fn.body) ts.forEachChild(fn.body, check);
      return seen;
    };

    const visit = (n: ts.Node) => {
      if (
        ts.isFunctionDeclaration(n) ||
        ts.isMethodDeclaration(n) ||
        ts.isFunctionExpression(n) ||
        ts.isArrowFunction(n)
      ) {
        const name = getCallableName(
          n as ts.FunctionLikeDeclaration | ts.ArrowFunction
        );
        const sig = n as ts.SignatureDeclarationBase;
        const rType = sig.type;
        const params = sig.parameters ?? [];

        if (
          startsWithGuardName(name) &&
          params.length === 1 &&
          !isTypePredicate(rType) &&
          (isBooleanKeyword(rType) || !rType)
        ) {
          const p = params[0];
          const pName = ts.isIdentifier(p.name) ? p.name.text : undefined;
          if (
            pName &&
            hasParamNarrowingChecks(
              n as ts.FunctionLikeDeclarationBase | ts.ArrowFunction,
              pName
            )
          ) {
            count++;
          }
        }
      }
      ts.forEachChild(n, visit);
    };

    visit(context.sourceFile);
    return count;
  }
}
