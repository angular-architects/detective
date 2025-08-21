import { DETECTIVE_VERSION } from '../../infrastructure/version';
import { Options } from '../../options/options';

import { CacheManager } from './cache-manager';
import { DataFormatter } from './data-formatter';
import { GitService, CommitInfo } from './git-service';
import { MetricsCalculator } from './metrics-calculator';
import { ProgressReporter } from './progress-reporter';
import {
  CommitMetrics,
  TimingMetrics,
  TrendAnalysisResult,
  TrendAnalysisOptions,
  DEFAULT_OPTIONS,
  CachedCommitMetrics,
} from './trend-analysis.types';

interface TimingData {
  gitOperationsTime: number;
  analysisTime: number;
  commitListTime: number;
  fileProcessingTime: number;
  commitTimes: number[];
  fileTimes: number[];
}

interface CommitTiming {
  commitTime: number;
  gitTime: number;
  analysisTime: number;
  fileTime: number;
  fileTimings: number[];
}

export class TrendAnalyzer {
  private options: TrendAnalysisOptions &
    Required<Omit<TrendAnalysisOptions, 'progressCallback'>>;
  private projectPath: string;
  private fileMetrics = new Map<string, CommitMetrics[]>();

  private cacheManager: CacheManager;
  private gitService: GitService;
  private metricsCalculator: MetricsCalculator;
  private dataFormatter: DataFormatter;
  private progressReporter: ProgressReporter;

  constructor(
    projectOptions: Options,
    trendOptions: TrendAnalysisOptions = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...trendOptions };
    this.projectPath = projectOptions.path;

