import * as ts from 'typescript';

export interface MethodMetrics {
  lines: number;
  parameters: number;
  cyclomaticComplexity: number;
  nestedConditions: number;
  hasComments: boolean;
  responsibilities: number;
  className?: string;
  responsibilitiesCategories?: string[];
  writesThis?: boolean;
  mutatesParams?: boolean;
}

export interface ClassMetrics {
  methods: number;
  fields: number;
  dependencies: number;
  reasonsToChange: number;
  cyclomaticComplexity: number;
  fileComplexity: number;
  reasonsCategories?: string[];
  externalPackages?: string[];
  layerCrossing?: boolean;
  internalFiles?: string[];
  isGodClass: boolean;
  onlyGettersSetters: boolean;
  unusedMembers: number;
  unusedMemberNames?: string[];
  duplicateBlocks: number;
  duplicateDetails?: Array<{
    location: string;
    count: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}

export interface DataStructureMetrics {
  publicFields: number;
  magicNumbers: number;
  nullChecks: number;
  complexDataPassing: number;
  arrayMixedMeanings: number;
}

export interface OrganizationMetrics {
  featureEnvy: number;
  middleManClasses: number;
  complexAlgorithms: number;
  temporalCoupling: number;
}

export interface TypeScriptMetrics {
  anyTypes: number;
  typeAssertions: number;
  complexUnions: number;
  missingTypeGuards: number;
  weakTypeDefinitions: number;
  typeDuplication: number;
}

export interface CodeMetrics {
  file: string;
  metrics: {
    methodLevel: Record<string, MethodMetrics>;
    classLevel: Record<string, ClassMetrics>;
    dataStructure: DataStructureMetrics;
    organization: OrganizationMetrics;
    typescript: TypeScriptMetrics;
  };
  sourceCode?: string;
}

export interface AnalyzerContext {
  sourceFile: ts.SourceFile;
  checker: ts.TypeChecker;
  program: ts.Program;
  sourceCode: string;
  scopeNode?: ts.Node;
}
