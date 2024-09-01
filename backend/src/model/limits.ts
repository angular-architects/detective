export type Limits = {
    limitCommits: number | null;
    limitMonths: number | null;
}

export const noLimits: Limits = {
    limitCommits: 0,
    limitMonths: 0,
};
