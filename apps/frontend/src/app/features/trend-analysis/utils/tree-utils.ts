import { FileTrend } from '../../../model/trend-analysis-result';
import { FileTreeNode, FlatFileTreeNode } from '../file-tree-node.model';

import { getNodePath } from './tree-accessors';

/**
 * Builds a file tree from a flat list of file trends
 * Optionally filters files based on scopes
 */
export function buildFileTree(
  files: FileTrend[],
  scopes?: string[]
): FileTreeNode[] {
  const filteredFiles = filterFilesByScopes(files, scopes);
  const tree: FileTreeNode[] = [];
  const pathMap = new Map<string, FileTreeNode>();

  // Build tree structure from filtered files
  for (const file of filteredFiles) {
    const parts = file.filePath.split('/');
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // Skip if node already exists
      if (pathMap.has(currentPath)) continue;

      // Create new node
      const isFile = i === parts.length - 1;
      const node: FileTreeNode = {
        name: part,
        fullPath: isFile ? file.filePath : currentPath,
        isFile,
        children: isFile ? undefined : [],
        changeFreq: isFile ? file.changeFrequency : undefined,
        avgComplexity: isFile ? Math.round(file.averageComplexity) : undefined,
        isExpanded: false,
      };

      pathMap.set(currentPath, node);

      // Add to parent or root
      if (parentPath) {
        const parent = pathMap.get(parentPath);
        if (parent?.children) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    }
  }

  // Set file counts on all folder nodes
  updateFolderFileCounts(tree);
  return tree;
}

/**
 * Filters files based on provided scopes
 * @param files - Array of files to filter
 * @param scopes - Optional array of scope paths to filter by
 * @returns Filtered array of files
 */
export function filterFilesByScopes(
  files: FileTrend[],
  scopes?: string[]
): FileTrend[] {
  if (!scopes?.length) return files;

  return files.filter((file) =>
    scopes.some(
      (scope) =>
        file.filePath.startsWith(scope + '/') || file.filePath === scope
    )
  );
}

/**
 * Recursively updates folder nodes with their file counts
 * Mutates the tree by setting fileCount property on folder nodes
 * @returns Total number of files in the tree
 */
export function updateFolderFileCounts(nodes: FileTreeNode[]): number {
  if (!nodes?.length) return 0;

  let totalFiles = 0;

  for (const node of nodes) {
    if (!node) continue;

    if (node.isFile) {
      totalFiles++;
    } else if (node.children?.length) {
      const childCount = updateFolderFileCounts(node.children);
      node.fileCount = childCount;
      totalFiles += childCount;
    }
  }

  return totalFiles;
}

/**
 * Returns a set of all expanded node paths in the tree
 */
export function expandAllNodes(tree: FileTreeNode[]): Set<string> {
  const expanded = new Set<string>();

  const collectNodes = (nodes: FileTreeNode[]) => {
    for (const node of nodes) {
      if (!node.isFile && node.children?.length) {
        expanded.add(getNodePath(node));
        collectNodes(node.children);
      }
    }
  };

  collectNodes(tree);
  return expanded;
}

export function flattenTree(
  nodes: FileTreeNode[],
  expandedNodes: Set<string>,
  level = 0
): FlatFileTreeNode[] {
  if (!nodes || !Array.isArray(nodes)) return [];

  const result: FlatFileTreeNode[] = [];

  for (const node of nodes) {
    if (!node) continue;

    // Add current node with level
    const flatNode: FlatFileTreeNode = { ...node, level };
    result.push(flatNode);

    // Add children if expanded
    if (
      !node.isFile &&
      node.children &&
      Array.isArray(node.children) &&
      expandedNodes.has(getNodePath(node))
    ) {
      result.push(...flattenTree(node.children, expandedNodes, level + 1));
    }
  }

  return result;
}
