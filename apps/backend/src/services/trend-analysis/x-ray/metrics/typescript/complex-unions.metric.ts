import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    complexUnions: z.number().describe('Union types with > 4 members.'),
  }),
  ui: {
    metrics: [
      {
        path: 'complexUnions',
        label: 'Complex Unions',
        icon: 'category',
        threshold: { warnGte: 1 },
        tooltip: 'Large unions increase complexity.',
        refLink:
          'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types',
      },
    ],
  },
})
export class ComplexUnionsMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;
    const visit = (node: ts.Node) => {
      if (ts.isUnionTypeNode(node) && node.types.length > 4) count++;
      ts.forEachChild(node, visit);
    };
    visit(context.sourceFile);
    return count;
  }
}
