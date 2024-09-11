import path from 'path';
import { cwd } from 'process';
import { Config } from '../model/config';
import { Options } from '../options/options';
import fs from 'fs';
import { DETECTIVE_DIR } from './paths';

const initConfig: Config = {
  scopes: [],
  groups: [],
  entries: [],
  filter: {
    files: [],
    logs: []
  },
  teams: {
    'example-team-a': ['John Doe', 'Jane Doe'],
    'example-team-b': ['Max Muster', 'Susi Sorglos'],
  },
};

export function loadConfig(options: Options): Config {
  const configPath = path.join(cwd(), options.config);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Config;
  config.scopes.sort();
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
