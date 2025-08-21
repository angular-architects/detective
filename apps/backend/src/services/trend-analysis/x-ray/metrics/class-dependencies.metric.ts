import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../x-ray-metrics.types';

import { BaseMetric } from './metric.base';
import { Metric } from './metric.decorator';

export interface ClassDependenciesMetricResult {
  count: number;
  types: Set<string>;
}

@Metric({
  schema: z.object({
    dependencies: z
      .number()
      .describe('Unique dependency types in constructor/fields.'),
  }),
  ui: {
    metrics: [
      {
        path: 'dependencies',
        label: 'Dependencies',
        icon: 'link',
        threshold: { warnGte: 6 },
        tooltip: 'High count can signal tight coupling.',
        refLink: 'https://martinfowler.com/articles/dipInTheWild.html',
      },
    ],
  },
})
export class ClassDependenciesMetric extends BaseMetric<ClassDependenciesMetricResult> {
  analyze(context: AnalyzerContext): ClassDependenciesMetricResult {
    const classNode =
      context.scopeNode && ts.isClassDeclaration(context.scopeNode)
        ? context.scopeNode
        : undefined;
    if (!classNode) {
      return { count: 0, types: new Set() };
    }

    const types = this.collectDependencies(classNode);
    return { count: types.size, types };
  }

  private collectDependencies(node: ts.ClassDeclaration): Set<string> {
    const dependencies = new Set<string>();
    node.members.forEach((member) => {
      if (ts.isConstructorDeclaration(member)) {
        this.collectConstructorDependencies(member, dependencies);
      } else if (ts.isPropertyDeclaration(member)) {
        this.collectPropertyDependencies(member, dependencies);
      }
    });
    return dependencies;
  }

  private collectConstructorDependencies(
    constructor: ts.ConstructorDeclaration,
    dependencies: Set<string>
  ): void {
    constructor.parameters.forEach((param) => {
      if (param.type) {
        if (
          ts.isTypeReferenceNode(param.type) &&
          ts.isIdentifier(param.type.typeName)
        ) {
          dependencies.add(param.type.typeName.text);
        }
      }
    });
  }

  private collectPropertyDependencies(
    property: ts.PropertyDeclaration,
    dependencies: Set<string>
  ): void {
    if (property.initializer && ts.isCallExpression(property.initializer)) {
      const injectDependency = this.extractInjectDependency(
        property.initializer
      );
      if (injectDependency) {
        dependencies.add(injectDependency);
        return;
      }
    }

    if (!property.type) return;
    const hasReadonlyModifier = property.modifiers?.some(
      (mod) => mod.kind === ts.SyntaxKind.ReadonlyKeyword
    );
    if (hasReadonlyModifier || this.looksLikeService(property)) {
      if (
        ts.isTypeReferenceNode(property.type) &&
        ts.isIdentifier(property.type.typeName)
      ) {
        dependencies.add(property.type.typeName.text);
      }
    }
  }

  private extractInjectDependency(
    callExpression: ts.CallExpression
  ): string | null {
    if (
      ts.isIdentifier(callExpression.expression) &&
      callExpression.expression.text === 'inject'
    ) {
      const firstArg = callExpression.arguments[0];
      if (firstArg && ts.isIdentifier(firstArg)) {
        return firstArg.text;
      }
    }
    return null;
  }

  private looksLikeService(property: ts.PropertyDeclaration): boolean {
    if (!property.type) return false;
    let typeText = '';
    if (
      ts.isTypeReferenceNode(property.type) &&
      ts.isIdentifier(property.type.typeName)
    ) {
      typeText = property.type.typeName.text;
    } else {
      return false;
    }
    const servicePatterns = [
      'Service',
      'Repository',
      'Store',
      'Client',
      'Manager',
      'Provider',
      'Factory',
      'Helper',
      'Utility',
    ];
    return servicePatterns.some((pattern) => typeText.includes(pattern));
  }
}
