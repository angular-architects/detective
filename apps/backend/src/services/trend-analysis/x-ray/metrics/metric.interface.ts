import { z } from 'zod';

import { MetricItem, BadgeItem, Section } from '../ui-schema.types';
import { AnalyzerContext } from '../x-ray-metrics.types';

export interface MetricMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodObject<any>;
  ui: {
    metrics: MetricItem[];
    badges?: BadgeItem[];
    sections?: Section[];
  };
}

export interface IMetric<T = number> {
  analyze(context: AnalyzerContext): T;
  analyzeAsync(context: AnalyzerContext): Promise<T>;
  getMetadata(): MetricMetadata;
}
