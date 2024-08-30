export type Limits = {
    limitCommits: number | null;
    limitMonths: number | null;
}

export const initLimits: Limits = {
    limitCommits: 10000,
    limitMonths: 0,
};
