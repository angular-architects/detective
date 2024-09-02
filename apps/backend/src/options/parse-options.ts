import { defaultOptions, Options } from './options';

export function parseOptions(args: string[]): Options {
  let state: 'port' | 'config' | 'path' | 'none' | 'open' = 'none';
  const parsed: Partial<Options> = {};

  for (const arg of args) {
    if (state === 'none') {
      if (arg === '--port') {
        state = 'port';
      } else if (arg === '--config') {
        state = 'config';
      } else if (arg === '--path') {
        state = 'path';
      } else if (arg === '--open') {
        state = 'open';
      } else if (arg === '--demo') {
        parsed.demoMode = true;
      } else if (!parsed.sheriffDump) {
        parsed.sheriffDump = arg;
      }
    } else if (state === 'port') {
      parsed.port = parseInt(arg);
      state = 'none';
    } else if (state === 'path') {
      parsed.path = arg;
      state = 'none';
    } else if (state === 'config') {
      parsed.config = arg;
      state = 'none';
    } else if (state === 'open') {
      parsed.open = arg !== 'false' && Boolean(arg);
      state = 'none';
    }
  }

  return { ...defaultOptions, ...parsed };
}
