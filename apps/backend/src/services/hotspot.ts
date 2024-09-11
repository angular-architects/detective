import path from 'path';
import * as fs from 'fs';

import { Options } from '../options/options';
import { LogBodyEntry, parseGitLog, ParseOptions } from '../utils/git-parser';
import { loadConfig } from '../infrastructure/config';
import { normalizeFolder, toDisplayFolder } from '../utils/normalize-folder';
import { Limits } from '../model/limits';

import { calcCyclomaticComplexity } from '../utils/complexity';
import { countLinesInFile } from '../utils/count-lines';
import { Filter } from '../model/config';

export type ComplexityMetric = 'McCabe' | 'Length';

export type Hotspot = {
  commits: number;
  changedLines: number;
  complexity: number;
  score: number;
};

export type FlatHotspot = {
  fileName: string;
  commits: number;
  changedLines: number;
  complexity: number;
  score: number;
};

export type HotspotResult = {
  hotspots: FlatHotspot[];
};

export type HotspotCriteria = {
  module: string;
  minScore: number;
  metric: ComplexityMetric;
};

export type AggregatedHotspot = {
  module: string;
  count: number;
};

export type AggregatedHotspotsResult = {
  aggregated: AggregatedHotspot[];
};

export async function findHotspotFiles(
  criteria: HotspotCriteria,
  limits: Limits,
  options: Options
): Promise<HotspotResult> {
  const config = loadConfig(options);

  const hotspots: Record<string, Hotspot> = await analyzeLogs(
    criteria,
    limits,
    options,
    config.filter
  );

  const filtered: FlatHotspot[] = [];
  for (const fileName of Object.keys(hotspots)) {
    const hotspot = hotspots[fileName];
    hotspot.score =
      hotspot.complexity === -1 ? -1 : hotspot.complexity * hotspot.commits;
    if (hotspot.score >= criteria.minScore) {
      filtered.push({ fileName, ...hotspot });
    }
  }

  filtered.sort((a, b) => b.score - a.score);

  return { hotspots: filtered };
}

export async function aggregateHotspots(
  criteria: HotspotCriteria,
  limits: Limits,
  options: Options
): Promise<AggregatedHotspotsResult> {
  const hotspotResult = await findHotspotFiles(criteria, limits, options);
  const hotspots = hotspotResult.hotspots;

  const config = loadConfig(options);
  const modules = config.scopes.map((m) => normalizeFolder(m));

  const result: AggregatedHotspot[] = [];
  for (const module of modules) {
    let count = 0;
    for (const hotspot of hotspots) {
      if (
        hotspot.fileName.startsWith(module) &&
        hotspot.score >= criteria.minScore
      ) {
        count++;
      }
    }
    result.push({ module: toDisplayFolder(module), count });
  }

  result.sort((a, b) => b.count - a.count);
  return { aggregated: result };
}

async function analyzeLogs(
  criteria: HotspotCriteria,
  limits: Limits,
  options: Options,
  filter: Filter
) {
  const hotspots: Record<string, Hotspot> = {};

  const parseOptions: ParseOptions = {
    limits,
    filter,
  };

  await parseGitLog((entry) => {
    for (const change of entry.body) {
      let hotspot: Hotspot;

      if (!change.path.startsWith(criteria.module)) {
        continue;
      }

      if (!hotspots[change.path]) {
        const complexity = calcComplexity(options, change, criteria);

        hotspot = {
          commits: 0,
          changedLines: 0,
          complexity,
          score: 0,
        };

        hotspots[change.path] = hotspot;
      } else {
        hotspot = hotspots[change.path];
      }

      hotspot.commits++;
      hotspot.changedLines += change.linesAdded + change.linesRemoved;
    }
  }, parseOptions);
  return hotspots;
}

function calcComplexity(
  options: Options,
  change: LogBodyEntry,
  criteria: HotspotCriteria
) {
  let complexity = 1;
  const filePath = path.join(options.path, change.path);
  if (
    criteria.metric === 'McCabe' &&
    filePath.endsWith('.ts') &&
    fs.existsSync(filePath)
  ) {
    complexity = calcCyclomaticComplexity(filePath);
  } else if (criteria.metric === 'Length' && fs.existsSync(filePath)) {
    complexity = countLinesInFile(filePath);
  }

  return complexity;
}
