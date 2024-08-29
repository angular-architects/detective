import path from "path";
import { cwd } from "process";
import { Config } from "../model/config";
import { Options } from "../options/options";
import fs from "fs";

const DETECTIVE_DIR = '.detective';

const initConfig: Config = 
  {
    "scopes": [
    ],
    "groups": [
    ],
    "--entries": [
    ],
    "--teams": {
      "--comment": "Add a teams node with this structure",
      "alpha": [
        "John Doe",
        "Jane Doe"
      ],
      "beta": [
        "Max Muster",
        "Susi Sorglos",
      ]
    }
  } as any;

export function loadConfig(options: Options): Config {
  const configPath = path.join(cwd(), options.config);
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Config;
  return config;
}

export function ensureConfig(options: Options): void {
  const configPath = path.join(cwd(), options.config);
  ensureDetectiveDir();
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(initConfig, null, 2), 'utf-8');
  }
}

function ensureDetectiveDir() {
  if (!fs.existsSync(DETECTIVE_DIR)) {
    fs.mkdirSync(DETECTIVE_DIR);
  }
}
