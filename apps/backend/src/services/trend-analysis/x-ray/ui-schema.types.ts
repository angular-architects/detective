export type Threshold = {
  warnGte?: number;
  warnGt?: number;
  warnLte?: number;
  warnLt?: number;
};

export interface MetricItem {
  path: string;
  label: string;
  icon?: string;
  tooltip?: string;
  threshold?: Threshold;
  refLink?: string;
}

export interface BadgeItem {
  label: string;
  class?: 'warning' | 'info' | 'success' | 'neutral';
  if?: string;
}

export interface ChipsSection {
  type: 'chips';
  title: string;
  path: string;
  iconMapRef?: string;
  tooltipMapRef?: string;
}

export interface ListSection {
  type: 'list';
  title: string;
  path: string;
  icon?: string;
  format?: 'fileName' | 'none';
}

export interface DuplicatesSection {
  type: 'duplicates';
  title: string;
  path: string;
}

export type Section = ChipsSection | ListSection | DuplicatesSection;

export interface TabFragment {
  kind?: 'tab';
  id: string;
  title: string;
  icon?: string;
  collection?: string;
  itemTitle?: string;
  badges?: BadgeItem[];
  metrics?: MetricItem[];
  sections?: Section[];
  hideIfEmpty?: boolean;
}

export interface QualityGroupFragment {
  kind?: 'quality-group';
  id: string;
  title: string;
  path: string;
  refLink?: string;
  metrics: MetricItem[];
}

export interface QualityTab {
  id: 'code-quality';
  title: string;
  icon?: string;
  groups: QualityGroupFragment[];
}

export interface Dictionaries {
  [dictName: string]: Record<string, string>;
}

export interface UISchema {
  version: number;
  tabs: Array<TabFragment | QualityTab>;
  dictionaries?: Dictionaries;
  docsUrl?: string;
}
