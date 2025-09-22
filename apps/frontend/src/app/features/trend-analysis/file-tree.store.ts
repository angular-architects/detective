import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from 'rxjs';

import { ConfigService } from '../../data/config.service';
import { TrendAnalysisStore } from '../../data/trend-analysis.store';
import { FileTrend } from '../../model/trend-analysis-result';
import { EventService } from '../../utils/event.service';

import { FileTreeNode } from './file-tree-node.model';
import {
  buildFileTree,
  expandAllNodes,
  calculateFolderMetrics,
  childrenAccessor,
  isExpandable,
  filterFilesByScopes,
  getNodePath,
  flattenTree,
} from './utils';

export const FileTreeStore = signalStore(
  { providedIn: 'root' },
  withState({
    maxCommits: 100,
    scopes: [] as string[],
    expandedNodes: new Set<string>(),
    selectedFile: null as string | null,
    selectedFolder: null as string | null,
  }),
  withComputed((store) => {
    const trendAnalysisStore = inject(TrendAnalysisStore);
    const files = computed<FileTrend[]>(() => {
      const result = trendAnalysisStore.result();
      if (!result) return [] as FileTrend[];
      return result.files;
    });

    // Reactive filtered files based on scopes
    const filteredFiles = computed(() => {
      return filterFilesByScopes(files(), store.scopes());
    });

    const selectedFolderFiles = computed(() => {
      const folderPath = store.selectedFolder();
      const files = filteredFiles();

      if (!folderPath || !files.length) return [];

      return files.filter((file) => file.filePath.startsWith(folderPath + '/'));
    });

    // Define treeData
    const treeData = computed(() => {
      return buildFileTree(files(), store.scopes());
    });

    const selectedFileTrend = computed<FileTrend | null>(() => {
      const selectedPath = store.selectedFile();
      const resultData = trendAnalysisStore.result();
      if (!selectedPath || !resultData || !resultData.files) return null;

      return (
        resultData.files.find((file) => file.filePath === selectedPath) || null
      );
    });

    const computeDelta = (
      points: { date: string; complexity?: number; lines?: number }[]
    ) => {
      if (!points || points.length < 2)
        return { complexityDelta: 0, linesDelta: 0 };
      const first = points[0];
      const last = points[points.length - 1];
      const complexityDelta = (last.complexity || 0) - (first.complexity || 0);
      const linesDelta = (last.lines || 0) - (first.lines || 0);
      return { complexityDelta, linesDelta };
    };

    const topComplexityIncreases = computed(() => {
      return filteredFiles()
        .map((f) => {
          const { complexityDelta } = computeDelta(f.complexityTrend || []);
          return { filePath: f.filePath, delta: complexityDelta, file: f };
        })
        .filter((x) => x.delta > 0)
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 10);
    });

    const topSizeIncreases = computed(() => {
      return filteredFiles()
        .map((f) => {
          const { linesDelta } = computeDelta(f.sizeTrend || []);
          return { filePath: f.filePath, delta: linesDelta, file: f };
        })
        .filter((x) => x.delta > 0)
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 10);
    });

    return {
      files,
      filteredFiles,
      treeData,
      selectedFolderFiles,
      selectedFileTrend,
      topComplexityIncreases,
      topSizeIncreases,
      progress: computed(() => trendAnalysisStore.progress()),
      // Computed metrics for selected folder
      selectedFolderMetrics: computed(() => {
        const folderPath = store.selectedFolder();
        const filesInFolder = selectedFolderFiles();

        if (!folderPath) return null;

        return calculateFolderMetrics(filesInFolder, folderPath);
      }),

      selectedFileData: computed(() => {
        const filePath = store.selectedFile();
        const files = filteredFiles();

        if (!filePath) return null;

        return files.find((f) => f.filePath === filePath) || null;
      }),

      flattenedTreeData: computed(() => {
        const tree = treeData();
        const expandedNodes = store.expandedNodes();

        if (!tree || !Array.isArray(tree) || tree.length === 0) {
          return [];
        }

        return flattenTree(tree, expandedNodes);
      }),

      fileCountDisplay: computed(() => {
        const totalFiles = files().length;
        const displayedFiles = treeData().length;

        return {
          totalFiles,
          displayedFiles,
          isFiltered: displayedFiles !== totalFiles,
          isEmpty: totalFiles === 0,
        };
      }),

      hasFiles: computed(() => files().length > 0),
      hasTreeData: computed(() => treeData().length > 0),
      hasSelectedFolder: computed(() => !!store.selectedFolder()),
      hasSelectedFile: computed(() => !!store.selectedFile()),
      hasSelectedFileTrend: computed(() => !!selectedFileTrend()),
    };
  }),
  withMethods(
    (
      store,
      configService = inject(ConfigService),
      trendAnalysisStore = inject(TrendAnalysisStore)
    ) => ({
      loadAndUpdateConfig: rxMethod<void>(($ev) =>
        $ev.pipe(
          switchMap(() => configService.load()),
          tap((config) => {
            if (config?.scopes) {
              patchState(store, { scopes: config.scopes });
            }
          })
        )
      ),

      startAnalysis: rxMethod<void>(($ev) =>
        $ev.pipe(
          tap(() => {
            trendAnalysisStore.startStreamingAnalysis(store.maxCommits());
          })
        )
      ),

      childrenAccessor: () => childrenAccessor,
      isExpandable: () => isExpandable,

      isExpanded:
        () =>
        (node: FileTreeNode): boolean => {
          return store.expandedNodes().has(getNodePath(node));
        },

      setScopes: (scopes: string[]) => {
        patchState(store, { scopes });
      },

      updateMaxCommits: (maxCommits: number) => {
        patchState(store, { maxCommits });
      },

      toggleNode: (node: FileTreeNode) => {
        const nodePath = getNodePath(node);
        const expanded = new Set(store.expandedNodes());

        if (expanded.has(nodePath)) {
          expanded.delete(nodePath);
        } else {
          expanded.add(nodePath);
        }

        patchState(store, { expandedNodes: expanded });
      },

      expandAll: () => {
        const tree = store.treeData();
        const expanded = expandAllNodes(tree);
        patchState(store, { expandedNodes: expanded });
      },

      collapseAll: () => {
        patchState(store, { expandedNodes: new Set<string>() });
      },

      selectFile: (filePath: string | null) => {
        patchState(store, {
          selectedFile: filePath,
          selectedFolder: null,
        });
      },

      selectFolder: (folderPath: string | null) => {
        patchState(store, {
          selectedFolder: folderPath,
          selectedFile: null,
        });
      },

      clearSelections: () => {
        patchState(store, {
          selectedFile: null,
          selectedFolder: null,
        });
      },

      expandPathToFile: (filePath: string) => {
        const pathParts = filePath.split('/');
        const expanded = new Set(store.expandedNodes());
        let currentPath = '';

        for (let i = 0; i < pathParts.length - 1; i++) {
          currentPath += (i > 0 ? '/' : '') + pathParts[i];
          expanded.add(currentPath);
        }

        patchState(store, { expandedNodes: expanded });
      },

      reset: () => {
        patchState(store, {
          maxCommits: 100,
          scopes: [],
          expandedNodes: new Set<string>(),
          selectedFile: null,
          selectedFolder: null,
        });
      },
    })
  ),
  withHooks({
    onInit: (store) => {
      store.loadAndUpdateConfig(inject(EventService).filterChanged);
      store.loadAndUpdateConfig();
      store.startAnalysis(store.maxCommits);
    },
  })
);
