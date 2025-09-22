import { calcComplexityForCode } from '../../utils/complexity';

import { CommitInfo, FileChange } from './git-service';
import { CommitMetrics, FileTrendData } from './trend-analysis.types';

export class MetricsCalculator {
  calculateFileMetrics(
    commit: CommitInfo,
    fileChange: FileChange,
    fileContent: string,
    processingTime: number
  ): CommitMetrics {
    const totalLinesAtCommit = fileContent.split('\n').length;
    const mccabeComplexityAtCommit = this.calculateComplexity(
      fileChange.path,
      fileContent
    );

    return {
      commitHash: commit.hash,
      commitDate: commit.date,
      author: commit.author,
      commitMessage: commit.message,
      filePath: fileChange.path,
      linesAdded: fileChange.linesAdded,
      linesRemoved: fileChange.linesRemoved,
      totalLinesAtCommit,
      mccabeComplexityAtCommit,
      processingTimeMs: processingTime,
    };
  }

  private calculateComplexity(filePath: string, content: string): number {
    if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      return calcComplexityForCode(content);
    }
    return 1;
  }

  aggregateMetricsIntoTrends(
    fileMetrics: Map<string, CommitMetrics[]>
  ): Map<string, FileTrendData> {
    const trendData = new Map<string, FileTrendData>();

    for (const [filePath, commits] of fileMetrics.entries()) {
      commits.sort((a, b) => a.commitDate.getTime() - b.commitDate.getTime());

      const complexityTrend = commits.map((c) => ({
        commitHash: c.commitHash,
        complexity: c.mccabeComplexityAtCommit,
        date: c.commitDate,
      }));

      const sizeTrend = commits.map((c) => ({
        commitHash: c.commitHash,
        lines: c.totalLinesAtCommit,
        date: c.commitDate,
      }));

      const averageComplexity =
        commits.reduce((sum, c) => sum + c.mccabeComplexityAtCommit, 0) /
        commits.length;
      const averageSize =
        commits.reduce((sum, c) => sum + c.totalLinesAtCommit, 0) /
        commits.length;
      const totalChanges = commits.reduce(
        (sum, c) => sum + c.linesAdded + c.linesRemoved,
        0
      );

      trendData.set(filePath, {
        filePath,
        commits,
        changeFrequency: commits.length,
        complexityTrend,
        sizeTrend,
        averageComplexity: Math.round(averageComplexity * 10) / 10,
        averageSize: Math.round(averageSize),
        totalChanges,
      });
    }

    return trendData;
  }

  calculateAverageFromArray(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}
