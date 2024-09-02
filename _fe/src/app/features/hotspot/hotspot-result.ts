export interface Hotspot {
  commits: number;
  changedLines: number;
  complexity: number;
  score: number;
}

export interface FlatHotspot {
  fileName: string;
  commits: number;
  changedLines: number;
  complexity: number;
  score: number;
}

export interface HotspotResult {
  hotspots: FlatHotspot[];
}

export const initHotspotResult: HotspotResult = {
  hotspots: []
};

export type ComplexityMetric = 'McCabe' | 'Length';

export interface HotspotCriteria {
  module: string;
  minScore: number;
  metric: ComplexityMetric;
}

export interface AggregatedHotspot {
  module: string;
  count: number;
}

export interface AggregatedHotspotsResult {
  aggregated: AggregatedHotspot[];
}

export const initAggregatedHotspotsResult: AggregatedHotspotsResult = {
  aggregated: []
};
