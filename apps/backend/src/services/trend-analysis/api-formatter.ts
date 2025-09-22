import { DataFormatter } from './data-formatter';
import { GitService } from './git-service';
import { TrendAnalysisResult } from './trend-analysis.types';

const dataFormatter = new DataFormatter();

export async function formatTrendAnalysisForAPI(
  result: TrendAnalysisResult,
  projectPath: string = process.cwd(),
  fileExtensions: string[] = ['.ts', '.js', '.tsx', '.jsx']
) {
  // Get ALL current files that exist in the latest commit
  const gitService = new GitService(projectPath);
  const currentFiles = await gitService.getCurrentFiles(fileExtensions);

  // Create entries for ALL current files (ground truth)
  const files = currentFiles.map((filePath) => {
    const trendData = result.fileMetrics.get(filePath);
    return dataFormatter.formatFileTrendForAPI(filePath, trendData);
  });

  return {
    files,
    summary: {
      totalProcessingTimeMs: result.totalProcessingTimeMs,
      commitsAnalyzed: result.commitsAnalyzed,
      filesAnalyzed: result.filesAnalyzed,
      commitHashes: dataFormatter.formatCommitHashes(result.commitHashes),
      timingMetrics: result.timingMetrics,
    },
  };
}
