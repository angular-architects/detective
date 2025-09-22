import {
  createWrappedNode,
  ClassDeclaration as MorphClassDeclaration,
  Node as MorphNode,
  SyntaxKind,
  ts as tsMorph,
} from 'ts-morph';
import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../x-ray-metrics.types';

import { BaseMetric } from './metric.base';
import { Metric } from './metric.decorator';

@Metric({
  schema: z.object({
    unusedMembers: z
      .number()
      .describe(
        'Count of private and super private (#) members (including constructor parameter properties) unused within the class.'
      ),
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
  },
})
export class UnusedMembersMetric extends BaseMetric<number> {
  analyze(context: AnalyzerContext): number {
    const targetNode = context.scopeNode;
    if (!targetNode || !ts.isClassDeclaration(targetNode)) {
      return 0;
    }

    const classDecl = createWrappedNode(
      targetNode as unknown as tsMorph.Node
    ).asKindOrThrow(SyntaxKind.ClassDeclaration);

    const privateMembers = this.getPrivateMembers(classDecl);
    const usedMembers = this.getUsedMemberNames(classDecl);

    const unusedMembers = privateMembers
      .filter((member) => !usedMembers.has(member.name))
      .map((member) => member.name);

    return unusedMembers.length;
  }

  private getPrivateMembers(classDecl: MorphClassDeclaration): Array<{
    name: string;
    isPrivate: boolean;
    isSuperPrivate: boolean;
  }> {
    const members: Array<{
      name: string;
      isPrivate: boolean;
      isSuperPrivate: boolean;
    }> = [];

    classDecl.getConstructors().forEach((constructor) => {
      constructor.getParameters().forEach((param) => {
        if (param.hasModifier('private')) {
          members.push({
            name: param.getName(),
            isPrivate: true,
            isSuperPrivate: false,
          });
        }
      });
    });

    const privateMethods = classDecl
      .getMethods()
      .filter((m) => m.hasModifier('private'));
    const privateProperties = classDecl
      .getProperties()
      .filter((p) => p.hasModifier('private'));
    const privateGetters = classDecl
      .getGetAccessors()
      .filter((a) => a.hasModifier('private'));
    const privateSetters = classDecl
      .getSetAccessors()
      .filter((a) => a.hasModifier('private'));

    [
      ...privateMethods,
      ...privateProperties,
      ...privateGetters,
      ...privateSetters,
    ].forEach((member) => {
      members.push({
        name: member.getName(),
        isPrivate: true,
        isSuperPrivate: false,
      });
    });

    [
      ...classDecl.getMethods(),
      ...classDecl.getProperties(),
      ...classDecl.getGetAccessors(),
      ...classDecl.getSetAccessors(),
    ].forEach((member) => {
      const name = member.getName();
      if (name.startsWith('#')) {
        members.push({
          name,
          isPrivate: true,
          isSuperPrivate: true,
        });
      }
    });

    return members;
  }

  private getUsedMemberNames(classDecl: MorphClassDeclaration): Set<string> {
    const usedMembers = new Set<string>();

    classDecl.forEachDescendant((node) => {
      if (MorphNode.isPropertyAccessExpression(node)) {
        const expression = node.getExpression();
        if (MorphNode.isThisExpression(expression)) {
          usedMembers.add(node.getName());
        }
      }

      if (MorphNode.isElementAccessExpression(node)) {
        const expression = node.getExpression();
        const argument = node.getArgumentExpression();
        if (
          MorphNode.isThisExpression(expression) &&
          MorphNode.isStringLiteral(argument)
        ) {
          usedMembers.add(argument.getLiteralValue());
        }
      }

      if (MorphNode.isCallExpression(node)) {
        const expression = node.getExpression();
        if (MorphNode.isIdentifier(expression)) {
          usedMembers.add(expression.getText());
        }
      }
    });

    return usedMembers;
  }
}
