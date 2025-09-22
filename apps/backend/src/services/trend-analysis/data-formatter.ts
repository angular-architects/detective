import {
  CommitMetrics,
  FileTrendData,
  PROGRESS_CONSTANTS,
} from './trend-analysis.types';

export class DataFormatter {
  formatCommitForAPI(commit: CommitMetrics) {
    return {
      commitHash: this.truncateCommitHash(commit.commitHash),
      date: commit.commitDate.toISOString(),
      author: commit.author,
      message: commit.commitMessage.trim(),
      linesAdded: commit.linesAdded,
      linesRemoved: commit.linesRemoved,
      totalLines: commit.totalLinesAtCommit,
      complexity: commit.mccabeComplexityAtCommit,
    };
  }

  formatTrendPointForAPI(trend: {
    commitHash: string;
    complexity?: number;
    lines?: number;
    date: Date;
  }) {
    const base = {
      commit: this.truncateCommitHash(trend.commitHash),
      date: trend.date.toISOString(),
    };
    return 'complexity' in trend
      ? { ...base, complexity: trend.complexity }
      : { ...base, lines: trend.lines };
  }

  formatFileTrendForAPI(filePath: string, trendData?: FileTrendData) {
    if (!trendData) {
      return {
        filePath,
        changeFrequency: 0,
        averageComplexity: 0,
        averageSize: 0,
        totalChanges: 0,
        commits: [],
        complexityTrend: [],
        sizeTrend: [],
      };
    }

    return {
      filePath,
      changeFrequency: trendData.changeFrequency,
      averageComplexity: trendData.averageComplexity,
      averageSize: trendData.averageSize,
      totalChanges: trendData.totalChanges,
      commits: trendData.commits.map((c) => this.formatCommitForAPI(c)),
      complexityTrend: trendData.complexityTrend.map((t) =>
        this.formatTrendPointForAPI({ ...t, complexity: t.complexity })
      ),
      sizeTrend: trendData.sizeTrend.map((t) =>
        this.formatTrendPointForAPI({ ...t, lines: t.lines })
      ),
    };
  }

  formatIncrementalTrendData(fileMetrics: Map<string, CommitMetrics[]>) {
    const trendArray: ReturnType<typeof this.formatFileTrendForAPI>[] = [];

    for (const [filePath, commits] of fileMetrics.entries()) {
      const latestCommit = commits[commits.length - 1];
      if (latestCommit) {
        const averageComplexity =
          Math.round(
            (commits.reduce((sum, c) => sum + c.mccabeComplexityAtCommit, 0) /
              commits.length) *
              10
          ) / 10;
        const averageSize = Math.round(
          commits.reduce((sum, c) => sum + c.totalLinesAtCommit, 0) /
            commits.length
        );
        const totalChanges = commits.reduce(
          (sum, c) => sum + c.linesAdded + c.linesRemoved,
          0
        );

        trendArray.push({
          filePath,
          changeFrequency: commits.length,
          averageComplexity,
          averageSize,
          totalChanges,
          commits: commits.map((c) => this.formatCommitForAPI(c)),
          complexityTrend: commits.map((c) => ({
            commit: this.truncateCommitHash(c.commitHash),
            date: c.commitDate.toISOString(),
            complexity: c.mccabeComplexityAtCommit,
          })),
          sizeTrend: commits.map((c) => ({
            commit: this.truncateCommitHash(c.commitHash),
            date: c.commitDate.toISOString(),
            lines: c.totalLinesAtCommit,
          })),
        });
      }
    }

    return trendArray;
  }

  truncateCommitHash(commitHash: string): string {
    return commitHash.substring(0, PROGRESS_CONSTANTS.COMMIT_HASH_LENGTH);
  }

  formatCommitHashes(hashes: string[]): string[] {
    return hashes.map((h) => this.truncateCommitHash(h));
  }
}
