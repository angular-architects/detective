import 'reflect-metadata';
import { MetricMetadata } from './metric.interface';

const METRIC_METADATA_KEY = Symbol('metric:metadata');

export function Metric(metadata: MetricMetadata): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any) {
    Reflect.defineMetadata(METRIC_METADATA_KEY, metadata, target);

    target.prototype.getMetadata = function () {
      return getMetricMetadata(this.constructor);
    };

    target.getMetadata = function () {
      return getMetricMetadata(target);
    };

    return target;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMetricMetadata(target: any): MetricMetadata | undefined {
  return Reflect.getMetadata(METRIC_METADATA_KEY, target);
}
