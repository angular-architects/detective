#!/usr/bin/env node

import * as os from 'os';
import * as path from 'path';

import { setupExpress } from './express';
import { updateTrendAnalysisStatus } from './express';
import { ensureConfig } from './infrastructure/config';
import { getEntryGlobs, inferDeps } from './infrastructure/deps';
import { isRepo, findGitRoot } from './infrastructure/git';
import { DETECTIVE_VERSION } from './infrastructure/version';
import { parseOptions } from './options/parse-options';
import {
  runTrendAnalysis,
  formatTrendAnalysisForAPI,
} from './services/trend-analysis';
import { openSync } from './utils/open';

const options = parseOptions(process.argv.slice(2));

let originalUserPath = process.cwd();

if (options.path) {
  // Expand ~ to home directory if needed
  let targetPath = options.path;
  if (targetPath.startsWith('~/')) {
    targetPath = path.join(os.homedir(), targetPath.slice(2));
  } else if (targetPath === '~') {
    targetPath = os.homedir();
  }

  originalUserPath = path.resolve(targetPath);
  console.log(`User selected directory: ${originalUserPath}`);

  // Find the git root from the user's selected path
  const gitRoot = findGitRoot(targetPath);
  if (gitRoot) {
    console.log(`Found git repository root: ${gitRoot}`);
    if (gitRoot !== originalUserPath) {
      const relativePath = path.relative(gitRoot, originalUserPath);
      if (relativePath && relativePath !== '.') {
        console.log(
          `Note: Analysis will be scoped to the selected subdirectory: ${relativePath}`
        );
      }
    }
    process.chdir(gitRoot);
    options.path = originalUserPath;
  } else {
    // No git root found, use the user's selected path as before
    console.log(`Changing to directory: ${targetPath}`);
    process.chdir(targetPath);
    options.path = originalUserPath;
  }
} else {
  // If no path specified, check if current directory is in a git repo
  const gitRoot = findGitRoot();
  if (gitRoot && gitRoot !== process.cwd()) {
    console.log(`Found git repository root: ${gitRoot}`);
    console.log(`Changing to git root for analysis`);
    process.chdir(gitRoot);
  }
}

ensureConfig(options);

try {
  if (!inferDeps(options)) {
    console.error(
      'No entry points found. Tried:',
      getEntryGlobs(options).join(', ')
    );
    console.error(
      '\nPlease configured your entry points in .detective/config.json'
    );
    process.exit(1);
  }
} catch (error) {
  console.error('Error analyzing project dependencies:');
  console.error(error.message);
  console.error(
    '\nThis might be due to complex TypeScript configurations or missing dependencies.'
  );
  console.error(
    'Detective may still work for trend analysis if this is a git repository.'
  );
  console.error('\nContinuing with limited functionality...');
}

if (!isRepo(originalUserPath)) {
  console.warn('This does not seem to be a git repository.');
  console.warn('Most diagrams provided by detective do not work without git!');
}

const app = setupExpress(options);

app.listen(options.port, () => {
  const url = `http://localhost:${options.port}`;
  console.log(`Detective v${DETECTIVE_VERSION} runs at ${url}`);

  if (options.trendAnalysis) {
    console.log('Starting trend analysis in background...');
    // Run trend analysis asynchronously without blocking startup
    setImmediate(async () => {
      try {
        updateTrendAnalysisStatus({ isRunning: true });
        const result = await runTrendAnalysis(options, { maxCommits: 5 });
        console.log(
          `Background trend analysis complete: analyzed ${result.commitsAnalyzed} commits and ${result.filesAnalyzed} files in ${result.totalProcessingTimeMs}ms`
        );
        const formattedResult = await formatTrendAnalysisForAPI(result);
        updateTrendAnalysisStatus({
          isRunning: false,
          lastRun: new Date(),
          lastResult: formattedResult,
        });
      } catch (error) {
        console.error('Background trend analysis failed:', error);
        updateTrendAnalysisStatus({ isRunning: false });
      }
    });
  }

  if (options.open) {
    openSync(url);
  }
});
