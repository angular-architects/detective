import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../x-ray-metrics.types';

import { MethodResponsibilityMetric } from './method-responsibility-metric';
import { BaseMetric } from './metric.base';
import { Metric } from './metric.decorator';

export interface ReasonsToChangeMetricResult {
  score: number;
  reasonsCategories: string[];
  externalPackages: string[];
  internalFiles: string[];
  layerCrossing: boolean;
}

@Metric({
  schema: z.object({
    reasonsToChange: z
      .number()
      .describe(
        'How many different reasons this class might need to change. Higher means lower cohesion. We add: the variety of work its methods do, the variety of things it depends on, a small bump if it uses many external packages, and another if it mixes UI with state or I/O. Result is kept on a 1–10 scale.'
      ),
    reasonsCategories: z
      .array(z.string())
      .optional()
      .describe('Distinct categories contributing to reasons-to-change.'),
    externalPackages: z
      .array(z.string())
      .optional()
      .describe('External package roots used.'),
    layerCrossing: z
      .boolean()
      .optional()
      .describe('True if class mixes UI with IO/state.'),
    internalFiles: z
      .array(z.string())
      .optional()
      .describe('Internal files referenced by types used by this class.'),
  }),
  ui: {
    metrics: [
      {
        path: 'reasonsToChange',
        label: 'Reasons To Change',
        icon: 'change_circle',
        threshold: { warnGte: 6 },
        tooltip:
          'Estimate of how many reasons this class could change: method variety, dependency variety, external packages, and mixing UI with state/I/O. Higher is worse (1–10). (Formula: method casts + dep casts + ext pkgs/3 (max 2) + layer mix; clamped 1–10).',
        refLink: 'https://reflectoring.io/single-responsibility-principle',
      },
    ],
    sections: [
      {
        type: 'chips',
        title: 'Reasons To Change - Categories',
        path: 'reasonsCategories',
        iconMapRef: 'categoryIcons',
        tooltipMapRef: 'categoryDescriptions',
      },
      {
        type: 'list',
        title: 'External Packages Used',
        path: 'externalPackages',
        icon: 'inventory_2',
      },
      {
        type: 'list',
        title: 'Internal Sources',
        path: 'internalFiles',
        icon: 'description',
        format: 'fileName',
      },
    ],
  },
})
export class ReasonsToChangeMetric extends BaseMetric<ReasonsToChangeMetricResult> {
  private static readonly NEUTRAL_CATEGORIES = new Set<string>([
    'angular-core',
  ]);

  analyze(context: AnalyzerContext): ReasonsToChangeMetricResult {
    const classNode =
      context.scopeNode && ts.isClassDeclaration(context.scopeNode)
        ? context.scopeNode
        : undefined;

    if (!classNode) {
      return {
        score: 1,
        reasonsCategories: [],
        externalPackages: [],
        internalFiles: [],
        layerCrossing: false,
      };
    }

    const className = classNode.name?.text || 'AnonymousClass';
    const methodCategories = this.collectMethodCategories(context, className);
    const dependencyCategories = this.collectDependencyCategories(
      context,
      classNode
    );
    const externalPackages = this.collectExternalPackages(context, classNode);
    const internalFiles = this.collectInternalFiles(context, classNode);

    const filteredMethodCats = this.filterNeutralCategories(methodCategories);
    const filteredDepCats = this.filterNeutralCategories(dependencyCategories);

    const C = filteredMethodCats.size;
    const D = filteredDepCats.size;
    const I = Math.min(2, Math.floor(externalPackages.size / 3));

    const unionForLayer = new Set<string>([
      ...filteredMethodCats,
      ...filteredDepCats,
    ]);
    const layerCrossing = this.detectLayerCrossing(unionForLayer);
    const L = layerCrossing ? 1 : 0;

    const score = Math.max(1, Math.min(10, C + D + I + L));

    const allCategories = new Set<string>([
      ...methodCategories,
      ...dependencyCategories,
    ]);
    const filteredCategories = this.filterNeutralCategories(allCategories);

    return {
      score,
      reasonsCategories: Array.from(filteredCategories).sort(),
      externalPackages: Array.from(externalPackages).sort(),
      internalFiles: Array.from(internalFiles).sort(),
      layerCrossing,
    };
  }

