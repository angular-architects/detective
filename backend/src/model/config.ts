export type Config = {
    scopes: string[];
    groups: string[];
    teams: Record<string, string[]>
    entries: []
};
