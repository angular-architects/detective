"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcComplexity = calcComplexity;
var ts = __importStar(require("typescript"));
var fs = __importStar(require("fs"));
function calcComplexity(fileName) {
    var code = fs.readFileSync(fileName, "utf-8");
    return calcComplexityForCode(code);
}
function calcComplexityForCode(sourceCode) {
    var sourceFile = ts.createSourceFile("temp.ts", sourceCode, ts.ScriptTarget.Latest, true);
    var complexity = 1;
    function visit(node) {
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
