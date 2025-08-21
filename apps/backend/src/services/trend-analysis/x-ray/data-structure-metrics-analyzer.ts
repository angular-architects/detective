import { z } from 'zod';

import { BaseMetricsAnalyzer } from './base-metrics-analyzer';
import { ArrayMixedMeaningsMetric } from './metrics/data-structure/array-mixed-meanings.metric';
import { ComplexDataPassingMetric } from './metrics/data-structure/complex-data-passing.metric';
import { MagicNumbersMetric } from './metrics/data-structure/magic-numbers.metric';
import { NullChecksMetric } from './metrics/data-structure/null-checks.metric';
import { PublicFieldsMetric } from './metrics/data-structure/public-fields.metric';
import {
  Dictionaries,
  QualityGroupFragment,
  MetricItem,
} from './ui-schema.types';
import { DataStructureMetrics } from './x-ray-metrics.types';

export class DataStructureMetricsAnalyzer extends BaseMetricsAnalyzer {
  static getMeta() {
    const metaParts = [
      PublicFieldsMetric.getMetadata(),
      MagicNumbersMetric.getMetadata(),
      NullChecksMetric.getMetadata(),
      ComplexDataPassingMetric.getMetadata(),
      ArrayMixedMeaningsMetric.getMetadata(),
    ];
    const schema = metaParts.reduce(
      (acc, m) => acc.merge(m.schema),
      z.object({})
    );
    const metrics: MetricItem[] = metaParts.flatMap(
      (m) => m.ui.metrics as unknown as MetricItem[]
    );
    return {
      schema,
      ui: {
        kind: 'quality-group',
        id: 'data-structure',
        title: 'Data Structure',
        path: 'metrics.dataStructure',
        refLink: 'https://refactoring.guru/smells/data-clumps',
        metrics,
      } as QualityGroupFragment,
      dictionaries: {} as Dictionaries,
    } as const;
  }
  async analyze(): Promise<{ dataStructure: DataStructureMetrics }> {
    const publicFields = new PublicFieldsMetric().analyze(this.context);
    const magicNumbers = new MagicNumbersMetric().analyze(this.context);
    const nullChecks = new NullChecksMetric().analyze(this.context);
    const complexDataPassing = new ComplexDataPassingMetric().analyze(
      this.context
    );
    const arrayMixedMeanings = new ArrayMixedMeaningsMetric().analyze(
      this.context
    );
    return Promise.resolve({
      dataStructure: {
        publicFields,
        magicNumbers,
        nullChecks,
        complexDataPassing,
        arrayMixedMeanings,
      },
    });
  }
}
