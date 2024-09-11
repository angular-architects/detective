export type Filter = {
  logs?: string[];
  files?: string[];
};

export type Config = {
  scopes: string[];
  groups: string[];
  filter: Filter,
  teams: Record<string, string[]>;
  entries: [];
};

export const emptyConfig: Config = {
  scopes: [],
  groups: [],
  teams: {},
  entries: [],
  filter: {
    logs: [],
    files: []
  }
};
