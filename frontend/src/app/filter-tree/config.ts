export interface Config {
  groups?: string[];
  scopes: string[];
}

export const initConfig: Config = {
  scopes: [],
};
