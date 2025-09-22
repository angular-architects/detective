import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    complexDataPassing: z
      .number()
      .describe(
        'Counts "fat" data passed through APIs (large object literals, large destructures, or large inline object types). High values indicate potential Data Clumps; consider introducing value objects/DTOs or narrowing parameters.'
      ),
  }),
  ui: {
    metrics: [
      {
        path: 'complexDataPassing',
        label: 'Complex Data Passing',
        icon: 'group_work',
        threshold: { warnGte: 1 },
        tooltip:
          'Detects large object literals/destructures in calls/signatures. Consider extracting value objects or reducing parameter surface.',
        refLink: 'https://refactoring.guru/smells/data-clumps',
      },
    ],
  },
})
export class ComplexDataPassingMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;
    const LARGE_THRESHOLD = 4;
    const isLargeObjectLiteral = (expr: ts.Expression): boolean =>
      ts.isObjectLiteralExpression(expr) &&
      expr.properties.length >= LARGE_THRESHOLD;
    const isInsideDecorator = (n: ts.Node): boolean => {
      let cur: ts.Node | undefined = n;
      while (cur) {
        if (ts.isDecorator(cur)) return true;
        cur = cur.parent;
      }
      return false;
    };
    const isLargeDestructure = (param: ts.ParameterDeclaration): boolean =>
      ts.isObjectBindingPattern(param.name) &&
      param.name.elements.length >= LARGE_THRESHOLD;
    const isLargeInlineObjType = (param: ts.ParameterDeclaration): boolean =>
      !!param.type &&
      ts.isTypeLiteralNode(param.type) &&
      param.type.members.filter((m) => ts.isPropertySignature(m)).length >=
        LARGE_THRESHOLD;

    const walk = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        if (!isInsideDecorator(node)) {
          node.arguments?.forEach((arg) => {
            if (isLargeObjectLiteral(arg)) count++;
          });
        }
      } else if (ts.isNewExpression(node)) {
        if (!isInsideDecorator(node)) {
          node.arguments?.forEach((arg) => {
            if (isLargeObjectLiteral(arg)) count++;
          });
        }
      }

      if (
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isConstructorDeclaration(node)
      ) {
        node.parameters.forEach((param) => {
          if (isLargeDestructure(param) || isLargeInlineObjType(param)) count++;
        });
      }
      ts.forEachChild(node, walk);
    };

    walk(context.sourceFile);
    return count;
  }
}
