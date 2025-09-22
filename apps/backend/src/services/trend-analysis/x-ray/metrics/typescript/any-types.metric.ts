import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    anyTypes: z.number().describe('Occurrences of any types.'),
  }),
  ui: {
    metrics: [
      {
        path: 'anyTypes',
        label: 'Any Types',
        icon: 'warning',
        threshold: { warnGte: 1 },
        tooltip: 'Reduces type safety.',
        refLink:
          'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any',
      },
    ],
  },
})
export class AnyTypesMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;
    const visit = (node: ts.Node) => {
      if (ts.isTypeNode(node) && node.kind === ts.SyntaxKind.AnyKeyword)
        count++;
      ts.forEachChild(node, visit);
    };
    visit(context.sourceFile);
    return count;
  }
}
