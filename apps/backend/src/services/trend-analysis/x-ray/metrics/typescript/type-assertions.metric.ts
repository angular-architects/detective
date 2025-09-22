import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    typeAssertions: z.number().describe('Type assertions (as / <Type>expr).'),
  }),
  ui: {
    metrics: [
      {
        path: 'typeAssertions',
        label: 'Type Assertions',
        icon: 'build',
        threshold: { warnGte: 3 },
        tooltip: 'Can hide errors.',
        refLink:
          'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions',
      },
    ],
  },
})
export class TypeAssertionsMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;
    const visit = (node: ts.Node) => {
      if (ts.isTypeAssertionExpression(node) || ts.isAsExpression(node))
        count++;
      ts.forEachChild(node, visit);
    };
    visit(context.sourceFile);
    return count;
  }
}
