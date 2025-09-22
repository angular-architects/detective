import { spawn } from 'child_process';

export interface CommitInfo {
  hash: string;
  date: Date;
  author: string;
  message: string;
}

export interface FileChange {
  path: string;
  linesAdded: number;
  linesRemoved: number;
}

export class GitService {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  private async executeCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const gitProcess = spawn('git', args, {
        cwd: this.projectPath,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      gitProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      gitProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Git command failed (${code}): ${stderr}`));
          return;
        }
        resolve(stdout);
      });

      gitProcess.on('error', (error) => {
        reject(new Error(`Failed to spawn git process: ${error.message}`));
      });
    });
  }

  async getCommitList(maxCommits: number): Promise<CommitInfo[]> {
    try {
      const output = await this.executeCommand([
        'log',
        `--max-count=${maxCommits * 2}`,
        '--pretty=format:%H|%ai|%an|%s',
        '--no-merges',
      ]);

      const commits: CommitInfo[] = [];
      const lines = output
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      for (const line of lines) {
        const parts = line.split('|');
        if (parts.length >= 4) {
          commits.push({
            hash: parts[0],
            date: new Date(parts[1]),
            author: parts[2],
            message: parts.slice(3).join('|'),
          });
        }
      }

      return commits;
    } catch (error) {
      throw new Error(`Failed to get commit list: ${error.message}`);
    }
  }

  async getChangedFiles(commitHash: string): Promise<FileChange[]> {
    try {
      const output = await this.executeCommand([
        'show',
        '--numstat',
        '--format=',
        commitHash,
      ]);

      const changes: FileChange[] = [];
      const lines = output
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length >= 3) {
          const added = parts[0] === '-' ? 0 : parseInt(parts[0], 10) || 0;
          const removed = parts[1] === '-' ? 0 : parseInt(parts[1], 10) || 0;
          const filePath = parts.slice(2).join('\t');

          changes.push({
            path: filePath,
            linesAdded: added,
            linesRemoved: removed,
          });
        }
      }

      return changes;
    } catch (error) {
      return [];
    }
  }

  async getFileContentAtCommit(
    commitHash: string,
    filePath: string
  ): Promise<string | null> {
    try {
      const content = await this.executeCommand([
        'show',
        `${commitHash}:${filePath}`,
      ]);
      return content;
    } catch (error) {
      return null;
    }
  }

  async getCurrentFiles(fileExtensions: string[]): Promise<string[]> {
    try {
      const output = await this.executeCommand(['ls-files']);

      const allFiles = output
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      return allFiles.filter((filePath) =>
        fileExtensions.some((ext) => filePath.endsWith(ext))
      );
    } catch (error) {
      throw new Error(`Failed to get current files: ${error.message}`);
    }
  }
}
