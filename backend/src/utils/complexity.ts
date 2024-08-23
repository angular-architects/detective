import * as ts from "typescript";
import * as fs from "fs";

export function calcComplexity(fileName: string): number {
  const code = fs.readFileSync(fileName, "utf-8");
  return calcComplexityForCode(code);
}

function calcComplexityForCode(sourceCode: string): number {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  let complexity = 1;

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.ConditionalExpression:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.CaseClause:
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.MethodDeclaration:
      case ts.SyntaxKind.Constructor:
      case ts.SyntaxKind.ArrowFunction:
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.CatchClause:
        complexity++;
        break;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return complexity;
}
