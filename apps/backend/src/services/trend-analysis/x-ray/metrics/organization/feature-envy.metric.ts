import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    featureEnvy: z
      .number()
      .describe(
        'Counts methods that access properties on parameters (foreign data) significantly more than their own state. Triggered when a method reads fields on its parameters at least 3 times and more often than it accesses `this`. This smell suggests the behavior likely belongs on the collaborator type; consider moving the method, extracting an object, or introducing better abstractions.'
      ),
  }),
  ui: {
    metrics: [
      {
        path: 'featureEnvy',
        label: 'Feature Envy',
        icon: 'swap_calls',
        threshold: { warnGte: 1 },
        refLink: 'https://refactoring.guru/smells/feature-envy',
      },
    ],
  },
})
export class FeatureEnvyMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let methodsWithFeatureEnvy = 0;

    const isFeatureEnvy = (fn: ts.FunctionLikeDeclarationBase): boolean => {
      if (!fn.body) return false;

      const paramNames: ReadonlySet<string> = new Set(
        (fn.parameters ?? [])
          .map((p) => (ts.isIdentifier(p.name) ? p.name.text : undefined))
          .filter((n): n is string => !!n)
      );

      let thisAccesses = 0;
      let foreignParamPropertyAccesses = 0;

      const visit = (n: ts.Node) => {
        if (ts.isPropertyAccessExpression(n)) {
          const expr = n.expression;
          if (expr.kind === ts.SyntaxKind.ThisKeyword) {
            thisAccesses++;
          } else if (ts.isIdentifier(expr) && paramNames.has(expr.text)) {
            foreignParamPropertyAccesses++;
          }
        }
        ts.forEachChild(n, visit);
      };

      ts.forEachChild(fn.body, visit);

      return (
        foreignParamPropertyAccesses >= 3 &&
        foreignParamPropertyAccesses > thisAccesses
      );
    };

    const walk = (node: ts.Node) => {
      if (
        ts.isMethodDeclaration(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node)
      ) {
        if (isFeatureEnvy(node)) methodsWithFeatureEnvy++;
      }
      ts.forEachChild(node, walk);
    };

    walk(context.sourceFile);
    return methodsWithFeatureEnvy;
  }
}
