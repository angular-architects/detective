export interface Config {
  groups?: string[];
  scopes: string[];
  focus?: string;
}

export const initConfig: Config = {
  scopes: [],
};
