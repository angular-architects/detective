import * as ts from 'typescript';
import { z } from 'zod';

import { calcComplexityForNode } from '../../../utils/complexity';

import { BaseMetricsAnalyzer } from './base-metrics-analyzer';
import { MethodResponsibilityMetric } from './metrics/method-responsibility-metric';
import { NestedConditionsMetric } from './metrics/nested-conditions-metric';
import { Dictionaries, TabFragment } from './ui-schema.types';
import { MethodMetrics } from './x-ray-metrics.types';

export class MethodMetricsAnalyzer extends BaseMetricsAnalyzer {
  static getMeta() {
    const responsibilityMeta = MethodResponsibilityMetric.getMeta();
    const nestingMeta = NestedConditionsMetric.getMeta();

    return {
      schema: z
        .object({
          lines: z.number().describe('Lines of code in the function/method.'),
          parameters: z.number().describe('Number of parameters.'),
          cyclomaticComplexity: z
            .number()
            .describe('Independent paths through the method.'),
          hasComments: z
            .boolean()
            .describe('Whether the method has leading comments.'),
          className: z.string().optional().describe('Owning class, if any.'),
          responsibilitiesCategories: z
            .array(z.string())
            .optional()
            .describe('Categories detected for responsibilities.'),
        })
        .merge(nestingMeta.schema)
        .merge(responsibilityMeta.schema),
      ui: {
        kind: 'tab',
        id: 'methods',
        title: 'Methods ({{count}})',
        icon: 'functions',
        collection: 'metrics.methodLevel',
        hideIfEmpty: true,
        itemTitle: '{{key}}',
        badges: [{ label: '{{value.className}}', if: 'value.className' }],
        metrics: [
          {
            path: 'lines',
            label: 'Lines',
            icon: 'format_list_numbered',
            tooltip: 'Prefer small, cohesive methods.',
            threshold: { warnGte: 30 },
            refLink: 'https://en.wikipedia.org/wiki/Source_lines_of_code',
          },
          {
            path: 'parameters',
            label: 'Parameters',
            icon: 'input',
            tooltip: 'Consider DTO if many parameters.',
            threshold: { warnGte: 4 },
            refLink: 'https://martinfowler.com/bliki/FunctionLength.html',
          },
          {
            path: 'cyclomaticComplexity',
            label: 'Complexity',
            icon: 'account_tree',
            tooltip: 'Lower is better.',
            threshold: { warnGte: 12 },
            refLink: 'https://en.wikipedia.org/wiki/Cyclomatic_complexity',
          },
          ...nestingMeta.ui.metrics,
          ...responsibilityMeta.ui.metrics,
        ],
      } as TabFragment,
      dictionaries: {
        categoryDescriptions: {
          networking: 'Interacts with remote services.',
          storage: 'Uses storage/persistence.',
          dom: 'Manipulates DOM/globals.',
          logging: 'Performs logging.',
          internal: 'Uses internal modules/types.',
          navigation: 'Router/navigation interactions.',
          state: 'State management.',
          'state-effects': 'Reactive side-effects layer.',
          forms: 'Angular forms.',
          reactive: 'RxJS/observables.',
          ui: 'UI libraries/components.',
          'change-detection': 'ChangeDetectorRef usage.',
          zone: 'NgZone usage.',
          'angular-core': 'Angular core baseline usage (neutral).',
        },
        categoryIcons: {
          networking: 'cloud',
          storage: 'save',
          dom: 'web',
          logging: 'bug_report',
          internal: 'home_repair_service',
          navigation: 'route',
          state: 'hub',
          'state-effects': 'bolt',
          forms: 'assignment',
          reactive: 'sync',
          ui: 'palette',
          'change-detection': 'refresh',
          zone: 'donut_large',
          'angular-core': 'angular',
        },
      } as Dictionaries,
    } as const;
  }

  async analyze(): Promise<{ methodLevel: Record<string, MethodMetrics> }> {
    const methodLevel = this.collectMethodMetrics();
    return Promise.resolve({ methodLevel });
  }

  private collectMethodMetrics(): Record<string, MethodMetrics> {
    const methodMetrics: Record<string, MethodMetrics> = {};

    const visitNode = (node: ts.Node, currentClassName?: string) => {
      if (ts.isClassDeclaration(node)) {
        const className = node.name?.text || 'AnonymousClass';
        ts.forEachChild(node, (child) => visitNode(child, className));
        return;
      }

      if (
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isArrowFunction(node) ||
        ts.isFunctionExpression(node)
      ) {
        const methodName = this.getMethodName(
          node as ts.FunctionLikeDeclaration
        );
        const metrics = this.analyzeMethod(node as ts.FunctionLikeDeclaration);
        metrics.className = currentClassName;

        const methodKey = currentClassName
          ? `${currentClassName}.${methodName}`
          : methodName;
        methodMetrics[methodKey] = metrics;
        return;
      }

      ts.forEachChild(node, (child) => visitNode(child, currentClassName));
    };

    visitNode(this.context.sourceFile);
    return methodMetrics;
  }

  analyzeMethod(node: ts.FunctionLikeDeclaration): MethodMetrics {
    const responsibilityMetric = new MethodResponsibilityMetric();
    const nestedConditionsMetric = new NestedConditionsMetric();

    const { responsibilities, categories, writesThis, mutatesParams } =
      responsibilityMetric.analyze(this.context, node);
    return {
      lines: this.countLines(node),
      parameters: node.parameters.length,
      cyclomaticComplexity: calcComplexityForNode(node),
      nestedConditions: nestedConditionsMetric.analyze(node),
      hasComments: this.hasComments(node),
      responsibilities,
      className: undefined, // Will be set by analyze() method
      responsibilitiesCategories: Array.from(categories),
      writesThis,
      mutatesParams,
    };
  }

  private hasComments(node: ts.Node): boolean {
    const commentRanges = ts.getLeadingCommentRanges(
      this.context.sourceFile.text,
      node.pos
    );
    return commentRanges && commentRanges.length > 0;
  }
}
