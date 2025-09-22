import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { ClassMetricsAnalyzer } from './class-metrics-analyzer';
import { DataStructureMetricsAnalyzer } from './data-structure-metrics-analyzer';
import { MethodMetricsAnalyzer } from './method-metrics-analyzer';
import { OrganizationMetricsAnalyzer } from './organization-metrics-analyzer';
import { TypeScriptMetricsAnalyzer } from './typescript-metrics-analyzer';
import {
  UISchema,
  TabFragment,
  QualityTab,
  QualityGroupFragment,
  BadgeItem,
  MetricItem,
  Section,
} from './ui-schema.types';

// Note: Metric Zod schemas live in analyzers; avoid duplication here.

type AnalyzerDictionaries = Record<string, Record<string, string>>;

type ReadonlyTabFragment = Omit<
  TabFragment,
  'badges' | 'metrics' | 'sections'
> & {
  badges?: ReadonlyArray<BadgeItem>;
  metrics?: ReadonlyArray<MetricItem>;
  sections?: ReadonlyArray<Section>;
};

type ReadonlyQualityGroupFragment = Omit<QualityGroupFragment, 'metrics'> & {
  metrics: ReadonlyArray<MetricItem>;
};

type AnalyzerMeta = {
  schema: z.ZodTypeAny;
  ui: ReadonlyTabFragment | ReadonlyQualityGroupFragment;
  dictionaries?: AnalyzerDictionaries;
};
type AnalyzerClass = { getMeta(): AnalyzerMeta };

const ANALYZERS: AnalyzerClass[] = [
  MethodMetricsAnalyzer,
  ClassMetricsAnalyzer,
  DataStructureMetricsAnalyzer,
  OrganizationMetricsAnalyzer,
  TypeScriptMetricsAnalyzer,
];

export type XRaySchemaResponse = {
  version: number;
  jsonSchema: unknown;
  uiSchema: UISchema;
};

export function buildBaseXRaySchema(): XRaySchemaResponse {
  const jsonSchema = buildXRayJSONSchemaFromAnalyzers();
  const uiSchema: UISchema = { version: 1, tabs: [] };
  return { version: 1, jsonSchema, uiSchema };
}

// Compose UI schema from analyzer-provided fragments
export function buildXRayUISchemaFromAnalyzers(): UISchema {
  const metas = ANALYZERS.map((a) => a.getMeta());
  const tabs: TabFragment[] = metas
    .filter((m): m is AnalyzerMeta & { ui: ReadonlyTabFragment } => {
      const ui = m.ui as Partial<ReadonlyTabFragment>;
      return (
        typeof ui === 'object' &&
        ui !== null &&
        typeof ui.collection === 'string'
      );
    })
    .map((m) => {
      const ui = m.ui;
      return {
        ...ui,
        badges: ui.badges ? [...ui.badges] : undefined,
        metrics: ui.metrics ? [...ui.metrics] : undefined,
        sections: ui.sections ? [...ui.sections] : undefined,
      } satisfies TabFragment;
    });
  const groups: QualityGroupFragment[] = metas
    .filter((m): m is AnalyzerMeta & { ui: ReadonlyQualityGroupFragment } => {
      const ui = m.ui as Partial<
        ReadonlyQualityGroupFragment & ReadonlyTabFragment
      >;
      return (
        typeof ui === 'object' &&
        ui !== null &&
        typeof ui.path === 'string' &&
        (ui as Partial<ReadonlyTabFragment>).collection === undefined
      );
    })
    .map((m) => {
      const ui = m.ui;
      return {
        ...ui,
        metrics: [...ui.metrics],
      } satisfies QualityGroupFragment;
    });

  const qualityTab: QualityTab = {
    id: 'code-quality',
    title: 'Code Quality',
    icon: 'code',
    groups,
  };

  // Merge analyzer-provided dictionaries to avoid duplication
  const dictionariesList: AnalyzerDictionaries[] = metas
    .map((m) => m.dictionaries)
    .filter((d): d is AnalyzerDictionaries => !!d);

  const dictionaries = dictionariesList.reduce(
    (acc: Record<string, Record<string, string>>, dict) => {
      for (const [dictName, map] of Object.entries(dict)) {
        acc[dictName] = { ...(acc[dictName] || {}), ...map };
      }
      return acc;
    },
    {} as Record<string, Record<string, string>>
  );

  return {
    version: 1,
    tabs: [...tabs, qualityTab],
    dictionaries,
  };
}

// Compose JSON schema by combining analyzer Zod schemas into the full result shape
export function buildXRayJSONSchemaFromAnalyzers() {
  const metas = ANALYZERS.map((a) => a.getMeta());
  // Build metrics object by inferring keys from UI fragments
  const metricsShape: Record<string, z.ZodTypeAny> = {};
  metas.forEach((m) => {
    const ui = m.ui;
    if ('collection' in ui && typeof ui.collection === 'string') {
      const key = ui.collection.split('.').pop() as string;
      metricsShape[key] = z.record(m.schema);
    } else if ('path' in ui && typeof ui.path === 'string') {
      const key = ui.path.split('.').pop() as string;
      metricsShape[key] = m.schema;
    }
  });

  const Metrics = z.object(metricsShape);

  const XRay = z.object({
    file: z.string(),
    metrics: Metrics,
    sourceCode: z.string().optional(),
  });

  const json = zodToJsonSchema(XRay, {
    target: 'jsonSchema7',
    $refStrategy: 'none',
  }) as Record<string, unknown> & { ['x-ui']?: UISchema };
  // Embed UI config into JSON Schema to avoid separate schemas/types on the frontend
  json['x-ui'] = buildXRayUISchemaFromAnalyzers();
  return json;
}