    // Initialize services
    this.cacheManager = new CacheManager(
      this.projectPath,
      this.options.fileExtensions
    );
    this.gitService = new GitService(this.projectPath);
    this.metricsCalculator = new MetricsCalculator();
    this.dataFormatter = new DataFormatter();
    this.progressReporter = new ProgressReporter(this.options.progressCallback);
  }

  async analyzeTrends(): Promise<TrendAnalysisResult> {
    const startTime = Date.now();
    const timingData = this.initializeTimingData();
    let commitsAnalyzed = 0;
    let filesAnalyzed = 0;
    const commitHashes: string[] = [];

    this.progressReporter.send(
      'progress',
      'Starting git-based trend analysis...',
      0
    );

    try {
      // Load cache and get commits
      const cache = this.cacheManager.load();
      const { commits, commitListTime } = await this.getCommitListWithTiming();
      timingData.commitListTime = commitListTime;
      timingData.gitOperationsTime += commitListTime;

      this.progressReporter.send(
        'progress',
        `Found ${commits.length} commits to analyze (${commitListTime}ms)`,
        5
      );

      // Separate cached and new commits
      const { cachedCommitsLoaded, newCommitsToProcess } =
        await this.separateCachedCommits(commits, cache, commitHashes);

      this.progressReporter.send(
        'progress',
        `Using ${cachedCommitsLoaded} cached commits, processing ${newCommitsToProcess.length} new commits`,
        10
      );

      // Process new commits
      if (newCommitsToProcess.length > 0) {
        const processResult = await this.processNewCommits(
          newCommitsToProcess,
          cachedCommitsLoaded,
          cache,
          timingData
        );
        commitsAnalyzed = processResult.commitsAnalyzed;
        filesAnalyzed = processResult.filesAnalyzed;
        commitHashes.push(...processResult.commitHashes);

        this.cacheManager.save(cache);
      } else {
        commitsAnalyzed = cachedCommitsLoaded;
        this.progressReporter.send(
          'progress',
          'All commits found in cache, skipping processing',
          90
        );
      }

      // Calculate final trend data
      this.progressReporter.send('progress', 'Calculating trend data...', 95);
    } catch (error) {
      this.progressReporter.send(
        'error',
        `Analysis failed: ${error.message}`,
        0
      );
      throw error;
    }

    return this.buildFinalResult(
      startTime,
      timingData,
      commitsAnalyzed,
      filesAnalyzed,
      commitHashes
    );
  }

  private initializeTimingData() {
    return {
      gitOperationsTime: 0,
      analysisTime: 0,
      commitListTime: 0,
      fileProcessingTime: 0,
      commitTimes: [] as number[],
      fileTimes: [] as number[],
    };
  }

  private async getCommitListWithTiming() {
    const startTime = Date.now();
    const commits = await this.gitService.getCommitList(
      this.options.maxCommits
    );
    const commitListTime = Date.now() - startTime;
    return { commits, commitListTime };
  }

  private async separateCachedCommits(
    commits: CommitInfo[],
    cache: Map<string, CachedCommitMetrics>,
    commitHashes: string[]
  ) {
    let cachedCommitsLoaded = 0;
    const newCommitsToProcess: CommitInfo[] = [];
    const commitsToAnalyze = commits.slice(0, this.options.maxCommits);

    for (const commit of commitsToAnalyze) {
      const cacheKey = this.cacheManager.getCacheKey(commit.hash);
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (!cached) continue;
        this.loadCachedMetrics(cached.metrics);
        cachedCommitsLoaded++;
        commitHashes.push(commit.hash);
      } else {
        newCommitsToProcess.push(commit);
      }
    }

    return { cachedCommitsLoaded, newCommitsToProcess };
  }

  private loadCachedMetrics(metrics: CommitMetrics[]) {
    metrics.forEach((metric) => {
      if (!this.fileMetrics.has(metric.filePath)) {
        this.fileMetrics.set(metric.filePath, []);
      }
      this.fileMetrics.get(metric.filePath)?.push(metric);
    });
  }

  private async processNewCommits(
    newCommitsToProcess: CommitInfo[],
    cachedCommitsLoaded: number,
    cache: Map<string, CachedCommitMetrics>,
    timingData: TimingData
  ) {
    let commitsAnalyzed = cachedCommitsLoaded;
    let filesAnalyzed = 0;
    const commitHashes: string[] = [];

    const batchSize = this.options.parallelWorkers;
    for (let i = 0; i < newCommitsToProcess.length; i += batchSize) {
      const batch = newCommitsToProcess.slice(i, i + batchSize);
      const batchResult = await this.processBatch(
        batch,
        cachedCommitsLoaded,
        i,
        newCommitsToProcess.length,
        cache,
        timingData
      );

      commitsAnalyzed += batchResult.successCount;
      filesAnalyzed += batchResult.filesProcessed;
      commitHashes.push(...batchResult.commitHashes);

      // Send incremental update
      this.sendIncrementalUpdate(
        i,
        batch.length,
        batchSize,
        newCommitsToProcess.length,
        cachedCommitsLoaded,
        batchResult.batchDuration
      );
    }

    return { commitsAnalyzed, filesAnalyzed, commitHashes };
  }

  private async processBatch(
    batch: CommitInfo[],
    cachedCommitsLoaded: number,
    batchIndex: number,
    totalNewCommits: number,
    cache: Map<string, CachedCommitMetrics>,
    timingData: TimingData
  ) {
    const batchStartTime = Date.now();
    const batchPromises = batch.map((commit, index) =>
      this.processCommit(
        commit,
        cachedCommitsLoaded + batchIndex + index + 1,
        cachedCommitsLoaded + totalNewCommits
      )
    );

    const batchResults = await Promise.allSettled(batchPromises);
    let successCount = 0;
    let filesProcessed = 0;
    const commitHashes: string[] = [];

    batchResults.forEach((result, index) => {
      const commit = batch[index];
      if (result.status === 'fulfilled' && result.value) {
        const { metrics, commitHash, timing } = result.value;
        this.updateTimingData(timingData, timing);
        this.cacheCommitResult(cache, commitHash, metrics);
        this.addMetricsToFileMap(metrics);

        successCount++;
        filesProcessed += metrics.length;
        commitHashes.push(commitHash);
      } else {
        this.progressReporter.send(
          'error',
          `Failed to process commit ${this.dataFormatter.truncateCommitHash(
            commit.hash
          )}: ${
            result.status === 'rejected' ? result.reason : 'Unknown error'
          }`,
          this.progressReporter.calculateBatchProgress(
            cachedCommitsLoaded + batchIndex + index + 1,
            cachedCommitsLoaded + totalNewCommits
          )
        );
      }
    });

    return {
      successCount,
      filesProcessed,
      commitHashes,
      batchDuration: Date.now() - batchStartTime,
    };
  }

  private updateTimingData(timingData: TimingData, timing: CommitTiming) {
    timingData.commitTimes.push(timing.commitTime);
    timingData.gitOperationsTime += timing.gitTime;
    timingData.analysisTime += timing.analysisTime;
    timingData.fileProcessingTime += timing.fileTime;
    timingData.fileTimes.push(...timing.fileTimings);
  }

  private cacheCommitResult(
    cache: Map<string, CachedCommitMetrics>,
    commitHash: string,
    metrics: CommitMetrics[]
  ) {
    const cacheKey = this.cacheManager.getCacheKey(commitHash);
    cache.set(cacheKey, {
      commitHash,
      fileExtensions: [...this.options.fileExtensions],
      version: DETECTIVE_VERSION,
      timestamp: Date.now(),
      metrics: [...metrics],
    });
  }

  private addMetricsToFileMap(metrics: CommitMetrics[]) {
    metrics.forEach((metric) => {
      if (!this.fileMetrics.has(metric.filePath)) {
        this.fileMetrics.set(metric.filePath, []);
      }
      this.fileMetrics.get(metric.filePath)?.push(metric);
    });
  }

  private sendIncrementalUpdate(
    batchIndex: number,
    batchSize: number,
    totalBatchSize: number,
    totalNewCommits: number,
    cachedCommitsLoaded: number,
    batchDuration: number
  ) {
    const progressPercent = this.progressReporter.calculateBatchProgress(
      cachedCommitsLoaded + batchIndex + batchSize,
      cachedCommitsLoaded + totalNewCommits
    );

    const trendArray = this.dataFormatter.formatIncrementalTrendData(
      this.fileMetrics
    );

    this.progressReporter.send(
      'commit_complete',
      `Processed batch ${
        Math.floor(batchIndex / totalBatchSize) + 1
      }/${Math.ceil(
        totalNewCommits / totalBatchSize
      )} in ${batchDuration}ms - ${this.fileMetrics.size} files with trends`,
      progressPercent,
      cachedCommitsLoaded + batchIndex + batchSize,
      cachedCommitsLoaded + totalNewCommits,
      this.fileMetrics.size,
      undefined,
      undefined,
      batchDuration,
      {
        files: trendArray,
        commitsAnalyzed: cachedCommitsLoaded + batchIndex + batchSize,
        filesAnalyzed: this.fileMetrics.size,
        totalProcessingTimeMs: batchDuration,
      }
    );
  }

  private async processCommit(
    commit: CommitInfo,
    commitNumber: number,
    totalCommits: number
  ): Promise<{
    metrics: CommitMetrics[];
    commitHash: string;
    timing: {
      commitTime: number;
      gitTime: number;
      analysisTime: number;
      fileTime: number;
      fileTimings: number[];
    };
  } | null> {
    const commitStartTime = Date.now();
    let gitTime = 0;
    let analysisTime = 0;
    let fileTime = 0;
    const fileTimings: number[] = [];

    try {
      this.progressReporter.send(
        'progress',
        `Processing commit ${commitNumber}/${totalCommits}: ${this.dataFormatter.truncateCommitHash(
          commit.hash
        )}`,
        this.progressReporter.calculateBatchProgress(
          commitNumber,
          totalCommits
        ),
        commitNumber - 1,
        totalCommits,
        undefined,
        commit.hash,
        commit.author
      );

      // Get changed files
      const gitStartTime = Date.now();
      const changedFiles = await this.gitService.getChangedFiles(commit.hash);
      gitTime += Date.now() - gitStartTime;

      // Analyze files
      const analysisStartTime = Date.now();
      const filePromises = changedFiles
        .filter((fileChange) => this.shouldAnalyzeFile(fileChange.path))
        .map((fileChange) => this.analyzeFileAtCommit(commit, fileChange));

      const fileResults = await Promise.allSettled(filePromises);
      analysisTime += Date.now() - analysisStartTime;

      const commitMetrics: CommitMetrics[] = [];
      fileResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const { metrics, timing } = result.value;
          commitMetrics.push(metrics);
          fileTime += timing;
          fileTimings.push(timing);

          this.progressReporter.send(
            'file_analyzed',
            `${metrics.filePath}: ${metrics.totalLinesAtCommit} lines, complexity ${metrics.mccabeComplexityAtCommit} (${timing}ms)`,
            this.progressReporter.calculateBatchProgress(
              commitNumber,
              totalCommits
            ),
            commitNumber,
            totalCommits
          );
        }
      });

      const commitTime = Date.now() - commitStartTime;
      this.progressReporter.send(
        'commit_complete',
        `Commit ${commit.hash.substring(0, 8)} completed in ${commitTime}ms (${
          commitMetrics.length
        } files, git: ${gitTime}ms, analysis: ${analysisTime}ms)`,
        this.progressReporter.calculateBatchProgress(
          commitNumber,
          totalCommits
        ),
        commitNumber,
        totalCommits,
        undefined,
        commit.hash,
        commit.author,
        commitTime
      );

      return {
        metrics: commitMetrics,
        commitHash: commit.hash,
        timing: { commitTime, gitTime, analysisTime, fileTime, fileTimings },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.progressReporter.send(
        'error',
        `Error processing commit ${this.dataFormatter.truncateCommitHash(
          commit.hash
        )}: ${errorMessage}`,
        this.progressReporter.calculateBatchProgress(commitNumber, totalCommits)
      );
      return null;
    }
  }

  private shouldAnalyzeFile(filePath: string): boolean {
    return this.options.fileExtensions.some((ext) => filePath.endsWith(ext));
  }

  private async analyzeFileAtCommit(
    commit: CommitInfo,
    fileChange: { path: string; linesAdded: number; linesRemoved: number }
  ): Promise<{ metrics: CommitMetrics; timing: number } | null> {
    const fileStartTime = Date.now();

    try {
      const fileContent = await this.gitService.getFileContentAtCommit(
        commit.hash,
        fileChange.path
      );

      if (!fileContent) {
        return null;
      }

      const processingTime = Date.now() - fileStartTime;
      const metrics = this.metricsCalculator.calculateFileMetrics(
        commit,
        fileChange,
        fileContent,
        processingTime
      );

      return { metrics, timing: processingTime };
    } catch (error) {
      return null;
    }
  }

  private buildFinalResult(
    startTime: number,
    timingData: TimingData,
    commitsAnalyzed: number,
    filesAnalyzed: number,
    commitHashes: string[]
  ): TrendAnalysisResult {
    const totalTime = Date.now() - startTime;
    const trendData = this.metricsCalculator.aggregateMetricsIntoTrends(
      this.fileMetrics
    );

    const timingMetrics: TimingMetrics = {
      totalTime,
      gitOperationsTime: timingData.gitOperationsTime,
      analysisTime: timingData.analysisTime,
      commitListTime: timingData.commitListTime,
      fileProcessingTime: timingData.fileProcessingTime,
      averageCommitTime: this.metricsCalculator.calculateAverageFromArray(
        timingData.commitTimes
      ),
      averageFileTime: this.metricsCalculator.calculateAverageFromArray(
        timingData.fileTimes
      ),
    };

    const result: TrendAnalysisResult = {
      fileMetrics: trendData,
      totalProcessingTimeMs: totalTime,
      commitsAnalyzed,
      filesAnalyzed,
      commitHashes,
      timingMetrics,
    };

    this.progressReporter.send(
      'complete',
      `Analysis complete: ${commitsAnalyzed} commits, ${this.fileMetrics.size} files (Total: ${totalTime}ms, Git ops: ${timingData.gitOperationsTime}ms, Analysis: ${timingData.analysisTime}ms)`,
      100,
      commitsAnalyzed,
      commitsAnalyzed,
      filesAnalyzed,
      undefined,
      undefined,
      totalTime,
      result
    );

    return result;
  }
}

export async function runTrendAnalysis(
  projectOptions: Options,
  trendOptions: TrendAnalysisOptions = {}
): Promise<TrendAnalysisResult> {
  const analyzer = new TrendAnalyzer(projectOptions, trendOptions);
  return analyzer.analyzeTrends();
}
