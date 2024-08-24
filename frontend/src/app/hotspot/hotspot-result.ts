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

export type HotspotCriteria = {
  module: string;
  minScore: number;
};

export type AggregatedHotspot = {
  module: string;
  count: number;
};

export type AggregatedHotspotsResult = {
  aggregated: AggregatedHotspot[];
};