  private filterNeutralCategories(categories: Set<string>): Set<string> {
    return new Set(
      Array.from(categories).filter(
        (c) => !ReasonsToChangeMetric.NEUTRAL_CATEGORIES.has(c)
      )
    );
  }

  private collectMethodCategories(
    context: AnalyzerContext,
    className: string
  ): Set<string> {
    const categories = new Set<string>();
    const file = context.sourceFile;

    const visit = (n: ts.Node, currentClass?: string) => {
      if (ts.isClassDeclaration(n)) {
        const cls = n.name?.text || 'AnonymousClass';
        ts.forEachChild(n, (child) => visit(child, cls));
      } else if (
        (ts.isMethodDeclaration(n) ||
          ts.isFunctionDeclaration(n) ||
          ts.isArrowFunction(n) ||
          ts.isFunctionExpression(n)) &&
        currentClass === className
      ) {
        const res = new MethodResponsibilityMetric().analyze(
          context,
          n as ts.FunctionLikeDeclaration
        );
        for (const c of res.categories) {
          categories.add(c);
        }
      }
    };

    ts.forEachChild(file, (child) => visit(child));
    return categories;
  }

  private collectDependencyCategories(
    context: AnalyzerContext,
    node: ts.ClassDeclaration
  ): Set<string> {
    const categories = new Set<string>();
    const checker = context.checker;

    const classifyType = (t: ts.Type | undefined) => {
      if (!t) return;
      const sym = t.getSymbol();
      const rawName = sym?.getName();
      const typeName = rawName?.startsWith('typeof ')
        ? rawName.slice('typeof '.length)
        : rawName;
      const decls = sym?.getDeclarations() || [];
      const srcs = decls.map((d) => d.getSourceFile().fileName);

      if (
        typeName === 'HttpClient' ||
        srcs.some((s) => s.includes('@angular/common/http'))
      ) {
        categories.add('networking');
      }
      if (
        typeName === 'Router' ||
        srcs.some((s) => s.includes('@angular/router'))
      ) {
        categories.add('navigation');
      }
      if (typeName === 'Store' || srcs.some((s) => s.includes('@ngrx/store'))) {
        categories.add('state');
      }
      if (srcs.some((s) => s.includes('@ngrx/effects'))) {
        categories.add('state-effects');
      }
      if (
        typeName === 'FormBuilder' ||
        typeName === 'FormControl' ||
        srcs.some((s) => s.includes('@angular/forms'))
      ) {
        categories.add('forms');
      }
      if (srcs.some((s) => s.includes('@angular/material'))) {
        categories.add('ui');
      }
      if (
        typeName === 'Document' ||
        typeName === 'Window' ||
        srcs.some((s) => s.includes('lib.dom.d.ts'))
      ) {
        categories.add('dom');
      }
    };

    node.members.forEach((m) => {
      if (ts.isConstructorDeclaration(m)) {
        m.parameters.forEach((p) =>
          classifyType(
            p.type
              ? checker.getTypeFromTypeNode(p.type)
              : checker.getTypeAtLocation(p)
          )
        );
      } else if (ts.isPropertyDeclaration(m)) {
        if (m.type) {
          classifyType(checker.getTypeFromTypeNode(m.type));
        } else if (m.initializer) {
          if (ts.isCallExpression(m.initializer)) {
            const callExpr = m.initializer;
            const callee = callExpr.expression;
            const isInjectFn =
              ts.isIdentifier(callee) && callee.text === 'inject';
            if (isInjectFn && callExpr.arguments.length > 0) {
              const arg = callExpr.arguments[0];
              let categorized = false;
              try {
                const before = categories.size;
                const injectedType = checker.getTypeAtLocation(arg);
                classifyType(injectedType);
                categorized = categories.size > before;
              } catch {
                categorized = false;
              }
              if (!categorized) {
                // Fallback to token name-based classification when type resolution fails
                let tokenName: string | undefined;
                if (ts.isIdentifier(arg)) tokenName = arg.text;
                else if (ts.isPropertyAccessExpression(arg))
                  tokenName = arg.name.text;
                if (tokenName === 'HttpClient') categories.add('networking');
                if (tokenName === 'Router') categories.add('navigation');
                if (tokenName === 'Store') categories.add('state');
                if (tokenName === 'FormBuilder' || tokenName === 'FormControl')
                  categories.add('forms');
              }
              // We handled inject() explicitly; skip further type inference on initializer
              return;
            }
          }
          // Try to infer from initializer expression (e.g., http = new HttpClient())
          try {
            classifyType(checker.getTypeAtLocation(m.initializer));
          } catch {
            // ignore if checker cannot resolve in this test context
          }
        }
      }
    });

    return categories;
  }

