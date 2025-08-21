import { z } from 'zod';

import { BaseMetricsAnalyzer } from './base-metrics-analyzer';
import { ComplexAlgorithmsMetric } from './metrics/organization/complex-algorithms.metric';
import { FeatureEnvyMetric } from './metrics/organization/feature-envy.metric';
import { MiddleManMetric } from './metrics/organization/middle-man.metric';
import { TemporalCouplingMetric } from './metrics/organization/temporal-coupling.metric';
import {
  Dictionaries,
  QualityGroupFragment,
  MetricItem,
} from './ui-schema.types';
import { OrganizationMetrics } from './x-ray-metrics.types';

export class OrganizationMetricsAnalyzer extends BaseMetricsAnalyzer {
  static getMeta() {
    const metaParts = [
      FeatureEnvyMetric.getMetadata(),
      MiddleManMetric.getMetadata(),
      ComplexAlgorithmsMetric.getMetadata(),
      TemporalCouplingMetric.getMetadata(),
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
        id: 'organization',
        title: 'Code Organization',
        path: 'metrics.organization',
        refLink: 'https://refactoring.guru/smells/feature-envy',
        metrics,
      } as QualityGroupFragment,
      dictionaries: {} as Dictionaries,
    } as const;
  }
  async analyze(): Promise<{ organization: OrganizationMetrics }> {
    const featureEnvy = new FeatureEnvyMetric().analyze(this.context);
    const middleManClasses = new MiddleManMetric().analyze(this.context);
    const complexAlgorithms = new ComplexAlgorithmsMetric().analyze(
      this.context
    );
    const temporalCoupling = new TemporalCouplingMetric().analyze(this.context);
    return Promise.resolve({
      organization: {
        featureEnvy,
        middleManClasses,
        complexAlgorithms,
        temporalCoupling,
      },
    });
  }
}
