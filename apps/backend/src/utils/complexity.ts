import * as fs from 'fs';

import * as ts from 'typescript';

export function calcCyclomaticComplexity(fileName: string): number {
  const code = fs.readFileSync(fileName, 'utf-8');
  return calcComplexityForCode(code);
}

export function calcComplexityForCode(sourceCode: string): number {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  return calcComplexityForNode(sourceFile);
}

// Calculates cyclomatic complexity for a specific AST node
// Mirrors the logic used for method-level complexity across analyzers
export function calcComplexityForNode(node: ts.Node): number {
  let complexity = 1;

  const visit = (n: ts.Node) => {
    switch (n.kind) {
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement:
      case ts.SyntaxKind.SwitchStatement:
      case ts.SyntaxKind.CatchClause:
      case ts.SyntaxKind.ConditionalExpression:
      case ts.SyntaxKind.CaseClause:
        complexity++;
        break;
    }
    ts.forEachChild(n, visit);
  };

  visit(node);
  return complexity;
}
