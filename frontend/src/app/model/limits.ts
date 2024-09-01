export type Limits = {
    limitCommits: number | null;
    limitMonths: number | null;
}

export const initLimits: Limits = {
    limitCommits: 1000,
    limitMonths: 0,
};
