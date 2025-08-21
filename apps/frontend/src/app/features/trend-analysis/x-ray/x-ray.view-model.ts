export type MetricVM = {
  label: string;
  icon?: string;
  value: number | string | undefined;
  warn: boolean;
  tooltip?: string;
  refLink?: string;
};

export type CardVM = {
  title: string;
  metrics: MetricVM[];
};

export type TabVM = {
  id: string;
  title: string;
  icon?: string;
  cards: CardVM[];
};

export type XRayVM = {
  tabs: TabVM[];
};

type Threshold = {
  warnGte?: number;
  warnGt?: number;
  warnLte?: number;
  warnLt?: number;
};

type MetricDescriptor = {
  label: string;
  icon?: string;
  path: string;
  tooltip?: string;
  refLink?: string;
  threshold?: Threshold;
};

type GroupDescriptor = {
  title: string;
  path: string;
  metrics?: MetricDescriptor[];
};

type BaseTabDescriptor = {
  id: string;
  title: string;
  icon?: string;
  hideIfEmpty?: boolean;
};

type GroupTabDescriptor = BaseTabDescriptor & {
  groups: GroupDescriptor[];
};

type CollectionTabDescriptor = BaseTabDescriptor & {
  collection: string;
  metrics?: MetricDescriptor[];
  itemTitle?: string;
};

type TabDescriptor = GroupTabDescriptor | CollectionTabDescriptor;

type UISchema = {
  tabs: TabDescriptor[];
};

type SchemaResponse =
  | {
      uiSchema?: UISchema;
      jsonSchema?: Record<string, unknown>;
    }
  | null
  | undefined;

export function buildXRayViewModel(
  result: unknown,
  schemaResponse: unknown
): XRayVM {
  const schema = schemaResponse as SchemaResponse;
  const ui: UISchema = schema?.uiSchema ??
    (schema?.jsonSchema?.['x-ui'] as UISchema | undefined) ?? { tabs: [] };

  const tabs: TabVM[] = [];

  for (const tab of ui.tabs || []) {
    const cards: CardVM[] = [];

    if ('groups' in tab && Array.isArray(tab.groups)) {
      for (const group of tab.groups) {
        const basePath = group.path;
        const metrics: MetricVM[] = (group.metrics ?? []).map(
          (m: MetricDescriptor): MetricVM => {
            const value = getValueByPath<string | number | undefined>(
              result,
              `${basePath}.${m.path}`
            );
            return {
              label: m.label,
              icon: m.icon,
              value,
              warn: isWarn(m, value),
              tooltip: m.tooltip,
              refLink: m.refLink,
            };
          }
        );
        cards.push({ title: group.title, metrics });
      }
    } else if ('collection' in tab && typeof tab.collection === 'string') {
      const entries = getCollectionEntries(result, tab.collection);
      for (const { key, value } of entries) {
        const metrics: MetricVM[] = (tab.metrics ?? []).map(
          (m: MetricDescriptor): MetricVM => {
            const v = getValueByPath<string | number | undefined>(
              value,
              m.path
            );
            return {
              label: m.label,
              icon: m.icon,
              value: v,
              warn: isWarn(m, v),
              tooltip: m.tooltip,
              refLink: m.refLink,
            };
          }
        );
        const title = (tab.itemTitle || '{{key}}').replace('{{key}}', key);
        cards.push({ title, metrics });
      }
    }

    const rawTitle: string = tab.title || '';
    const titleWithCount = rawTitle.includes('{{count}}')
      ? rawTitle.replace('{{count}}', String(cards.length))
      : rawTitle;

    if (tab.hideIfEmpty && cards.length === 0) {
      continue;
    }

    tabs.push({ id: tab.id, title: titleWithCount, icon: tab.icon, cards });
  }

  return { tabs };
}

function getCollectionEntries(
  result: unknown,
  collectionPath: string
): Array<{ key: string; value: unknown }> {
  const obj = getValueByPath<Record<string, unknown>>(result, collectionPath);
  if (!obj) return [];
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

function getValueByPath<T = unknown>(
  obj: unknown,
  path: string
): T | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object') {
      const rec = current as Record<string, unknown>;
      current = rec[part];
    } else {
      return undefined;
    }
  }
  return current as T | undefined;
}

function isWarn(metric: MetricDescriptor, value: unknown): boolean {
  if (typeof value !== 'number' || !metric?.threshold) return false;
  const t = metric.threshold;
  if (t.warnGte !== undefined && value >= t.warnGte) return true;
  if (t.warnGt !== undefined && value > t.warnGt) return true;
  if (t.warnLte !== undefined && value <= t.warnLte) return true;
  if (t.warnLt !== undefined && value < t.warnLt) return true;
  return false;
}