  private collectExternalPackages(
    context: AnalyzerContext,
    node: ts.ClassDeclaration
  ): Set<string> {
    const packages = new Set<string>();
    const checker = context.checker;

    const pushDeclaration = (decl: ts.Declaration | undefined) => {
      if (!decl) return;
      const file = decl.getSourceFile().fileName;
      const pkg = this.getPackageRootFromPath(file);
      if (pkg) {
        packages.add(pkg);
      }
    };

    node.members.forEach((m) => {
      if (ts.isConstructorDeclaration(m)) {
        m.parameters.forEach((p) => {
          const t = p.type
            ? checker.getTypeFromTypeNode(p.type)
            : checker.getTypeAtLocation(p);
          const sym = t.getSymbol();
          const decl = sym?.getDeclarations()?.[0];
          pushDeclaration(decl);
        });
      } else if (ts.isPropertyDeclaration(m)) {
        let t: ts.Type | undefined;
        if (m.type) {
          t = checker.getTypeFromTypeNode(m.type);
        } else if (m.initializer) {
          if (
            ts.isCallExpression(m.initializer) &&
            ts.isIdentifier(m.initializer.expression) &&
            m.initializer.expression.text === 'inject' &&
            m.initializer.arguments.length > 0
          ) {
            try {
              t = checker.getTypeAtLocation(m.initializer.arguments[0]);
            } catch {
              t = undefined;
            }
          } else {
            try {
              t = checker.getTypeAtLocation(m.initializer);
            } catch {
              t = undefined;
            }
          }
        }
        if (t) {
          const sym = t.getSymbol();
          const decl = sym?.getDeclarations()?.[0];
          pushDeclaration(decl);
        }
      }
    });

    return packages;
  }

  private getPackageRootFromPath(filePath: string): string | undefined {
    const nm = '/node_modules/';
    const idx = filePath.lastIndexOf(nm);
    if (idx === -1) return undefined;
    const after = filePath.slice(idx + nm.length);
    const parts = after.split(/[\\/]/).filter(Boolean);
    if (!parts.length) return undefined;
    if (parts[0].startsWith('@') && parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return parts[0];
  }

  private detectLayerCrossing(categories: Set<string>): boolean {
    const hasUI = categories.has('ui') || categories.has('dom');
    const hasIO = categories.has('networking') || categories.has('storage');
    const hasState = categories.has('state') || categories.has('state-effects');
    return hasUI && (hasIO || hasState);
  }

  private collectInternalFiles(
    context: AnalyzerContext,
    node: ts.ClassDeclaration
  ): Set<string> {
    const files = new Set<string>();
    const checker = context.checker;

    const pushDeclaration = (decl: ts.Declaration | undefined) => {
      if (!decl) return;
      const file = decl.getSourceFile().fileName;
      if (!file.includes('/node_modules/')) {
        files.add(file);
      }
    };

    node.members.forEach((m) => {
      if (ts.isConstructorDeclaration(m)) {
        m.parameters.forEach((p) => {
          const t = p.type
            ? checker.getTypeFromTypeNode(p.type)
            : checker.getTypeAtLocation(p);
          const sym = t.getSymbol();
          const decl = sym?.getDeclarations()?.[0];
          pushDeclaration(decl);
        });
      } else if (ts.isPropertyDeclaration(m)) {
        let t: ts.Type | undefined;
        if (m.type) {
          t = checker.getTypeFromTypeNode(m.type);
        } else if (m.initializer) {
          if (
            ts.isCallExpression(m.initializer) &&
            ts.isIdentifier(m.initializer.expression) &&
            m.initializer.expression.text === 'inject' &&
            m.initializer.arguments.length > 0
          ) {
            try {
              t = checker.getTypeAtLocation(m.initializer.arguments[0]);
            } catch {
              t = undefined;
            }
          } else {
            try {
              t = checker.getTypeAtLocation(m.initializer);
            } catch {
              t = undefined;
            }
          }
        }
        if (t) {
          const sym = t.getSymbol();
          const decl = sym?.getDeclarations()?.[0];
          pushDeclaration(decl);
        }
      }
    });

    return files;
  }
}
