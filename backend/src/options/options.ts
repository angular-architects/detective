export type Options = {
    config: string;
    sheriffDump: string;
    path: string;
    port: number;
}

export const defaultOptions: Options = {
    sheriffDump: '.detective/deps.json',
    config: '.detective/config.json',
    path: '',
    port: 3334
}
