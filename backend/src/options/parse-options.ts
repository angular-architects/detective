import { defaultOptions, Options } from "./options";

export function parseOptions(args: string[]): Options {
    let state: 'port' | 'config' | 'none' = 'none';
    const parsed: Partial<Options> = {};

    for(let arg of args) {
        if (state === 'none') {
            if (arg === '--port') {
                state = 'port';
            }
            else if (arg === '--config') {
                state = 'config';
            }
            else if (!parsed.sheriffDump) {
                parsed.sheriffDump = arg;
            }
        }
        else if (state === 'port') {
            parsed.port = parseInt(arg);
            state = 'none';
        }
        else if (state === 'config') {
            parsed.config = arg;
            state = 'none';
        }
    }

    return {...defaultOptions, ...parsed};
}
