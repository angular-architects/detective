import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    middleManClasses: z
      .number()
      .describe(
        'Counts classes where the majority of methods are one-liners that simply delegate to another object (e.g., `this.dep.method(...)` or a parameter call). Triggered when a class has at least 3 methods and ≥60% are single-statement delegations. This smell suggests low cohesion and unnecessary indirection; consider moving behavior to the real owner or collapsing pass-throughs.'
      ),
  }),
  ui: {
    metrics: [
      {
        path: 'middleManClasses',
        label: 'Middle Man',
        icon: 'compare_arrows',
        threshold: { warnGte: 1 },
        refLink: 'https://refactoring.guru/smells/middle-man',
      },
    ],
  },
})
export class MiddleManMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let middleManClasses = 0;

    const isDelegatingCall = (
      expr: ts.Expression,
      params: ReadonlySet<string>
    ): boolean => {
      if (!ts.isCallExpression(expr)) return false;
      const callee = expr.expression;
      if (!ts.isPropertyAccessExpression(callee)) return false;
      const target = callee.expression;
      if (target.kind === ts.SyntaxKind.ThisKeyword) return true;
      return ts.isIdentifier(target) && params.has(target.text);
    };

    const isDelegatingMethod = (method: ts.MethodDeclaration): boolean => {
      if (!method.body) return false;
      const params = new Set(
        method.parameters
          .map((p) => (ts.isIdentifier(p.name) ? p.name.text : undefined))
          .filter((n): n is string => !!n)
      );
      const stmts = method.body.statements;
      if (stmts.length !== 1) return false;
      const only = stmts[0];
      if (ts.isReturnStatement(only) && only.expression) {
        return isDelegatingCall(only.expression, params);
      }
      if (ts.isExpressionStatement(only)) {
        return isDelegatingCall(only.expression, params);
      }
      return false;
    };

    const walk = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        const methods: ts.MethodDeclaration[] = node.members.filter(
          (m): m is ts.MethodDeclaration =>
            ts.isMethodDeclaration(m) && !!m.body
        );
        if (methods.length === 0) return;
        const delegating = methods.filter((m) => isDelegatingMethod(m)).length;
        const ratio = delegating / methods.length;
        if (methods.length >= 3 && ratio >= 0.6) middleManClasses++;
      }
      ts.forEachChild(node, walk);
    };

    walk(context.sourceFile);
    return middleManClasses;
  }
}
