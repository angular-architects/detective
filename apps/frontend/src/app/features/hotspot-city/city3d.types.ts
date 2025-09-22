export type City3DFileMeta = {
  kind: 'file';
  filePath: string;
  folder: string;
  complexity: number; // McCabe
  commits: number;
  changedLines: number;
  score: number;
};

export type City3DModuleMeta = {
  kind: 'module';
  moduleKey: string; // parent/module
  parent: string;
  module: string;
  countHotspot: number;
  countWarning: number;
  countOk: number;
  total: number;
};

export type City3DMeta = City3DFileMeta | City3DModuleMeta;

export interface City3DItem {
  id: string;
  label: string;
  // numbers used to derive footprint (X/Z) and height (Y)
  footprint: number;
  height: number;
  // metadata used for tooltips/click handling in parent
  meta: City3DMeta;
}

export interface City3DBoundaries {
  warningBoundary: number;
  hotspotBoundary: number;
  maxScore: number;
}
