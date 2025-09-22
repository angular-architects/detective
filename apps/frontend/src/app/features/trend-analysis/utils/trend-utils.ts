import { FileTrend } from '../../../model/trend-analysis-result';

/**
 * Aggregates trend data from multiple files into a single trend
 * Calculates average complexity and total size for each date
 * Optimized to use a single pass through the data
 */
export function aggregateTrendData(files: FileTrend[]) {
  if (files.length === 0) {
    return { complexityTrend: [], sizeTrend: [] };
  }

  // Single pass to collect all metrics by date
  const dateMetrics = new Map<
    string,
    {
      commit: string;
      totalComplexity: number;
      complexityCount: number;
      totalLines: number;
    }
  >();

  // Process all files and their trends in a single pass
  for (const file of files) {
    // Process complexity trends
    for (const trend of file.complexityTrend) {
      if (trend.complexity === undefined) continue;

      const metrics = dateMetrics.get(trend.date);
      if (metrics) {
        metrics.totalComplexity += trend.complexity;
        metrics.complexityCount++;
      } else {
        dateMetrics.set(trend.date, {
          commit: trend.commit,
          totalComplexity: trend.complexity,
          complexityCount: 1,
          totalLines: 0,
        });
      }
    }

    // Process size trends
    for (const trend of file.sizeTrend) {
      if (trend.lines === undefined) continue;

      const metrics = dateMetrics.get(trend.date);
      if (metrics) {
        metrics.totalLines += trend.lines;
        // Update commit if not set (in case size trend appears before complexity trend)
        if (!metrics.commit) {
          metrics.commit = trend.commit;
        }
      } else {
        dateMetrics.set(trend.date, {
          commit: trend.commit,
          totalComplexity: 0,
          complexityCount: 0,
          totalLines: trend.lines,
        });
      }
    }
  }

  // Sort dates once
  const sortedDates = Array.from(dateMetrics.keys()).sort();

  // Pre-allocate arrays for better performance
  const complexityTrend = new Array(sortedDates.length);
  const sizeTrend = new Array(sortedDates.length);

  // Build both trends in a single pass
  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const metrics = dateMetrics.get(date);
    if (!metrics) continue; // Should not happen, but handle gracefully

    complexityTrend[i] = {
      date,
      complexity:
        metrics.complexityCount > 0
          ? Math.round(
              (metrics.totalComplexity / metrics.complexityCount) * 100
            ) / 100
          : 0,
      commit: metrics.commit,
    };

    sizeTrend[i] = {
      date,
      lines: metrics.totalLines,
      commit: metrics.commit,
    };
  }

  return { complexityTrend, sizeTrend };
}
