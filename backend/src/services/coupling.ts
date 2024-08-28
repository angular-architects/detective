import { Config } from "../model/config";
import { Deps } from "../model/deps";
import { Options } from "../options/options";
import { loadConfig } from "../infrastructure/config";
import { loadDeps } from "../infrastructure/deps";
import { calcModuleInfo, ModuleInfo } from "./module-info";
import { toPercent } from "../utils/to-percent";
import { getEmptyMatrix } from "../utils/matrix";
import { normalizeFolder } from "../utils/normalize-folder";

// TODO: Restructure fileCount and cohesion into dimensions node?
export type CouplingResult = {
  groups: string[];
  dimensions: string[];
  fileCount: number[];
  cohesion: number[];
  matrix: number[][];
};

export function calcCoupling(options: Options): CouplingResult {
  const config = loadConfig(options);
  const deps = loadDeps(options);

  const files = Object.keys(deps);
  const modules = config.scopes.map(m => normalizeFolder(m));

  const scopeMap = calcScopeMap(modules);
  const matrixSize = modules.length;
  const matrix: number[][] = getEmptyMatrix(matrixSize);


  for (const row of modules) {
    for (const col of modules) {
      const count = calcCell(files, deps, row, col);

      const i = scopeMap.get(row);
      const j = scopeMap.get(col);

      if (typeof i === "undefined" || typeof j === "undefined") {
        throw new Error(`undefined matrix position ${i}, ${j}`);
      }

      matrix[i][j] = count;
    }
  }

  // TODO: Improve performance by combinding this with matrix calculation
  const moduleInfo = calcModuleInfo(options);
  const cohesion = calcCohesion(moduleInfo, matrix);

  return {
    groups: config.groups,
    dimensions: config.scopes,
    fileCount: moduleInfo.fileCount,
    cohesion,
    matrix,
  };
}

function calcCohesion(moduleInfo: ModuleInfo, matrix: number[][]) {
  return moduleInfo.fileCount.map((count, index) => {
    const edges = matrix[index][index];
    const maxEdges = (count * (count - 1)) / 2;
    return toPercent(edges / maxEdges);
  });
}

function calcCell(files: string[], deps: Deps, row: string, col: string) {
  let count = 0;
  for (const file of files) {
    if (file.startsWith(row)) {
      count += sumUpImports(deps, file, col);
    }
  }
  return count;
}

function sumUpImports(deps: Deps, file: string, col: string) {
  let count = 0;
  for (const importPath of deps[file].imports) {
    if (importPath.startsWith(col)) {
      count++;
    }
  }
  return count;
}

function calcScopeMap(modules: string[]) {
  const scopeMap = new Map<string, number>();
  for (let i = 0; i < modules.length; i++) {
    scopeMap.set(modules[i], i);
  }
  return scopeMap;
}
