/**
 * Represents a node in the file tree structure
 */
export interface FileTreeNode {
  /** The name of the file or folder */
  name: string;

  /** The full path from the root */
  fullPath?: string;

  /** Whether this node represents a file (true) or folder (false) */
  isFile: boolean;

  /** Child nodes for folders */
  children?: FileTreeNode[];

  /** Change frequency for files */
  changeFreq?: number;

  /** Average complexity for files */
  avgComplexity?: number;

  /** Number of files in this folder (for folder nodes) */
  fileCount?: number;

  /** Whether this folder node is expanded in the tree view */
  isExpanded?: boolean;
}

/**
 * Represents a flattened tree node with level information for MatTree
 */
export interface FlatFileTreeNode extends FileTreeNode {
  /** The depth level in the tree (0 for root) */
  level: number;
}
