export interface ModuleDetails {
  changes: Record<string, number>;
}

export interface TeamAlignmentResult {
  modules: Record<string, ModuleDetails>;
  teams: string[];
}
