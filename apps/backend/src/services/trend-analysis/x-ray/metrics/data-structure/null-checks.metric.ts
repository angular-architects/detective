import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    nullChecks: z
      .number()
      .describe('Non-strict equality checks against null/undefined.'),
  }),
  ui: {
    metrics: [
      {
        path: 'nullChecks',
        label: 'Null Checks',
        icon: 'not_equal',
        threshold: { warnGte: 1 },
        tooltip:
          'Non-strict (==/!=) null checks are error-prone. Prefer ===/!== or explicit nullish handling.',
        refLink:
          'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Equality',
      },
    ],
  },
})
export class NullChecksMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;
    const isNullish = (s: string): boolean => s === 'null' || s === 'undefined';
    const walk = (node: ts.Node) => {
      if (ts.isBinaryExpression(node)) {
        const left = node.left.getText();
        const operator = node.operatorToken.getText();
        const right = node.right.getText();
        const isNonStrictEq = operator === '==' || operator === '!=';
        if (isNonStrictEq && (isNullish(left) || isNullish(right))) count++;
      }
      ts.forEachChild(node, walk);
    };
    walk(context.sourceFile);
    return count;
  }
}
