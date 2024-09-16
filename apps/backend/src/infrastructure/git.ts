import { spawn, spawnSync } from 'child_process';
import * as fs from 'fs';

import { noLimits } from '../model/limits';

export function isRepo(): boolean {
  return fs.existsSync('.git');
}

export function calcTreeHash(): string {
  const result = spawnSync('git', ['rev-parse', 'HEAD^{tree}'], {
    encoding: 'utf-8',
  });

  if (result.error) {
    throw new Error('Creating Git Tree Hash failed: ' + result.error.message);
  }

  if (result.status !== 0) {
    throw new Error(
      'Creating Git Tree Hash failed with exit code: ' +
        result.status +
        '\n' +
        result.stderr
    );
  }

  return result.stdout.trim();
}

export function getCommitCount(): string {
  const result = spawnSync('git', ['rev-list', '--count', 'HEAD'], {
    encoding: 'utf-8',
  });

  if (result.error) {
    throw new Error('Creating Git Tree Hash failed: ' + result.error.message);
  }

  if (result.status !== 0) {
    throw new Error(
      'Creating Git Tree Hash failed with exit code: ' +
        result.status +
        '\n' +
        result.stderr
    );
  }

  return result.stdout.trim();
}

export function getGitLog(limits = noLimits): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      const args = [
        'log',
        '--numstat',
        '--pretty=format:"%an <%ae>,%ad%x09%H,%s"',
      ];

      if (limits.limitCommits) {
        args.push('-n ' + limits.limitCommits);
      }

      if (limits.limitMonths) {
        args.push(`--since="${limits.limitMonths} months ago"`);
      }

      const subprocess = spawn('git', args);

      let text = '';
      let error = '';

      subprocess.stdout.on('data', (data: string) => {
        text += data;
      });

      subprocess.stderr.on('data', (data: string) => {
        error += data;
      });

      subprocess.on('exit', (code: string) => {
        if (code || error) {
          reject(new Error('[Error running Git] ' + error));
        } else {
          resolve(text);
        }
      });
    } catch (e) {
      reject(new Error('Error running git: ' + e));
    }
  });
}
