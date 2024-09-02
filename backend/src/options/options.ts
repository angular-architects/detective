export type Options = {
  config: string;
  sheriffDump: string;
  path: string;
  port: number;
  demoMode: boolean;
  open: boolean;
};

export const defaultOptions: Options = {
  sheriffDump: '.detective/deps.json',
  config: '.detective/config.json',
  path: '',
  port: 3334,
  demoMode: false,
  open: true,
};
