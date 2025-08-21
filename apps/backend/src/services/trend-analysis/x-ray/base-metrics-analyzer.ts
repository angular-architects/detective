import * as ts from 'typescript';

import { AnalyzerContext, type CodeMetrics } from './x-ray-metrics.types';

export abstract class BaseMetricsAnalyzer {
  protected context: AnalyzerContext;

  constructor(context: AnalyzerContext) {
    this.context = context;
  }

  protected countLines(node: ts.Node): number {
    const start = this.context.sourceFile.getLineAndCharacterOfPosition(
      node.getStart()
    );
    const end = this.context.sourceFile.getLineAndCharacterOfPosition(
      node.getEnd()
    );
    return end.line - start.line + 1;
  }

  protected getMethodName(node: ts.FunctionLikeDeclaration): string {
    if (ts.isFunctionDeclaration(node) && node.name) {
      return node.name.text;
    }
    if (ts.isMethodDeclaration(node) && node.name) {
      return node.name.getText();
    }
    return 'anonymous';
  }

  // Each analyzer must implement its own analysis routine (always async)
  // Returns a partial of CodeMetrics.metrics keyed by the analyzer's domain
  abstract analyze(): Promise<Partial<CodeMetrics['metrics']>>;
}
