import path from "path";
import fs from "fs";
import { Config } from "../model/config";
import { Deps } from "../model/deps";

export type CouplingResult = {
  dimensions: string[];
  matrix: number[][];
};

export function calcCoupling(): CouplingResult {
  const basePath = process.cwd();

  const config = loadConfig(basePath);
  const deps = loadDeps(basePath);

  const files = Object.keys(deps);
  const scopeMap = calcScopeMap(config);
  const matrixSize = config.scopes.length;
  const matrix: number[][] = getEmptyMatrix(matrixSize);

  for (const row of config.scopes) {
    for (const col of config.scopes) {
      const count = calcCell(files, deps, row, col);

      const i = scopeMap.get(row);
      const j = scopeMap.get(col);

      if (typeof i === "undefined" || typeof j === "undefined") {
        throw new Error(`undefined matrix position ${i}, ${j}`);
      }

      matrix[i][j] = count;
    }
  }

  return {
    dimensions: config.scopes,
    matrix,
  };
}

function calcCell(
  files: string[],
  deps: Deps,
  row: string,
  col: string
) {
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

function loadDeps(basePath: string) {
  const depsPath = path.join(basePath, "data", "deps.json");
  const deps = JSON.parse(fs.readFileSync(depsPath, "utf-8")) as Deps;
  return deps;
}

function loadConfig(basePath: string) {
  const configPath = path.join(basePath, "data", "config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Config;
  return config;
}

function getEmptyMatrix(size: number): number[][] {
  return Array.from({ length: size }, () => new Array(size).fill(0));
}

function calcScopeMap(config: Config) {
  const scopeMap = new Map<string, number>();
  for (let i = 0; i < config.scopes.length; i++) {
    scopeMap.set(config.scopes[i], i);
  }
  return scopeMap;
}
