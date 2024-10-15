export type Users = string[];
export type Aliases = { [alias: string]: string };
export type Teams = { [team: string]: Users };

export interface Config {
  groups?: string[];
  scopes: string[];
  focus?: string;
  aliases?: Aliases;
  teams?: Teams;
}

export const initConfig: Config = {
  scopes: [],
};
