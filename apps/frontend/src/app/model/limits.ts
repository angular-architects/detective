export interface Limits {
  limitCommits: number;
  limitMonths: number;
}

export const initLimits: Limits = {
  limitCommits: 1000,
  limitMonths: 0,
};
