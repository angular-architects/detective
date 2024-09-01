export type Hotspot = {
  commits: number;
  changedLines: number;
  complexity: number;
  score: number;
};

export type FlatHotspot = {
  fileName: string;
  commits: number;
  changedLines: number;
  complexity: number;
  score: number;
};

export type HotspotResult = {
  hotspots: FlatHotspot[];
};

export type ComplexityMetric = 'McCabe' | 'Length';

export type HotspotCriteria = {
  module: string;
  minScore: number;
  metric: ComplexityMetric,
};

export type AggregatedHotspot = {
  module: string;
  count: number;
};

export type AggregatedHotspotsResult = {
  aggregated: AggregatedHotspot[];
};
