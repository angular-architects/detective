import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../x-ray-metrics.types';

interface ResponsibilityAnalysisResult {
  responsibilities: number;
  categories: Set<string>;
  writesThis: boolean;
  mutatesParams: boolean;
}

export class MethodResponsibilityMetric {
  static getMeta() {
    return {
      schema: z.object({
        responsibilities: z
          .number()
          .describe(
            'Distinct responsibility categories detected in the method.'
          ),
        writesThis: z
          .boolean()
          .optional()
          .describe('True if method writes to this.* or mutates this state.'),
        mutatesParams: z
          .boolean()
          .optional()
          .describe('True if method mutates its parameters.'),
      }),
      ui: {
        metrics: [
          {
            path: 'responsibilities',
            label: 'Responsibilities',
            icon: 'category',
            threshold: { warnGte: 4 },
            tooltip:
              'Higher means the method does many distinct kinds of work.',
            refLink: 'https://martinfowler.com/bliki/FunctionLength.html',
          },
          {
            path: 'writesThis',
            label: 'Writes this.*',
            icon: 'edit',
            tooltip: 'Method mutates object state (this.*).',
          },
          {
            path: 'mutatesParams',
            label: 'Mutates params',
            icon: 'sync_problem',
            tooltip: 'Method reassigns or mutates its parameters.',
          },
        ],
      },
    } as const;
  }
  private static readonly MUTATING_METHODS = new Set([
    'push',
    'pop',
    'splice',
    'shift',
    'unshift',
    'sort',
    'reverse',
    'copyWithin',
    'fill',
    'set',
    'add',
    'delete',
    'clear',
  ]);

  private static readonly ASSIGNMENT_OPERATORS = new Set([
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.AsteriskAsteriskEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.PercentEqualsToken,
    ts.SyntaxKind.LessThanLessThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.AmpersandEqualsToken,
    ts.SyntaxKind.BarEqualsToken,
    ts.SyntaxKind.CaretEqualsToken,
    ts.SyntaxKind.BarBarEqualsToken,
    ts.SyntaxKind.AmpersandAmpersandEqualsToken,
    ts.SyntaxKind.QuestionQuestionEqualsToken,
  ]);

  analyze(
    context: AnalyzerContext,
    node: ts.FunctionLikeDeclaration
  ): ResponsibilityAnalysisResult {
    const categories = new Set<string>();
    let writesThis = false;
    let mutatesParams = false;

    const parameterNames =
      MethodResponsibilityMetric.extractParameterNames(node);

    const visit = (n: ts.Node): void => {
      const bin = this.checkBinary(n, parameterNames);
      if (bin.writesThis) writesThis = true;
      if (bin.mutatesParams) mutatesParams = true;

      if (this.checkUnaryWritesThis(n)) writesThis = true;

      if (ts.isCallExpression(n)) {
        if (this.handleCall(n, context, categories)) writesThis = true;
      }

      ts.forEachChild(n, visit);
    };

    ts.forEachChild(node, visit);

    return {
      responsibilities: categories.size,
      categories,
      writesThis,
      mutatesParams,
    };
  }

  private static extractParameterNames(
    node: ts.FunctionLikeDeclaration
  ): Set<string> {
    return new Set(
      node.parameters.map((p) => (ts.isIdentifier(p.name) ? p.name.text : ''))
    );
  }

  private checkBinary(
    node: ts.Node,
    parameterNames: Set<string>
  ): { writesThis: boolean; mutatesParams: boolean } {
    if (!ts.isBinaryExpression(node))
      return { writesThis: false, mutatesParams: false };
    const isAssignment = MethodResponsibilityMetric.ASSIGNMENT_OPERATORS.has(
      node.operatorToken.kind
    );
    if (!isAssignment) return { writesThis: false, mutatesParams: false };
    return {
      writesThis: this.isThisPropertyAssignment(node.left),
      mutatesParams: this.isParameterMutation(node.left, parameterNames),
    };
  }

  private checkUnaryWritesThis(node: ts.Node): boolean {
    if (!ts.isPrefixUnaryExpression(node) && !ts.isPostfixUnaryExpression(node))
      return false;
    const operator = ts.isPrefixUnaryExpression(node)
      ? node.operator
      : node.operator;
    const operand = ts.isPrefixUnaryExpression(node)
      ? node.operand
      : node.operand;
    const isIncDec =
      operator === ts.SyntaxKind.PlusPlusToken ||
      operator === ts.SyntaxKind.MinusMinusToken;
    if (!isIncDec) return false;
    return this.isThisPropertyAccess(operand);
  }

