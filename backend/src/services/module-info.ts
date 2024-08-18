import { loadConfig } from "../infrastructure/config";
import { loadDeps } from "../infrastructure/deps";
import { Options } from "../options/options";

export type ModuleInfo = {
  fileCount: number[];
};

export function calcModuleInfo(options: Options): ModuleInfo {
  const config = loadConfig(options);
  const deps = loadDeps(options);

  const fileCount = new Array<number>(config.scopes.length).fill(0);

  for (const dep of Object.keys(deps)) {
    for (let i = 0; i < config.scopes.length; i++) {
      const scope = config.scopes[i];
      if (dep.startsWith(scope)) {
        fileCount[i]++;
      }
    }
  }

  return {
    fileCount
  };
}
