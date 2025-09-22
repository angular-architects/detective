import * as ts from 'typescript';
import { z } from 'zod';

import { calcComplexityForNode } from '../../../../utils/complexity';
import { AnalyzerContext } from '../x-ray-metrics.types';

import { BaseMetric } from './metric.base';
import { Metric } from './metric.decorator';

export interface ClassComplexityMetricResult {
  methods: number;
  fields: number;
  onlyGettersSetters: boolean;
  isGodClass: boolean;
  cyclomaticComplexity: number;
  fileComplexity: number;
}

@Metric({
  schema: z.object({
    methods: z.number().describe('Number of methods and accessors.'),
    fields: z.number().describe('Number of field/property declarations.'),
    cyclomaticComplexity: z
      .number()
      .describe(
        'Cyclomatic complexity of the class (sum of branching constructs inside the class body).'
      ),
    fileComplexity: z
      .number()
      .describe('Cyclomatic complexity of the entire file.'),
    isGodClass: z.boolean().describe('True if methods > 30 or fields > 20.'),
    onlyGettersSetters: z
      .boolean()
      .describe('True if all methods are accessors.'),
  }),
  ui: {
    metrics: [
      {
        path: 'methods',
        label: 'Methods',
        icon: 'functions',
        refLink: 'https://refactoring.guru/smells/large-class',
      },
      {
        path: 'fields',
        label: 'Fields',
        icon: 'storage',
        refLink: 'https://refactoring.guru/smells/large-class',
      },
      {
        path: 'cyclomaticComplexity',
        label: 'Class Complexity',
        icon: 'account_tree',
        threshold: { warnGte: 25 },
        tooltip: 'Aggregate branching complexity within the class.',
        refLink: 'https://en.wikipedia.org/wiki/Cyclomatic_complexity',
      },
      {
        path: 'fileComplexity',
        label: 'File Complexity',
        icon: 'schema',
        threshold: { warnGte: 30 },
        tooltip: 'Cyclomatic complexity measured at file scope.',
        refLink: 'https://en.wikipedia.org/wiki/Cyclomatic_complexity',
      },
    ],
    badges: [
      { label: 'God Class', class: 'warning', if: 'value.isGodClass' },
      { label: 'Data Class', class: 'info', if: 'value.onlyGettersSetters' },
    ],
  },
})
export class ClassComplexityMetric extends BaseMetric<ClassComplexityMetricResult> {
  analyze(context: AnalyzerContext): ClassComplexityMetricResult {
    const classNode =
      context.scopeNode && ts.isClassDeclaration(context.scopeNode)
        ? context.scopeNode
        : undefined;

    const { methods, fields, onlyGettersSetters } = classNode
      ? this.analyzeClassMembers(classNode)
      : { methods: 0, fields: 0, onlyGettersSetters: false };

    const cyclomaticComplexity = classNode
      ? this.calculateClassComplexity(classNode, context.sourceFile)
      : calcComplexityForNode(context.sourceFile);

    const fileComplexity = calcComplexityForNode(context.sourceFile);

    const isGodClass = methods > 30 || fields > 20;

    return {
      methods,
      fields,
      onlyGettersSetters,
      isGodClass,
      cyclomaticComplexity,
      fileComplexity,
    };
  }

  private calculateClassComplexity(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
  ): number {
    const functionLikeNodes = this.collectFunctionLikeNodes(node);

    let classComplexity: number;
    if (functionLikeNodes.length > 0) {
      const total = functionLikeNodes.reduce(
        (sum, fn) => sum + calcComplexityForNode(fn),
        0
      );
      classComplexity = Math.max(1, total - (functionLikeNodes.length - 1));
    } else {
      classComplexity = calcComplexityForNode(node);
    }

    const fileComplexity = calcComplexityForNode(sourceFile);
    if (this.isOnlyClassInFile(sourceFile)) {
      classComplexity = fileComplexity;
    }
    return classComplexity;
  }

  private collectFunctionLikeNodes(
    node: ts.ClassDeclaration
  ): ts.FunctionLikeDeclaration[] {
    const functionLikeNodes: ts.FunctionLikeDeclaration[] = [];
    node.members.forEach((member) => {
      if (
        ts.isMethodDeclaration(member) ||
        ts.isGetAccessorDeclaration(member) ||
        ts.isSetAccessorDeclaration(member)
      ) {
        functionLikeNodes.push(member);
      } else if (ts.isPropertyDeclaration(member)) {
        const init = member.initializer;
        if (
          init &&
          (ts.isArrowFunction(init) || ts.isFunctionExpression(init))
        ) {
          functionLikeNodes.push(init);
        }
      }
    });
    return functionLikeNodes;
  }

  private isOnlyClassInFile(sourceFile: ts.SourceFile): boolean {
    let classCount = 0;
    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        classCount++;
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return classCount === 1;
  }

  private analyzeClassMembers(node: ts.ClassDeclaration): {
    methods: number;
    fields: number;
    onlyGettersSetters: boolean;
  } {
    let methods = 0;
    let fields = 0;
    let onlyGettersSetters = true;

    node.members.forEach((member) => {
      if (
        ts.isMethodDeclaration(member) ||
        ts.isGetAccessorDeclaration(member) ||
        ts.isSetAccessorDeclaration(member)
      ) {
        methods++;
        if (
          ts.isMethodDeclaration(member) &&
          !this.isGetterOrSetter(member.name?.getText() || '')
        ) {
          onlyGettersSetters = false;
        }
      } else if (ts.isPropertyDeclaration(member)) {
        fields++;
      }
    });

    return { methods, fields, onlyGettersSetters };
  }

  private isGetterOrSetter(name: string): boolean {
    return name.startsWith('get') || name.startsWith('set');
  }
}
