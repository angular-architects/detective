import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../x-ray-metrics.types';

import { BaseMetric } from './metric.base';
import { Metric } from './metric.decorator';

export interface UnusedMembersMetricResult {
  unusedMembers: number;
  unusedMemberNames: string[];
}

@Metric({
  schema: z.object({
    unusedMembers: z
      .number()
      .describe(
        'Count of private and super private (#) members (including constructor parameter properties) unused within the class.'
      ),
    unusedMemberNames: z
      .array(z.string())
      .optional()
      .describe('Names of the private members that are unused.'),
  }),
  ui: {
    metrics: [
      {
        path: 'unusedMembers',
        label: 'Unused',
        icon: 'remove_circle_outline',
        threshold: { warnGte: 1 },
        tooltip:
          'Private and super private (#) members (including constructor parameter properties) unused within the class.',
        refLink: 'https://refactoring.guru/smells/dead-code',
      },
    ],
    sections: [
      {
        type: 'list',
        title: 'Unused Members',
        path: 'unusedMemberNames',
        icon: 'list',
      },
    ],
  },
})
export class UnusedMembersMetric extends BaseMetric<UnusedMembersMetricResult> {
  analyze(context: AnalyzerContext): UnusedMembersMetricResult {
    const targetNode = context.scopeNode;
    if (!targetNode || !ts.isClassDeclaration(targetNode)) {
      return { unusedMembers: 0, unusedMemberNames: [] };
    }

    const privateMembers = this.getPrivateMembers(targetNode);
    const usedMembers = this.getUsedMemberNames(targetNode);

    const unusedMembers = privateMembers
      .filter((member) => !usedMembers.has(member.name))
      .map((member) => member.name);

    return {
      unusedMembers: unusedMembers.length,
      unusedMemberNames: unusedMembers,
    };
  }

  private getPrivateMembers(classDecl: ts.ClassDeclaration): Array<{
    name: string;
    isPrivate: boolean;
  }> {
    const ctorParams = this.collectPrivateCtorParams(classDecl);
    const classMembers = this.collectPrivateClassMembers(classDecl);
    return [...ctorParams, ...classMembers];
  }

  private collectPrivateCtorParams(classDecl: ts.ClassDeclaration): Array<{
    name: string;
    isPrivate: boolean;
  }> {
    const results: Array<{ name: string; isPrivate: boolean }> = [];
    for (const member of classDecl.members) {
      if (!ts.isConstructorDeclaration(member)) continue;
      for (const param of member.parameters) {
        if (this.hasPrivateModifier(param)) {
          const paramName = this.toName(param.name);
          if (paramName) {
            results.push({ name: paramName, isPrivate: true });
          }
        }
      }
    }
    return results;
  }

  private collectPrivateClassMembers(classDecl: ts.ClassDeclaration): Array<{
    name: string;
    isPrivate: boolean;
  }> {
    const results: Array<{ name: string; isPrivate: boolean }> = [];
    for (const member of classDecl.members) {
      if (ts.isConstructorDeclaration(member)) continue;
      const nameNode = ts.getNameOfDeclaration(member);
      if (nameNode && ts.isPrivateIdentifier(nameNode)) {
        results.push({ name: nameNode.text, isPrivate: true });
        continue;
      }
      if (this.hasPrivateModifier(member)) {
        const nameStr = this.toName(nameNode);
        if (nameStr) {
          results.push({ name: nameStr, isPrivate: true });
        }
      }
    }
    return results;
  }

  private hasPrivateModifier(node: ts.Declaration): boolean {
    const flags = ts.getCombinedModifierFlags(node);
    return (flags & ts.ModifierFlags.Private) !== 0;
  }

  private toName(name: ts.DeclarationName | undefined): string | undefined {
    if (!name) return undefined;
    if (ts.isIdentifier(name)) return name.text;
    if (ts.isPrivateIdentifier(name)) return name.text;
    if (ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
    if (ts.isComputedPropertyName(name)) {
      const expr = name.expression;
      if (ts.isStringLiteral(expr) || ts.isNumericLiteral(expr))
        return expr.text;
      return undefined;
    }
    return undefined;
  }

  private getUsedMemberNames(classDecl: ts.ClassDeclaration): Set<string> {
    const usedMembers = new Set<string>();
    const className = classDecl.name?.text;

    const addIfThisPropertyAccess = (node: ts.Node): void => {
      if (!ts.isPropertyAccessExpression(node)) return;
      if (node.expression.kind !== ts.SyntaxKind.ThisKeyword) return;
      const name = node.name as ts.Identifier | ts.PrivateIdentifier;
      if (ts.isIdentifier(name)) usedMembers.add(name.text);
      else if (ts.isPrivateIdentifier(name)) usedMembers.add(name.text);
    };

    const addIfThisElementAccess = (node: ts.Node): void => {
      if (!ts.isElementAccessExpression(node)) return;
      if (node.expression.kind !== ts.SyntaxKind.ThisKeyword) return;
      const arg = node.argumentExpression;
      if (arg && ts.isStringLiteral(arg)) usedMembers.add(arg.text);
    };

    const addIfClassPropertyAccess = (node: ts.Node): void => {
      if (!ts.isPropertyAccessExpression(node)) return;
      if (!className) return;
      let expr: ts.Expression = node.expression;
      // unwrap parentheses and type assertions/casts
      while (
        ts.isParenthesizedExpression(expr) ||
        ts.isAsExpression(expr) ||
        ts.isTypeAssertionExpression(expr)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expr = (expr as any).expression as ts.Expression;
      }
      if (!ts.isIdentifier(expr) || expr.text !== className) return;
      const name = node.name as ts.Identifier | ts.PrivateIdentifier;
      if (ts.isIdentifier(name)) usedMembers.add(name.text);
      else if (ts.isPrivateIdentifier(name)) usedMembers.add(name.text);
    };

    const addIfClassElementAccess = (node: ts.Node): void => {
      if (!ts.isElementAccessExpression(node)) return;
      if (!className) return;
      let expr: ts.Expression = node.expression;
      while (
        ts.isParenthesizedExpression(expr) ||
        ts.isAsExpression(expr) ||
        ts.isTypeAssertionExpression(expr)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expr = (expr as any).expression as ts.Expression;
      }
      if (!ts.isIdentifier(expr) || expr.text !== className) return;
      const arg = node.argumentExpression;
      if (arg && ts.isStringLiteral(arg)) usedMembers.add(arg.text);
    };

    const visit = (node: ts.Node): void => {
      addIfThisPropertyAccess(node);
      addIfThisElementAccess(node);
      addIfClassPropertyAccess(node);
      addIfClassElementAccess(node);
      ts.forEachChild(node, visit);
    };

    ts.forEachChild(classDecl, visit);
    return usedMembers;
  }
}
