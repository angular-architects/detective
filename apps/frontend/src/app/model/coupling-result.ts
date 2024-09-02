export interface CouplingResult {
  dimensions: string[];
  fileCount: number[];
  cohesion: number[];
  matrix: number[][];
  groups: string[];
}

export const initCouplingResult: CouplingResult = {
  dimensions: [],
  fileCount: [],
  cohesion: [],
  matrix: [[]],
  groups: []
};
