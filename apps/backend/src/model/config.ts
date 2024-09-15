export type Filter = {
  logs?: string[];
  files?: string[];
};

export type Config = {
  scopes: string[];
  groups: string[];
  filter: Filter;
  teams: Record<string, string[]>;
  aliases: Record<string, string>;
  entries: [];
};

export const emptyConfig: Config = {
  scopes: [],
  groups: [],
  teams: {},
  aliases: {},
  entries: [],
  filter: {
    logs: [],
    files: [],
  },
};
