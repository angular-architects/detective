import * as ts from 'typescript';
import { z } from 'zod';

import { calcComplexityForNode } from '../../../../../utils/complexity';
import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';
import { NestedConditionsMetric } from '../nested-conditions-metric';

@Metric({
  schema: z.object({
    complexAlgorithms: z
      .number()
      .describe(
        'Counts functions/methods that are likely hard to understand or change based on two heuristics: cyclomatic complexity ≥ 15 or maximum nesting depth ≥ 4. High control-flow complexity and deep nesting reduce readability and maintainability; consider refactoring with early returns, extraction, or simplifying conditions.'
      ),
  }),
  ui: {
    metrics: [
      {
        path: 'complexAlgorithms',
        label: 'Complex Algorithms',
        icon: 'account_tree',
        threshold: { warnGte: 1 },
        refLink: 'https://en.wikipedia.org/wiki/Cyclomatic_complexity',
      },
    ],
  },
})
export class ComplexAlgorithmsMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let complexMethods = 0;

    const cyclomaticComplexity = (node: ts.Node): number =>
      calcComplexityForNode(node);

    const nestedConditionsMetric = new NestedConditionsMetric();

    const walk = (node: ts.Node) => {
      if (
        ts.isMethodDeclaration(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node)
      ) {
        const cpx = cyclomaticComplexity(node);
        const depth = nestedConditionsMetric.analyze(node);
        if (cpx >= 15 || depth >= 4) complexMethods++;
      }
      ts.forEachChild(node, walk);
    };

    walk(context.sourceFile);
    return complexMethods;
  }
}
