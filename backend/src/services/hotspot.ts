import path from "path";
import { Options } from "../options/options";
import { parseGitLog } from "../utils/git-parser";
import * as fs from 'fs';
import { calcComplexity } from "../utils/complexity";

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

        let cc = -1;
        const filePath = path.join(options.path, change.path);
        if (filePath.endsWith('.ts') && fs.existsSync(filePath)) {
          cc = calcComplexity(filePath);
        }

        hotspot = [0, 0, cc];
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
