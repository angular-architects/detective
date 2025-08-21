import { FileTrend } from '../../../model/trend-analysis-result';

import { aggregateTrendData } from './trend-utils';

/**
 * Calculate comprehensive metrics for a collection of files in a folder
 */
export function calculateFolderMetrics(
  filesInFolder: FileTrend[],
  folderPath: string
) {
  if (filesInFolder.length === 0) return null;

  const metrics = calculateFileMetrics(filesInFolder);
  const aggregatedTrends = aggregateTrendData(filesInFolder);

  return {
    folderName: extractFolderName(folderPath),
    folderPath,
    fileCount: filesInFolder.length,
    ...metrics,
    files: filesInFolder,
    complexityTrend: aggregatedTrends.complexityTrend,
    sizeTrend: aggregatedTrends.sizeTrend,
  };
}

/**
 * Extract folder name from path
 */
function extractFolderName(folderPath: string): string {
  return folderPath.split('/').pop() || folderPath;
}

/**
 * Calculate all file metrics in a single iteration for optimal performance
 * Computes complexity, size, and change metrics together
 */
function calculateFileMetrics(files: FileTrend[]) {
  // Initialize accumulators
  let totalComplexity = 0;
  let totalSize = 0;
  let totalChanges = 0;
  let maxComplexity = -Infinity;
  let minComplexity = Infinity;

  // Single pass through all files
  for (const file of files) {
    totalComplexity += file.averageComplexity;
    totalSize += file.averageSize;
    totalChanges += file.totalChanges;

    if (file.averageComplexity > maxComplexity) {
      maxComplexity = file.averageComplexity;
    }
    if (file.averageComplexity < minComplexity) {
      minComplexity = file.averageComplexity;
    }
  }

  const fileCount = files.length;

  return {
    avgComplexity: roundToTwoDecimals(totalComplexity / fileCount),
    maxComplexity: roundToTwoDecimals(maxComplexity),
    minComplexity: roundToTwoDecimals(minComplexity),
    avgSize: Math.round(totalSize / fileCount),
    totalChanges,
    avgChangeFreq: roundToTwoDecimals(totalChanges / fileCount),
  };
}

/**
 * Round a number to two decimal places
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
