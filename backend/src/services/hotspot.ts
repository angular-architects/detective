import path from "path";
import { Options } from "../options/options";
import { parseGitLog } from "../utils/git-parser";
import * as fs from 'fs';
import { calcComplexity } from "../utils/complexity";
import { loadConfig } from "../infrastructure/config";

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
  // minCommits: number;
  // minChangedLines: number;
  // minComplexity: number;
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

export async function findHotspotFiles(criteria: HotspotCriteria, options: Options): Promise<HotspotResult> {
  const hotspots: Record<string, Hotspot> = await _findHotspots(criteria, options);

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

export async function aggregateHotspots(criteria: HotspotCriteria, options: Options): Promise<AggregatedHotspotsResult> {
  const hotspots = (await findHotspotFiles(criteria, options)).hotspots;
  const config = loadConfig(options);

  const result: AggregatedHotspot[] = []; 
  for (const module of config.scopes) {
    let count = 0;
    for (const hotspot of hotspots) {
      if (hotspot.fileName.startsWith(module) && hotspot.score >= criteria.minScore) {
        count++;
      }
    }
    result.push({ module, count });
  }

  result.sort((a, b) => b.count - a.count);
  return { aggregated: result };
}

async function _findHotspots(criteria: HotspotCriteria, options: Options) {
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
  });
  return hotspots;
}