  private handleCall(
    node: ts.CallExpression,
    context: AnalyzerContext,
    categories: Set<string>
  ): boolean {
    const expression = node.expression;
    this.categorizeGlobalUsage(expression.getText(), categories);
    const symbol = context.checker.getSymbolAtLocation(expression);
    if (symbol) this.categorizeByDeclarations(symbol, categories);
    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      this.categorizeByReceiverType(expression.expression, context, categories);
    }
    return this.isMutatingCallOnThisProperty(expression);
  }

  private isThisPropertyAssignment(node: ts.Expression): boolean {
    return (
      ts.isPropertyAccessExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ThisKeyword
    );
  }

  private isParameterMutation(
    node: ts.Expression,
    parameterNames: Set<string>
  ): boolean {
    return ts.isIdentifier(node) && parameterNames.has(node.text);
  }

  private isThisPropertyAccess(node: ts.Expression): boolean {
    return (
      ts.isPropertyAccessExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ThisKeyword
    );
  }

  private isMutatingCallOnThisProperty(expression: ts.Expression): boolean {
    if (ts.isPropertyAccessExpression(expression)) {
      return this.isMutatingPropertyCall(expression);
    }

    if (ts.isElementAccessExpression(expression)) {
      return this.isMutatingElementCall(expression);
    }

    return false;
  }

  private isMutatingPropertyCall(
    expression: ts.PropertyAccessExpression
  ): boolean {
    const methodName = expression.name.getText();
    const receiver = expression.expression;

    return (
      MethodResponsibilityMetric.MUTATING_METHODS.has(methodName) &&
      ts.isPropertyAccessExpression(receiver) &&
      receiver.expression.kind === ts.SyntaxKind.ThisKeyword
    );
  }

  private isMutatingElementCall(
    expression: ts.ElementAccessExpression
  ): boolean {
    const receiver = expression.expression;
    const argument = expression.argumentExpression;

    if (!ts.isStringLiteral(argument)) return false;

    const methodName = argument.text;
    return (
      MethodResponsibilityMetric.MUTATING_METHODS.has(methodName) &&
      ts.isPropertyAccessExpression(receiver) &&
      receiver.expression.kind === ts.SyntaxKind.ThisKeyword
    );
  }

  // Removed branching: global categorization always happens in handleCall

  private categorizeGlobalUsage(text: string, categories: Set<string>): void {
    if (text.startsWith('console')) categories.add('logging');
    if (text.startsWith('fetch')) categories.add('networking');
    if (text.startsWith('localStorage') || text.startsWith('sessionStorage')) {
      categories.add('storage');
    }
    if (text.startsWith('document') || text.startsWith('window')) {
      categories.add('dom');
    }
    if (
      text.startsWith('setTimeout') ||
      text.startsWith('setInterval') ||
      text.startsWith('Date')
    ) {
      categories.add('time');
    }
  }

  private categorizeByDeclarations(
    symbol: ts.Symbol,
    categories: Set<string>
  ): void {
    const declarations = symbol.getDeclarations() || [];
    for (const declaration of declarations) {
      const sourceFile = declaration.getSourceFile().fileName;
      if (!sourceFile.includes('node_modules')) categories.add('internal');
    }
  }

  private categorizeByReceiverType(
    receiver: ts.Expression,
    context: AnalyzerContext,
    categories: Set<string>
  ): void {
    const type = context.checker.getTypeAtLocation(receiver);
    const typeSymbol = type.getSymbol();
    const typeName = typeSymbol?.getName();
    const declarations = typeSymbol?.getDeclarations() || [];
    const sourceFiles = declarations.map((d) => d.getSourceFile().fileName);

    this.categorizeByTypeName(typeName, sourceFiles, categories);
  }

  private static readonly TYPE_CATEGORY_RULES: ReadonlyArray<{
    category: string;
    typeNames?: readonly string[];
    sourceIncludesAll?: readonly string[];
    sourceIncludesAny?: readonly string[];
  }> = [
    {
      category: 'networking',
      typeNames: ['HttpClient'],
      sourceIncludesAny: ['@angular/common/http'],
    },
    {
      category: 'navigation',
      typeNames: ['Router'],
      sourceIncludesAny: ['@angular/router'],
    },
    {
      category: 'change-detection',
      typeNames: ['ChangeDetectorRef'],
      sourceIncludesAll: ['@angular/core', 'change_detector'],
    },
    {
      category: 'zone',
      typeNames: ['NgZone'],
      sourceIncludesAll: ['@angular/core', 'zone'],
    },
    {
      category: 'dom',
      typeNames: ['Renderer2'],
      sourceIncludesAll: ['@angular/core', 'renderer'],
    },
    {
      category: 'dom',
      typeNames: ['Document', 'Window'],
      sourceIncludesAny: ['lib.dom.d.ts'],
    },
    {
      category: 'state',
      typeNames: ['Store'],
      sourceIncludesAny: ['@ngrx/store'],
    },
    { category: 'state-effects', sourceIncludesAny: ['@ngrx/effects'] },
    {
      category: 'forms',
      typeNames: ['FormBuilder', 'FormControl'],
      sourceIncludesAny: ['@angular/forms'],
    },
  ];

  private categorizeByTypeName(
    typeName: string | undefined,
    sourceFiles: string[],
    categories: Set<string>
  ): void {
    for (const rule of MethodResponsibilityMetric.TYPE_CATEGORY_RULES) {
      const nameMatch = rule.typeNames?.includes(typeName ?? '') ?? false;
      const anyMatch =
        rule.sourceIncludesAny?.some((s) =>
          sourceFiles.some((f) => f.includes(s))
        ) ?? false;
      const allMatch =
        rule.sourceIncludesAll?.every((s) =>
          sourceFiles.some((f) => f.includes(s))
        ) ?? false;
      if (nameMatch || anyMatch || allMatch) {
        categories.add(rule.category);
      }
    }
  }
}
