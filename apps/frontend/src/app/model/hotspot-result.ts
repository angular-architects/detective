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
  hotspots: [],
};

export type ComplexityMetric = 'McCabe' | 'Length';

export interface HotspotCriteria {
  module: string;
  minScore: number;
  metric: ComplexityMetric;
}

export interface AggregatedHotspot {
  parent: string;
  module: string;
  count: number;
  countWarning: number;
  countHotspot: number;
  countOk: number;
}

export interface AggregatedHotspotsResult {
  aggregated: AggregatedHotspot[];
  maxScore: number;
  minScore: number;
  warningBoundary: number;
  hotspotBoundary: number;
}

export const initAggregatedHotspotsResult: AggregatedHotspotsResult = {
  aggregated: [],
  maxScore: 0,
  minScore: 0,
  warningBoundary: 0,
  hotspotBoundary: 0,
};
