export type LimitType = 'COMMITS' | 'MONTHS';

export interface Limits {
  limitType: LimitType;
  limitCommits: number;
  limitMonths: number;
}

export const initLimits: Limits = {
  limitType: 'COMMITS' as LimitType,
  limitCommits: 1000,
  limitMonths: 0,
};
