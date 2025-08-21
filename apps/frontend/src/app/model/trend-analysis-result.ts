export interface CommitMetric {
  commitHash: string;
  date: string;
  author: string;
  message: string;
  linesAdded: number;
  linesRemoved: number;
  totalLines: number;
  complexity: number;
}

export interface TrendPoint {
  commit: string;
  date: string;
  complexity?: number;
  lines?: number;
}

export interface FileTrend {
  filePath: string;
  changeFrequency: number;
  averageComplexity: number;
  averageSize: number;
  totalChanges: number;
  commits: CommitMetric[];
  complexityTrend: TrendPoint[];
  sizeTrend: TrendPoint[];
}

export interface TrendAnalysisResult {
  files: FileTrend[];
  summary: {
    totalProcessingTimeMs: number;
    commitsAnalyzed: number;
    filesAnalyzed: number;
    commitHashes: string[];
  };
}

export interface TrendAnalysisProgress {
  type:
    | 'progress'
    | 'commit_complete'
    | 'file_analyzed'
    | 'complete'
    | 'error'
    | 'final_result'
    | 'initial_files';
  message: string;
  progress: number;
  commitsProcessed?: number;
  totalCommits?: number;
  filesAnalyzed?: number;
  currentCommit?: string;
  currentAuthor?: string;
  processingTimeMs?: number;
  data?: TrendAnalysisResult;
}

export const initTrendAnalysisResult: TrendAnalysisResult = {
  files: [],
  summary: {
    totalProcessingTimeMs: 0,
    commitsAnalyzed: 0,
    filesAnalyzed: 0,
    commitHashes: [],
  },
};
