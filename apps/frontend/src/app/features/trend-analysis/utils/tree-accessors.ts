import { FileTreeNode } from '../file-tree-node.model';

/**
 * MatTree accessor function to get children of a node
 */
export const childrenAccessor = (node: FileTreeNode): FileTreeNode[] =>
  node.children || [];

/**
 * MatTree accessor function to check if a node is expandable
 */
export const isExpandable = (node: FileTreeNode): boolean =>
  !!node.children && node.children.length > 0;

/**
 * Gets the full path of a node, falling back to name if fullPath is not available
 */
export const getNodePath = (node: FileTreeNode): string =>
  node.fullPath || node.name;
