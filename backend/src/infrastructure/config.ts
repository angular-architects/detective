import path from "path";
import { cwd } from "process";
import { Config } from "../model/config";
import { Options } from "../options/options";
import fs from "fs";

export function loadConfig(options: Options): Config {
  const configPath = path.join(cwd(), options.config);
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Config;
  return config;
}
