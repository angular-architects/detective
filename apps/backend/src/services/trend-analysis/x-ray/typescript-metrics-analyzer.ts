import { z } from 'zod';

import { BaseMetricsAnalyzer } from './base-metrics-analyzer';
import { AnyTypesMetric } from './metrics/typescript/any-types.metric';
import { ComplexUnionsMetric } from './metrics/typescript/complex-unions.metric';
import { MissingTypeGuardsMetric } from './metrics/typescript/missing-type-guards.metric';
import { TypeAssertionsMetric } from './metrics/typescript/type-assertions.metric';
import { TypeDuplicationMetric } from './metrics/typescript/type-duplication.metric';
import { WeakTypeDefinitionsMetric } from './metrics/typescript/weak-type-definitions.metric';
import { TypeScriptMetrics } from './x-ray-metrics.types';

export class TypeScriptMetricsAnalyzer extends BaseMetricsAnalyzer {
  static getMeta() {
    const metaParts = [
      AnyTypesMetric.getMetadata(),
      TypeAssertionsMetric.getMetadata(),
      ComplexUnionsMetric.getMetadata(),
      MissingTypeGuardsMetric.getMetadata(),
      WeakTypeDefinitionsMetric.getMetadata(),
      TypeDuplicationMetric.getMetadata(),
    ];
    const schema = metaParts.reduce(
      (acc, m) => acc.merge(m.schema),
      z.object({})
    );
    const metrics: import('./ui-schema.types').MetricItem[] = metaParts.flatMap(
      (m) => m.ui.metrics as unknown as import('./ui-schema.types').MetricItem[]
    );
    return {
      schema,
      ui: {
        kind: 'quality-group',
        id: 'typescript',
        title: 'TypeScript Quality',
        path: 'metrics.typescript',
        refLink:
          'https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html',
        metrics,
      },
      dictionaries: {},
    } as const;
  }
  async analyze(): Promise<{ typescript: TypeScriptMetrics }> {
    const anyTypes = new AnyTypesMetric().analyze(this.context);
    const typeAssertions = new TypeAssertionsMetric().analyze(this.context);
    const complexUnions = new ComplexUnionsMetric().analyze(this.context);
    const missingTypeGuards = new MissingTypeGuardsMetric().analyze(
      this.context
    );
    const weakTypeDefinitions = new WeakTypeDefinitionsMetric().analyze(
      this.context
    );
    const typeDuplication = new TypeDuplicationMetric().analyze(this.context);

    return Promise.resolve({
      typescript: {
        anyTypes,
        typeAssertions,
        complexUnions,
        missingTypeGuards,
        weakTypeDefinitions,
        typeDuplication,
      },
    });
  }
}
