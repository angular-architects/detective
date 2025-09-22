import { ProgressUpdate, PROGRESS_CONSTANTS } from './trend-analysis.types';

export class ProgressReporter {
  private progressCallback?: (update: ProgressUpdate) => void;

  constructor(progressCallback?: (update: ProgressUpdate) => void) {
    this.progressCallback = progressCallback;
  }

  send(
    type: ProgressUpdate['type'],
    message: string,
    progress: number,
    commitsProcessed?: number,
    totalCommits?: number,
    filesAnalyzed?: number,
    currentCommit?: string,
    currentAuthor?: string,
    processingTimeMs?: number,
    data?: unknown
  ) {
    if (this.progressCallback) {
      this.progressCallback({
        type,
        message,
        progress: Math.min(100, Math.max(0, progress)),
        commitsProcessed,
        totalCommits,
        filesAnalyzed,
        currentCommit,
        currentAuthor,
        processingTimeMs,
        data,
      });
    }
  }

  calculateBatchProgress(current: number, total: number): number {
    return (
      PROGRESS_CONSTANTS.INITIAL_PROGRESS +
      Math.round((current / total) * PROGRESS_CONSTANTS.BATCH_PROGRESS_WEIGHT)
    );
  }

  truncateCommitHash(commitHash: string): string {
    return commitHash.substring(0, PROGRESS_CONSTANTS.COMMIT_HASH_LENGTH);
  }
}
