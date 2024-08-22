import path from "path";
import { Options } from "../options/options";
import { parseGitLog } from "../utils/git-parser";
import { calculateComplexity } from 'cyclomatic-complexity/bin/src/complexity';
import * as fs from 'fs';

// tuple to reduce payload size
export type Hotspot = [
  commits: number,
  changedLines: number,
  complexity: number,
];

export type HotspotResult = {
  hotspots: Record<string, Hotspot>;
};

export type HotspotCriteria = {
  minCommits: number;
  minChangedLines: number;
  minComplexity: number;
};

export async function findHotspots(options: Options): Promise<HotspotResult> {
  const result: HotspotResult = { hotspots: {} };


  await parseGitLog((entry) => {
    for (const change of entry.body) {
      let hotspot: Hotspot;
      if (!result.hotspots[change.path]) {

        // console.log('path', change.path);
        // const filePath = path.join(options.path, change.path);
        // if (fs.existsSync(filePath)) {
        // }

        hotspot = [0, 0, 0];
        result.hotspots[change.path] = hotspot;
      } else {
        hotspot = result.hotspots[change.path];
      }

      hotspot[0]++;
      hotspot[1] += change.linesAdded + change.linesRemoved;

    }
  });

  return result;
}
