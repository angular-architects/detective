import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    publicFields: z
      .number()
      .describe('Count of public fields (excluding Angular signals).'),
  }),
  ui: {
    metrics: [
      {
        path: 'publicFields',
        label: 'Public Fields',
        icon: 'visibility',
        threshold: { warnGte: 1 },
        tooltip: 'Breaks encapsulation. Excludes Angular signals.',
        refLink: 'https://refactoring.guru/smells/data-class',
      },
    ],
  },
})
export class PublicFieldsMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    let count = 0;

    const isPublic = (node: ts.PropertyDeclaration): boolean => {
      return (
        !node.modifiers ||
        node.modifiers.some(
          (mod) => mod.kind === ts.SyntaxKind.PublicKeyword
        ) ||
        !node.modifiers.some(
          (mod) =>
            mod.kind === ts.SyntaxKind.PrivateKeyword ||
            mod.kind === ts.SyntaxKind.ProtectedKeyword
        )
      );
    };

    const isAngularSignalType = (t: ts.TypeNode | undefined): boolean => {
      if (!t) return false;
      if (ts.isTypeReferenceNode(t)) {
        const getName = (tn: ts.EntityName): string =>
          ts.isIdentifier(tn) ? tn.text : tn.right.text;
        const name = getName(t.typeName);
        if (
          name === 'Signal' ||
          name === 'WritableSignal' ||
          name === 'ComputedSignal' ||
          name === 'ReadonlySignal'
        )
          return true;
        if (name.endsWith('Signal')) return true;
      }
      return false;
    };

    const isAngularSignalInitializer = (
      init: ts.Expression | undefined
    ): boolean => {
      if (!init) return false;
      if (ts.isCallExpression(init)) {
        const callee = init.expression;
        const getId = (expr: ts.Expression): string | undefined => {
          if (ts.isIdentifier(expr)) return expr.text;
          if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
          return undefined;
        };
        const name = getId(callee);
        if (!name) return false;
        return name === 'signal' || name === 'computed' || name === 'effect';
      }
      return false;
    };

    const walk = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        node.members.forEach((member) => {
          if (
            ts.isPropertyDeclaration(member) &&
            isPublic(member) &&
            !isAngularSignalType(member.type) &&
            !isAngularSignalInitializer(member.initializer)
          ) {
            count++;
          }
        });
      }
      ts.forEachChild(node, walk);
    };

    walk(context.sourceFile);
    return count;
  }
}
