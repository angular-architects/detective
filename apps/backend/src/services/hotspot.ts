import * as fs from 'fs';
import path from 'path';

import { loadConfig } from '../infrastructure/config';
import { Filter } from '../model/config';
import { Limits } from '../model/limits';
import { Options } from '../options/options';
import { calcCyclomaticComplexity } from '../utils/complexity';
import { countLinesInFile } from '../utils/count-lines';
import { LogBodyEntry, parseGitLog, ParseOptions } from '../utils/git-parser';
import { normalizeFolder, toDisplayFolder } from '../utils/normalize-folder';

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
  parent: string;
  module: string;
  count: number;
  countBelow: number;
};

export type AggregatedHotspotsResult = {
  aggregated: AggregatedHotspot[];
  minScore: number;
  maxScore: number;
  boundary: number;
};

type Stats = {
  maxScore: number;
  scores: Map<string, number[]>;
  minScore: number;
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
  const phase1Criteria = {
    ...criteria,
    minScore: 0,
  };

  const hotspotResult = await findHotspotFiles(phase1Criteria, limits, options);
  const hotspots = hotspotResult.hotspots;

  const config = loadConfig(options);
  const modules = config.scopes.map((m) => normalizeFolder(m));

  const stats = collectStats(modules, hotspots);

  const boundary = stats.maxScore * (criteria.minScore / 100);
  const result = aggregateStats(modules, stats, boundary);

  result.sort((a, b) => b.count - a.count);

  return {
    aggregated: result,
    maxScore: stats.maxScore,
    minScore: stats.minScore,
    boundary,
  };
}

function aggregateStats(
  modules: string[],
  stats: Stats,
  boundary: number
): AggregatedHotspot[] {
  const result: AggregatedHotspot[] = [];
  for (const module of modules) {
    const moduleStats = stats.scores.get(module);
    const count = moduleStats.reduce(
      (acc, v) => (v > boundary ? acc + 1 : acc),
      0
    );
    const countBelow = moduleStats.length - count;

    const displayFolder = toDisplayFolder(module);
    const parent = path.dirname(displayFolder);

    result.push({
      parent,
      module: displayFolder,
      count,
      countBelow,
    });
  }
  return result;
}

function collectStats(modules: string[], hotspots: FlatHotspot[]) {
  let minScore = Number.MAX_VALUE;
  let maxScore = 0;
  const scores = new Map<string, number[]>();

  for (const module of modules) {
    const moduleScores = [];
    for (const hotspot of hotspots) {
      if (hotspot.fileName.startsWith(module)) {
        minScore = Math.min(minScore, hotspot.score);
        maxScore = Math.max(maxScore, hotspot.score);
        moduleScores.push(hotspot.score);
      }
    }
    scores.set(module, moduleScores);
  }
  return { maxScore, scores, minScore };
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

  const module = criteria.module ? normalizeFolder(criteria.module) : '';

  await parseGitLog((entry) => {
    for (const change of entry.body) {
      let hotspot: Hotspot;

      if (!change.path.startsWith(module)) {
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
