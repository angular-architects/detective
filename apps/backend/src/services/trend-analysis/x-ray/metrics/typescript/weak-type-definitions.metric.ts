import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    weakTypeDefinitions: z
      .number()
      .describe('Interfaces with all-optional members.'),
  }),
  ui: {
    metrics: [
      {
        path: 'weakTypeDefinitions',
        label: 'Weak Type Definitions',
        icon: 'assignment_late',
        threshold: { warnGte: 1 },
        tooltip: 'All-optional interfaces are weak.',
        refLink:
          'https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html',
      },
    ],
  },
})
export class WeakTypeDefinitionsMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;
    const visit = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node)) {
        const optionalProps = node.members.filter(
          (member) => ts.isPropertySignature(member) && member.questionToken
        ).length;
        if (optionalProps === node.members.length && node.members.length > 0)
          count++;
      }
      ts.forEachChild(node, visit);
    };
    visit(context.sourceFile);
    return count;
  }
}
