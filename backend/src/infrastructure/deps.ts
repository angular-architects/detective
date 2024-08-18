import path from "path";
import { Options } from "../options/options";
import { cwd } from "process";
import { Deps } from "../model/deps";
import fs from "fs";

export function loadDeps(options: Options) {
  const depsPath = path.join(cwd(), options.sheriffDump);
  const deps = JSON.parse(fs.readFileSync(depsPath, "utf-8")) as Deps;
  return deps;
}
