import * as fs from 'fs';
import * as path from 'path';

import { DETECTIVE_DIR, LOG_FILE } from './paths';

const logFile = path.join(DETECTIVE_DIR, LOG_FILE);

export function loadCachedLog(): string {
  if (!fs.existsSync(logFile)) {
    return '';
  }

  return fs.readFileSync(logFile, 'utf-8');
}

export function saveCachedLog(log: string): void {
  fs.writeFileSync(logFile, log, 'utf-8');
}
