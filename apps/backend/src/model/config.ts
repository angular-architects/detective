export type Config = {
  scopes: string[];
  groups: string[];
  filter: string[];
  teams: Record<string, string[]>;
  entries: [];
};

export const emptyConfig: Config = {
  scopes: [],
  groups: [],
  teams: {},
  entries: [],
  filter: [],
};
