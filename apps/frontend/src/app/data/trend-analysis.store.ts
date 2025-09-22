import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, catchError, of, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  TrendAnalysisResult,
  TrendAnalysisProgress,
  FileTrend,
} from '../model/trend-analysis-result';

interface TrendAnalysisState {
  result: TrendAnalysisResult | null;
  progress: TrendAnalysisProgress | null;
  isAnalyzing: boolean;
  error: string | null;
}

const initialState: TrendAnalysisState = {
  result: null,
  progress: null,
  isAnalyzing: false,
  error: null,
};

export const TrendAnalysisStore = signalStore(
  { providedIn: 'root', protectedState: false },
  withState(initialState),
  withComputed((store) => ({
    // Computed selectors for derived state
    hasResult: computed(() => !!store.result()?.files?.length),
    totalFiles: computed(() => store.result()?.files?.length || 0),
    filesAnalyzed: computed(() => store.progress()?.filesAnalyzed || 0),
    commitsProcessed: computed(() => store.progress()?.commitsProcessed || 0),
    isComplete: computed(
      () =>
        store.progress()?.type === 'complete' ||
        store.progress()?.type === 'final_result'
    ),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    // Load trend analysis (one-time fetch)
    loadTrendAnalysis: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isAnalyzing: true, error: null })),
        switchMap((maxCommits) => {
          const url = `/api/trend-analysis?maxCommits=${maxCommits}`;
          return http.get<TrendAnalysisResult>(url).pipe(
            tap((result) => {
              patchState(store, {
                result,
                isAnalyzing: false,
                progress: null,
              });
            }),
            catchError((error) => {
              patchState(store, {
                error: error.message,
                isAnalyzing: false,
              });
              return of(null);
            })
          );
        })
      )
    ),

    // Start streaming analysis with custom Observable wrapper
    startStreamingAnalysis: rxMethod<number>(
      pipe(
        tap(() =>
          patchState(store, {
            isAnalyzing: true,
            progress: null,
            result: null,
            error: null,
          })
        ),
        switchMap((maxCommits) => {
          return createSSEObservable(
            `/api/trend-analysis/stream?maxCommits=${maxCommits}`
          ).pipe(
            tap((progress) => {
              console.log(
                'SSE received event:',
                progress.type,
                progress.message
              );
              patchState(store, { progress });

              if (progress.type === 'initial_files' && progress.data) {
                console.log(
                  'SSE: Processing initial_files event with',
                  progress.data.files?.length || 0,
                  'files'
                );
                patchState(store, { result: progress.data });
              } else if (progress.type === 'commit_complete' && progress.data) {
                console.log(
                  'SSE: Processing commit_complete event - incremental update'
                );
                const currentResult = store.result();
                if (currentResult) {
                  const updatedResult = updateIncrementalData(
                    currentResult,
                    progress.data
                  );
                  patchState(store, { result: updatedResult });
                }
              } else if (progress.type === 'final_result' && progress.data) {
                console.log('SSE: Processing final_result event with data');
                patchState(store, {
                  result: progress.data,
                  isAnalyzing: false,
                });
              } else if (progress.type === 'error') {
                console.log('SSE: Processing error event');
                patchState(store, {
                  error: progress.message || 'Analysis failed',
                  isAnalyzing: false,
                });
              }
            }),
            catchError((error) => {
              patchState(store, {
                error: error.message,
                isAnalyzing: false,
              });
              return of(null);
            })
          );
        })
      )
    ),

    // Stop analysis
    stopAnalysis: () => {
      patchState(store, {
        isAnalyzing: false,
        progress: null,
      });
    },

    // Clear result
    clearResult: () => {
      patchState(store, {
        result: null,
        progress: null,
        error: null,
      });
    },
  }))
);

// Custom Observable wrapper for SSE handling
function createSSEObservable(url: string): Observable<TrendAnalysisProgress> {
  return new Observable<TrendAnalysisProgress>((subscriber) => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const progress: TrendAnalysisProgress = JSON.parse(event.data);
        subscriber.next(progress);

        // Close the connection and complete the observable on final result or error
        if (progress.type === 'final_result' || progress.type === 'error') {
          eventSource.close();
          subscriber.complete();
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        subscriber.error(error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      subscriber.error(error);
    };

    // Cleanup function
    return () => {
      eventSource.close();
    };
  });
}

// Helper function for incremental data updates
function updateIncrementalData(
  currentResult: TrendAnalysisResult,
  incrementalData: Partial<TrendAnalysisResult> & {
    commitsAnalyzed?: number;
    filesAnalyzed?: number;
    totalProcessingTimeMs?: number;
  }
): TrendAnalysisResult {
  if (!incrementalData) return currentResult;

  console.log(
    'Updating incremental data - processing trend updates for',
    incrementalData.files?.length || 0,
    'files'
  );

  const updatedFiles = updateFilesWithTrendData(
    currentResult.files,
    incrementalData.files || []
  );
  const updatedSummary = updateSummaryData(
    currentResult.summary,
    incrementalData
  );

  const updatedResult = {
    files: updatedFiles,
    summary: updatedSummary,
  };

  console.log(
    'Updated result with incremental data - files with trends:',
    incrementalData.files?.length || 0
  );
  return updatedResult;
}

function updateFilesWithTrendData(
  currentFiles: FileTrend[],
  fileTrends: FileTrend[]
) {
  return currentFiles.map((file) => {
    const trendData = fileTrends.find(
      (trend) => trend.filePath === file.filePath
    );
    return trendData || file; // Use trend data if available, otherwise keep original
  });
}

function updateSummaryData(
  currentSummary: TrendAnalysisResult['summary'],
  incrementalData: Partial<TrendAnalysisResult> & {
    commitsAnalyzed?: number;
    filesAnalyzed?: number;
    totalProcessingTimeMs?: number;
  }
) {
  return {
    totalProcessingTimeMs:
      incrementalData.totalProcessingTimeMs ||
      currentSummary?.totalProcessingTimeMs ||
      0,
    commitsAnalyzed:
      incrementalData.commitsAnalyzed || currentSummary?.commitsAnalyzed || 0,
    filesAnalyzed:
      incrementalData.filesAnalyzed || currentSummary?.filesAnalyzed || 0,
    commitHashes: currentSummary?.commitHashes || [],
  };
}
