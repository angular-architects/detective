import * as fs from 'fs';
import * as path from 'path';

import { DETECTIVE_DIR, TREND_CACHE_FILE } from '../../infrastructure/paths';
import { DETECTIVE_VERSION } from '../../infrastructure/version';

import { CachedCommitMetrics, CommitMetrics } from './trend-analysis.types';

export class CacheManager {
  private projectPath: string;
  private fileExtensions: string[];

  constructor(projectPath: string, fileExtensions: string[]) {
    this.projectPath = projectPath;
    this.fileExtensions = fileExtensions;
  }

  private getCacheFilePath(): string {
    const detectiveDir = path.join(this.projectPath, DETECTIVE_DIR);
    if (!fs.existsSync(detectiveDir)) {
      fs.mkdirSync(detectiveDir, { recursive: true });
    }
    return path.join(detectiveDir, TREND_CACHE_FILE);
  }

  getCacheKey(commitHash: string): string {
    return `${commitHash}:${this.fileExtensions.join(
      ','
    )}:${DETECTIVE_VERSION}`;
  }

  load(): Map<string, CachedCommitMetrics> {
    const cacheFile = this.getCacheFilePath();
    if (!fs.existsSync(cacheFile)) {
      return new Map();
    }

    try {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      const cache = new Map<string, CachedCommitMetrics>();

      if (cacheData.commitCache && Array.isArray(cacheData.commitCache)) {
        for (const [commitHash, cached] of cacheData.commitCache) {
          if (
            cached.version === DETECTIVE_VERSION &&
            this.arraysEqual(cached.fileExtensions, this.fileExtensions)
          ) {
            cached.metrics = cached.metrics.map(
              (m: CommitMetrics & { commitDate: string }) => ({
                ...m,
                commitDate: new Date(m.commitDate),
              })
            );
            cache.set(commitHash, cached);
          }
        }
      }

      console.log(`[TREND-CACHE] Loaded ${cache.size} cached commits`);
      return cache;
    } catch (error) {
      console.warn(
        '[TREND-CACHE] Failed to load cache, starting fresh:',
        error.message
      );
      return new Map();
    }
  }

  save(cache: Map<string, CachedCommitMetrics>): void {
    try {
      const cacheFile = this.getCacheFilePath();
      const cacheData = {
        version: DETECTIVE_VERSION,
        commitCache: Array.from(cache.entries()),
      };

      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), 'utf-8');
      console.log(`[TREND-CACHE] Saved ${cache.size} commits to cache`);
    } catch (error) {
      console.warn('[TREND-CACHE] Failed to save cache:', error.message);
    }
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }
}
