import { AnalyzerContext } from '../x-ray-metrics.types';

import { getMetricMetadata } from './metric.decorator';
import { IMetric, MetricMetadata } from './metric.interface';

export abstract class BaseMetric<T = number> implements IMetric<T> {
  abstract analyze(context: AnalyzerContext): T;
  analyzeAsync(context: AnalyzerContext): Promise<T> {
    return Promise.resolve(this.analyze(context));
  }

  getMetadata(): MetricMetadata {
    const metadata = getMetricMetadata(this.constructor);
    if (!metadata) {
      throw new Error(`${this.constructor.name} is missing @Metric decorator`);
    }
    return metadata;
  }

  static getMetadata(): MetricMetadata {
    const metadata = getMetricMetadata(this);
    if (!metadata) {
      throw new Error(`${this.name} is missing @Metric decorator`);
    }
    return metadata;
  }
}
