import fs from 'fs';

import { Options } from './options';

export function validateOptions(options: Options) {
  try {
    if (!fs.existsSync(options.sheriffDump)) {
      console.error('Sheriff export does not exist: ', options.sheriffDump);
      return false;
    }
    if (!options.port) {
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
}
