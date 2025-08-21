// Refactored trend analysis components
export { TrendAnalyzer, runTrendAnalysis } from './trend-analyzer';
export { CacheManager } from './cache-manager';
export { GitService } from './git-service';
export { MetricsCalculator } from './metrics-calculator';
export { DataFormatter } from './data-formatter';
export { ProgressReporter } from './progress-reporter';

// Keep compatibility with existing API
export { formatTrendAnalysisForAPI } from './api-formatter';

// Export types
export * from './trend-analysis.types';
