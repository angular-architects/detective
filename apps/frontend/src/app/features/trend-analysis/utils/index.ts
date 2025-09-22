// Model exports
export { FileTreeNode } from '../file-tree-node.model';

// Tree building and manipulation utilities
export {
  buildFileTree,
  updateFolderFileCounts,
  expandAllNodes,
  filterFilesByScopes,
  flattenTree,
} from './tree-utils';

// Tree accessor functions for MatTree
export { childrenAccessor, isExpandable, getNodePath } from './tree-accessors';

// Trend data aggregation utilities
export { aggregateTrendData } from './trend-utils';

// Metrics calculation utilities
export { calculateFolderMetrics } from './metrics-utils';
