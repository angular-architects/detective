import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    arrayMixedMeanings: z
      .number()
      .describe(
        'Counts arrays that mix heterogeneous element kinds (objects, scalars, booleans, etc.). High values suggest the array is overloaded with multiple responsibilities; consider typed objects, records, or tuples with explicit structure.'
      ),
  }),
  ui: {
    metrics: [
      {
        path: 'arrayMixedMeanings',
        label: 'Array Mixed Meanings',
        icon: 'view_array',
        threshold: { warnGte: 1 },
        tooltip:
          'Arrays containing mixed element kinds (e.g., numbers + objects) often hide multiple responsibilities. Prefer a structured type (object/record) or a tuple.',
        refLink: 'https://refactoring.guru/smells/primitive-obsession',
      },
    ],
  },
})
export class ArrayMixedMeaningsMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;

    const categorize = (expr: ts.Expression): string => {
      if (ts.isArrayLiteralExpression(expr)) return 'array';
      if (ts.isObjectLiteralExpression(expr)) return 'object';
      if (ts.isLiteralExpression(expr)) return 'literal';
      switch (expr.kind) {
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
        case ts.SyntaxKind.NullKeyword:
          return 'literal';
        default:
          break;
      }
      if (ts.isIdentifier(expr) && expr.text === 'undefined') return 'literal';
      return 'other';
    };

    const walk = (node: ts.Node) => {
      if (ts.isArrayLiteralExpression(node)) {
        const categories = new Set<string>();
        node.elements.forEach((el) => categories.add(categorize(el)));
        if (categories.size >= 2) count++;
      }
      ts.forEachChild(node, walk);
    };

    walk(context.sourceFile);
    return count;
  }
}
