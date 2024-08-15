export type Options = {
    config: string;
    sheriffDump: string;
    port: number;
}

export const defaultOptions: Options = {
    sheriffDump: '.forensic/deps.json',
    config: '.forensic/config.json',
    port: 3334
}
