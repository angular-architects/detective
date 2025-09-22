import * as ts from 'typescript';
import { z } from 'zod';

export class NestedConditionsMetric {
  static getMeta() {
    return {
      schema: z.object({
        nestedConditions: z
          .number()
          .describe('Maximum nesting depth of conditionals within the method.'),
      }),
      ui: {
        metrics: [
          {
            path: 'nestedConditions',
            label: 'Nesting',
            icon: 'layers',
            threshold: { warnGte: 3 },
            tooltip: 'Reduce nesting for readability and maintainability.',
            refLink: 'https://refactoring.guru/smells/deeply-nested-code',
          },
        ],
      },
    } as const;
  }
  /**
   * Counts the maximum nesting depth of conditional statements in a TypeScript node.
   * Tracks if/while/for/switch statements and returns the deepest level found.
   */
  analyze(node: ts.Node): number {
    let maxDepth = 0;
    let currentDepth = 0;

    const visit = (node: ts.Node) => {
      const isConditional = this.isConditionalStatement(node);

      if (isConditional) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }

      ts.forEachChild(node, visit);

      if (isConditional) {
        currentDepth--;
      }
    };

    visit(node);
    return maxDepth;
  }

  private isConditionalStatement(node: ts.Node): boolean {
    return (
      node.kind === ts.SyntaxKind.IfStatement ||
      node.kind === ts.SyntaxKind.WhileStatement ||
      node.kind === ts.SyntaxKind.ForStatement ||
      node.kind === ts.SyntaxKind.ForInStatement ||
      node.kind === ts.SyntaxKind.ForOfStatement ||
      node.kind === ts.SyntaxKind.SwitchStatement ||
      node.kind === ts.SyntaxKind.ConditionalExpression ||
      node.kind === ts.SyntaxKind.DoStatement
    );
  }
}
