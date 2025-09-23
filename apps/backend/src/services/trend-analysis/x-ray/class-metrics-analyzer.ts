import * as ts from 'typescript';
import { z } from 'zod';

import { BaseMetricsAnalyzer } from './base-metrics-analyzer';
import { ClassComplexityMetric } from './metrics/class-complexity.metric';
import { ClassDependenciesMetric } from './metrics/class-dependencies.metric';
import { DuplicateCodeAnalyzer } from './metrics/duplicate-code-analyzer';
import { ReasonsToChangeMetric } from './metrics/reasons-to-change.metric';
import { UnusedMembersMetric } from './metrics/unused-members.metric';
import { ClassMetrics, AnalyzerContext } from './x-ray-metrics.types';

export class ClassMetricsAnalyzer extends BaseMetricsAnalyzer {
  private duplicateAnalyzer: DuplicateCodeAnalyzer;
  private reasonsMetric: ReasonsToChangeMetric;
  private dependencyMetric: ClassDependenciesMetric;
  private unusedMetric: UnusedMembersMetric;
  private complexityMetric: ClassComplexityMetric;

  constructor(context: AnalyzerContext) {
    super(context);
    this.duplicateAnalyzer = new DuplicateCodeAnalyzer();
    this.reasonsMetric = new ReasonsToChangeMetric();
    this.dependencyMetric = new ClassDependenciesMetric();
    this.unusedMetric = new UnusedMembersMetric();
    this.complexityMetric = new ClassComplexityMetric();
  }

  static getMeta() {
    // Collect metadata from all metric analyzers
    const complexityMeta = ClassComplexityMetric.getMetadata();
    const dependencyMeta = ClassDependenciesMetric.getMetadata();
    const duplicateMeta = DuplicateCodeAnalyzer.getMeta();
    const reasonsMeta = ReasonsToChangeMetric.getMetadata();
    const unusedMeta = UnusedMembersMetric.getMetadata();

    // Compose the schema from all metrics
    const composedSchema = z.object({
      ...complexityMeta.schema.shape,
      ...dependencyMeta.schema.shape,
      ...duplicateMeta.schema.shape,
      ...reasonsMeta.schema.shape,
      ...unusedMeta.schema.shape,
    });

    // Compose UI configuration
    const allMetrics = [
      ...complexityMeta.ui.metrics,
      ...dependencyMeta.ui.metrics,
      ...reasonsMeta.ui.metrics,
      ...unusedMeta.ui.metrics,
    ];

    const allSections = [
      ...(reasonsMeta.ui.sections ?? []),
      ...(duplicateMeta.ui.sections ?? []),
      ...(unusedMeta.ui.sections ?? []),
    ];

    return {
      schema: composedSchema,
      ui: {
        kind: 'tab',
        id: 'classes',
        title: 'Classes ({{count}})',
        icon: 'class',
        collection: 'metrics.classLevel',
        hideIfEmpty: true,
        itemTitle: '{{key}}',
        metrics: allMetrics,
        badges: complexityMeta.ui.badges,
        sections: allSections,
      },
      dictionaries: {},
    } as const;
  }

  async analyze(): Promise<{ classLevel: Record<string, ClassMetrics> }> {
    const classMetrics: Record<string, ClassMetrics> = {};
    const classes: ts.ClassDeclaration[] = [];
    const collect = (n: ts.Node) => {
      if (ts.isClassDeclaration(n)) classes.push(n);
      ts.forEachChild(n, collect);
    };
    collect(this.context.sourceFile);

    for (const node of classes) {
      const className = node.name?.text || 'AnonymousClass';
      classMetrics[className] = await this.analyzeClass(node);
    }

    return { classLevel: classMetrics };
  }

  async analyzeClass(node: ts.ClassDeclaration): Promise<ClassMetrics> {
    // Collect metrics
    const [
      complexity,
      dependencyAnalysis,
      reasonsMetric,
      unusedMembersResult,
      duplicateAnalysis,
    ] = await Promise.all([
      this.complexityMetric.analyzeAsync({ ...this.context, scopeNode: node }),
      this.dependencyMetric.analyzeAsync({ ...this.context, scopeNode: node }),
      this.reasonsMetric.analyzeAsync({ ...this.context, scopeNode: node }),
      this.unusedMetric.analyzeAsync({ ...this.context, scopeNode: node }),
      this.duplicateAnalyzer.analyze(
        this.context.sourceFile.fileName,
        this.context.sourceCode
      ),
    ]);

    const duplicateBlocks = this.duplicateAnalyzer.getDuplicateCountForClass(
      duplicateAnalysis.duplicateInfo,
      node,
      this.context.sourceFile
    );
    const duplicateDetails = this.duplicateAnalyzer.getDuplicateDetailsForClass(
      duplicateAnalysis.duplicateInfo,
      node,
      this.context.sourceFile
    );

    // Build the complete metrics object
    return {
      // Member metrics
      methods: complexity.methods,
      fields: complexity.fields,
      onlyGettersSetters: complexity.onlyGettersSetters,
      isGodClass: complexity.isGodClass,

      // Complexity metrics
      cyclomaticComplexity: complexity.cyclomaticComplexity,
      fileComplexity: complexity.fileComplexity,

      // Dependency metrics
      dependencies: dependencyAnalysis.count,

      // Reasons to change metrics
      reasonsToChange: reasonsMetric.score,
      reasonsCategories: reasonsMetric.reasonsCategories,
      externalPackages: reasonsMetric.externalPackages,
      layerCrossing: reasonsMetric.layerCrossing,
      internalFiles: reasonsMetric.internalFiles,

      // Code quality metrics
      unusedMembers: unusedMembersResult.unusedMembers,
      unusedMemberNames: unusedMembersResult.unusedMemberNames,
      duplicateBlocks,
      duplicateDetails,
    };
  }
}
