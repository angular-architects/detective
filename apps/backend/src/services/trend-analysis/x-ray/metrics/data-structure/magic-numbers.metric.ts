import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    magicNumbers: z
      .number()
      .describe('Numeric literals other than -1, 0, 1, 2.'),
  }),
  ui: {
    metrics: [
      {
        path: 'magicNumbers',
        label: 'Magic Numbers',
        icon: 'numbers',
        threshold: { warnGte: 1 },
        tooltip: 'Use named constants.',
        refLink: 'https://en.wikipedia.org/wiki/Magic_number_(programming)',
      },
    ],
  },
})
export class MagicNumbersMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;
    const allowed: ReadonlySet<number> = new Set([-1, 0, 1, 2]);
    const walk = (node: ts.Node) => {
      if (ts.isNumericLiteral(node)) {
        const value = parseFloat(node.text);
        if (!allowed.has(value)) count++;
      }
      ts.forEachChild(node, walk);
    };
    walk(context.sourceFile);
    return count;
  }
}
