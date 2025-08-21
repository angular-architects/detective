/**
 * Type definitions for trend analysis functionality
 */

// Constants for progress calculation and display
export const PROGRESS_CONSTANTS = {
  INITIAL_PROGRESS: 15,
  BATCH_PROGRESS_WEIGHT: 80,
  FINAL_PROGRESS: 95,
  COMMIT_HASH_LENGTH: 8,
} as const;

/**
 * Cache entry for a single commit's file metrics
 */
export type CachedCommitMetrics = {
  commitHash: string;
  fileExtensions: string[];
  version: string;
  timestamp: number;
  metrics: CommitMetrics[];
};

/**
 * Complete cache structure for trend analysis
 */
export type TrendAnalysisCache = {
  version: string;
  commitCache: Map<string, CachedCommitMetrics>;
};

/**
 * Metrics for a single commit affecting a specific file
 */
export type CommitMetrics = {
  commitHash: string;
  commitDate: Date;
  author: string;
  commitMessage: string;
  filePath: string;
  linesAdded: number;
  linesRemoved: number;
  totalLinesAtCommit: number;
  mccabeComplexityAtCommit: number;
  processingTimeMs: number;
};

/**
 * Aggregated trend data for a file across multiple commits
 */
export type FileTrendData = {
  filePath: string;
  commits: CommitMetrics[];
  changeFrequency: number;
  complexityTrend: Array<{
    commitHash: string;
    complexity: number;
    date: Date;
  }>;
  sizeTrend: Array<{ commitHash: string; lines: number; date: Date }>;
  averageComplexity: number;
  averageSize: number;
  totalChanges: number;
};

/**
 * Timing metrics for performance monitoring
 */
export type TimingMetrics = {
  totalTime: number;
  gitOperationsTime: number;
  analysisTime: number;
  commitListTime: number;
  fileProcessingTime: number;
  averageCommitTime: number;
  averageFileTime: number;
};

/**
 * Complete result of trend analysis
 */
export type TrendAnalysisResult = {
  fileMetrics: Map<string, FileTrendData>;
  totalProcessingTimeMs: number;
  commitsAnalyzed: number;
  filesAnalyzed: number;
  commitHashes: string[];
  timingMetrics: TimingMetrics;
};

/**
 * Progress update for streaming analysis results
 */
export type ProgressUpdate = {
  type: 'progress' | 'commit_complete' | 'file_analyzed' | 'complete' | 'error';
  message: string;
  progress: number; // 0-100
  commitsProcessed?: number;
  totalCommits?: number;
  filesAnalyzed?: number;
  currentCommit?: string;
  currentAuthor?: string;
  processingTimeMs?: number;
  data?: unknown;
};

/**
 * Configuration options for trend analysis
 */
export type TrendAnalysisOptions = {
  maxCommits?: number;
  fileExtensions?: string[];
  progressCallback?: (update: ProgressUpdate) => void;
  parallelWorkers?: number; // Number of parallel workers (default 5)
};

/**
 * Default options for trend analysis
 */
export const DEFAULT_OPTIONS: Required<
  Omit<TrendAnalysisOptions, 'progressCallback'>
> = {
  maxCommits: 20,
  fileExtensions: ['.ts', '.js', '.tsx', '.jsx'],
  parallelWorkers: 5,
};
