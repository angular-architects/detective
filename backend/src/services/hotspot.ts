import path from "path";
import { Options } from "../options/options";
import { parseGitLog } from "../utils/git-parser";
import * as fs from 'fs';
import { calcComplexity } from "../utils/complexity";
import { loadConfig } from "../infrastructure/config";
import { normalizeFolder, toDisplayFolder } from "../utils/normalize-folder";
import { Limits } from "../model/limit";

export type Hotspot = {
  commits: number,
  changedLines: number,
  complexity: number,
  score: number,
};

// tuple to reduce payload size
export type FlatHotspot = {
  fileName: string,
  commits: number,
  changedLines: number,
  complexity: number,
  score: number,
};

export type HotspotResult = {
  hotspots: FlatHotspot[];
};

export type HotspotCriteria = {
  module: string,
  minScore: number,
};

export type AggregatedHotspot = {
  module: string;
  count: number;
}

export type AggregatedHotspotsResult = {
  aggregated: AggregatedHotspot[];
}

export async function findHotspotFiles(criteria: HotspotCriteria, limits: Limits, options: Options): Promise<HotspotResult> {
  const hotspots: Record<string, Hotspot> = await analyzeLogs(criteria, limits, options);

  const filtered: FlatHotspot[] = []; 
  for (const fileName of Object.keys(hotspots)) {
    const hotspot = hotspots[fileName];
    hotspot.score = hotspot.complexity === -1 ? -1 : hotspot.complexity * hotspot.commits;
    if (hotspot.score >= criteria.minScore) {
      filtered.push({ fileName, ...hotspot });
    }
  }

  filtered.sort((a, b) => b.score - a.score);

  return { hotspots: filtered };
}

export async function aggregateHotspots(criteria: HotspotCriteria, limits: Limits, options: Options): Promise<AggregatedHotspotsResult> {
  const hotspots = (await findHotspotFiles(criteria, limits, options)).hotspots;
  const config = loadConfig(options);

  const modules = config.scopes.map(m => normalizeFolder(m));

  const result: AggregatedHotspot[] = []; 
  for (const module of modules) {
    let count = 0;
    for (const hotspot of hotspots) {
      if (hotspot.fileName.startsWith(module) && hotspot.score >= criteria.minScore) {
        count++;
      }
    }
    result.push({ module: toDisplayFolder(module), count });
  }

  result.sort((a, b) => b.count - a.count);
  return { aggregated: result };
}

async function analyzeLogs(criteria: HotspotCriteria, limits: Limits, options: Options) {
  const hotspots: Record<string, Hotspot> = {};

  await parseGitLog((entry) => {
    for (const change of entry.body) {
      let hotspot: Hotspot;

      if (!change.path.startsWith(criteria.module)) {
        continue;
      }

      if (!hotspots[change.path]) {

        let cc = 1;
        const filePath = path.join(options.path, change.path);
        if (filePath.endsWith('.ts') && fs.existsSync(filePath)) {
          cc = calcComplexity(filePath);
        }

        hotspot = {
          commits: 0,
          changedLines: 0,
          complexity: cc,
          score: 0,
        };

        hotspots[change.path] = hotspot;
      } else {
        hotspot = hotspots[change.path];
      }

      hotspot.commits++;
      hotspot.changedLines += change.linesAdded + change.linesRemoved;
    }
  }, limits);
  return hotspots;
}
