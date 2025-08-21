import * as fs from 'fs';

import * as ts from 'typescript';

import { BaseMetricsAnalyzer } from './base-metrics-analyzer';
import { ClassMetricsAnalyzer } from './class-metrics-analyzer';
import { DataStructureMetricsAnalyzer } from './data-structure-metrics-analyzer';
import { MethodMetricsAnalyzer } from './method-metrics-analyzer';
import { OrganizationMetricsAnalyzer } from './organization-metrics-analyzer';
import { TypeScriptMetricsAnalyzer } from './typescript-metrics-analyzer';
import { CodeMetrics, AnalyzerContext } from './x-ray-metrics.types';
import {
  buildXRayUISchemaFromAnalyzers,
  buildXRayJSONSchemaFromAnalyzers,
} from './x-ray.schema';
export class CodeAnalyzer {
  private context: AnalyzerContext;
  private analyzers: BaseMetricsAnalyzer[] = [];

  static buildUISchema() {
    return buildXRayUISchemaFromAnalyzers();
  }
  static buildJSONSchema() {
    return buildXRayJSONSchemaFromAnalyzers();
  }

  constructor(filePath: string) {
    const sourceCode = fs.readFileSync(filePath, 'utf8');

    const program = ts.createProgram([filePath], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      allowJs: true,
    });

    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
      throw new Error(`Unable to load source file: ${filePath}`);
    }
    const checker = program.getTypeChecker();

    this.context = {
      sourceFile,
      checker,
      program,
      sourceCode,
    };

    const ctors: Array<new (context: AnalyzerContext) => BaseMetricsAnalyzer> =
      [
        MethodMetricsAnalyzer,
        ClassMetricsAnalyzer,
        DataStructureMetricsAnalyzer,
        OrganizationMetricsAnalyzer,
        TypeScriptMetricsAnalyzer,
      ];
    this.analyzers = ctors.map((Ctor) => new Ctor(this.context));
  }

  async analyze(includeSource = false): Promise<CodeMetrics> {
    const parts = await Promise.all(this.analyzers.map((a) => a.analyze()));
    const metrics = Object.assign({}, ...parts) as CodeMetrics['metrics'];

    const result: CodeMetrics = {
      file: this.context.sourceFile.fileName,
      metrics,
    };

    if (includeSource) {
      result.sourceCode = this.context.sourceCode;
    }

    return result;
  }
}
