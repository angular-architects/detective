import fs from 'fs';
import path from 'path';
import { cwd } from 'process';

import express from 'express';

import { getCommitCount } from './infrastructure/git';
import { createMcpHttpRouter } from './mcp/http-router';
import { createMcpServer } from './mcp/server';
import { Limits } from './model/limits';
import { Options } from './options/options';
import { calcChangeCoupling } from './services/change-coupling';
import { calcCoupling } from './services/coupling';
import { inferFolders } from './services/folders';
import {
  aggregateHotspots,
  ComplexityMetric,
  findHotspotFiles,
  HotspotCriteria,
} from './services/hotspot';
import { isStale, updateLogCache } from './services/log-cache';
import { calcModuleInfo } from './services/module-info';
import { calcTeamAlignment } from './services/team-alignment';
import {
  runTrendAnalysis,
  formatTrendAnalysisForAPI,
  GitService,
} from './services/trend-analysis';

// Global trend analysis status
const trendAnalysisStatus: {
  isRunning: boolean;
  lastRun: Date | null;
  lastResult: unknown;
} = {
  isRunning: false,
  lastRun: null as Date | null,
  lastResult: null as unknown,
};

export function updateTrendAnalysisStatus(
  update: Partial<typeof trendAnalysisStatus>
) {
  Object.assign(trendAnalysisStatus, update);
}

export function setupExpress(options: Options) {
  const app = express();

  app.use(express.json());

  // MCP integration (Streamable HTTP) enabled by default at /mcp
  app.use(
    '/mcp',
    createMcpHttpRouter(() => createMcpServer(options))
  );

  app.get('/api/config', (req, res) => {
    res.sendFile(path.join(cwd(), options.config));
  });

  app.post('/api/config', (req, res) => {
    const newConfig = req.body;
    const configPath = path.join(cwd(), options.config);

    fs.writeFile(
      configPath,
      JSON.stringify(newConfig, null, 2),
      'utf8',
      (error) => {
        if (error) {
          return res.status(500).json({ error });
        }
        res.json({});
      }
    );
  });

  app.get('/api/status', (req, res) => {
    try {
      const commits = getCommitCount();
      res.json({ commits });
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.get('/api/cache/log', (req, res) => {
    try {
      const stale = isStale();
      res.json({ isStale: stale });
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.all('/api/cache/log/update', async (req, res) => {
    try {
      console.log('Updating cache ...');
      await updateLogCache();
      console.log('Done.');
      res.json({});
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.get('/api/modules', (req, res) => {
    try {
      const result = calcModuleInfo(options);
      res.json(result);
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.get('/api/folders', (req, res) => {
    try {
      const result = inferFolders(options);
      res.json(result);
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.get('/api/coupling', (req, res) => {
    try {
      const result = calcCoupling(options);
      res.json(result);
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.get('/api/change-coupling', async (req, res) => {
    const limits = getLimits(req);

    try {
      const result = await calcChangeCoupling(limits, options);
      res.json(result);
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.get('/api/team-alignment', async (req, res) => {
    const byUser = req.query.byUser === 'true';
    const limits = getLimits(req);

    try {
      const result = await calcTeamAlignment(byUser, limits, options);
      res.json(result);
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.get('/api/hotspots/aggregated', async (req, res) => {
    const minScore = Number(req.query.minScore) || -1;
    const metric = (req.query.metric?.toString() ||
      'McCabe') as ComplexityMetric;
    const criteria: HotspotCriteria = { minScore, module: '', metric };
    const limits = getLimits(req);

    try {
      const result = await aggregateHotspots(criteria, limits, options);
      res.json(result);
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.get('/api/hotspots', async (req, res) => {
    const minScore = Number(req.query.minScore) || -1;
    const module = req.query.module ? String(req.query.module) : '';
    const metric = (req.query.metric?.toString() ||
      'McCabe') as ComplexityMetric;
    const criteria = { minScore, module, metric };

    const limits = getLimits(req);

    try {
      const result = await findHotspotFiles(criteria, limits, options);
      res.json(result);
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.get('/api/trend-analysis/status', (req, res) => {
    res.json({
      isRunning: trendAnalysisStatus.isRunning,
      lastRun: trendAnalysisStatus.lastRun?.toISOString(),
      hasResults: !!trendAnalysisStatus.lastResult,
    });
  });

  app.get('/api/trend-analysis', async (req, res) => {
    const maxCommits = Number(req.query.maxCommits) || 50;
    const parallelWorkers = Math.max(
      1,
      Math.min(10, Number(req.query.parallelWorkers) || 5)
    ); // Limit between 1-10 workers
    const fileExtensions = req.query.fileExtensions
      ? String(req.query.fileExtensions).split(',')
      : ['.ts', '.js', '.tsx', '.jsx'];

    // Check if we have cached results and no new analysis is requested
    if (trendAnalysisStatus.lastResult && !req.query.fresh) {
      res.json(trendAnalysisStatus.lastResult);
      return;
    }

    // Prevent multiple concurrent analyses
    if (trendAnalysisStatus.isRunning) {
      res.status(429).json({
        error:
          'Trend analysis is already running. Check /api/trend-analysis/status for progress.',
      });
      return;
    }

    try {
      trendAnalysisStatus.isRunning = true;

      const result = await runTrendAnalysis(options, {
        maxCommits,
        fileExtensions,
        parallelWorkers,
      });

      const formattedResult = await formatTrendAnalysisForAPI(
        result,
        options.path,
        fileExtensions
      );

      // Cache the results
      trendAnalysisStatus.lastResult = formattedResult;
      trendAnalysisStatus.lastRun = new Date();

      res.json(formattedResult);
    } catch (e: unknown) {
      handleError(e, res);
    } finally {
      trendAnalysisStatus.isRunning = false;
    }
  });

  // Streaming trend analysis endpoint with Server-Sent Events
  app.get('/api/trend-analysis/stream', async (req, res) => {
    const maxCommits = Number(req.query.maxCommits) || 50;
    const parallelWorkers = Math.max(
      1,
      Math.min(10, Number(req.query.parallelWorkers) || 5)
    ); // Limit between 1-10 workers
    const fileExtensions = req.query.fileExtensions
      ? String(req.query.fileExtensions).split(',')
      : ['.ts', '.js', '.tsx', '.jsx'];

    // Prevent multiple concurrent analyses
    if (trendAnalysisStatus.isRunning) {
      res.status(429).json({
        error:
          'Trend analysis is already running. Check /api/trend-analysis/status for progress.',
      });
      return;
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection message
    res.write(
      `data: ${JSON.stringify({
        type: 'connected',
        message: 'Connected to trend analysis stream',
      })}\n\n`
    );

    try {
      trendAnalysisStatus.isRunning = true;

      // FIRST: Send the complete file structure immediately
      const gitService = new GitService(options.path);
      const currentFiles = await gitService.getCurrentFiles(fileExtensions);

      const initialFileStructure = currentFiles.map((filePath) => ({
        filePath,
        changeFrequency: 0,
        averageComplexity: 0,
        averageSize: 0,
        totalChanges: 0,
        commits: [],
        complexityTrend: [],
        sizeTrend: [],
      }));

      // Send initial file structure
      res.write(
        `data: ${JSON.stringify({
          type: 'initial_files',
          message: `Loaded ${currentFiles.length} files from current commit`,
          data: {
            files: initialFileStructure,
            summary: {
              totalProcessingTimeMs: 0,
              commitsAnalyzed: 0,
              filesAnalyzed: currentFiles.length,
              commitHashes: [],
            },
          },
        })}\n\n`
      );

      // THEN: Start the trend analysis with streaming updates
      const result = await runTrendAnalysis(options, {
        maxCommits,
        fileExtensions,
        parallelWorkers,
        progressCallback: (update) => {
          // Send progress update via SSE
          res.write(`data: ${JSON.stringify(update)}\n\n`);
        },
      });

      const formattedResult = await formatTrendAnalysisForAPI(
        result,
        options.path,
        fileExtensions
      );

      // Cache the results
      trendAnalysisStatus.lastResult = formattedResult;
      trendAnalysisStatus.lastRun = new Date();

      // Send final result
      res.write(
        `data: ${JSON.stringify({
          type: 'final_result',
          message: 'Analysis complete',
          data: formattedResult,
        })}\n\n`
      );
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? error.message
          : '' + error;
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: `Analysis failed: ${message}`,
          progress: 100,
        })}\n\n`
      );
    } finally {
      trendAnalysisStatus.isRunning = false;
      res.write(
        `event: close\ndata: ${JSON.stringify({
          type: 'stream_end',
          message: 'Stream ended',
        })}\n\n`
      );
      res.end();
    }
  });

  // X-Ray code analysis endpoint
  app.get('/api/x-ray', async (req, res) => {
    const filePath = req.query.file as string;
    const includeSource = req.query.includeSource === 'true';

    if (!filePath) {
      res.status(400).json({ error: 'file query parameter is required' });
      return;
    }

    try {
      // Resolve the file path relative to the project root
      const fullPath = path.resolve(options.path, filePath);

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ error: `File not found: ${filePath}` });
        return;
      }

      // Create analyzer and run analysis (lazy import to prevent startup scanning)
      const { CodeAnalyzer } = await import(
        './services/trend-analysis/x-ray/code-analyzer'
      );
      const analyzer = new CodeAnalyzer(fullPath);
      const metrics = await analyzer.analyze(includeSource);

      res.json({ ...metrics, schemaUrl: '/api/x-ray/schema?v=1' });
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  // X-Ray schema endpoint
  app.get('/api/x-ray/schema', async (_req, res) => {
    try {
      const { CodeAnalyzer } = await import(
        './services/trend-analysis/x-ray/code-analyzer'
      );
      const { buildBaseXRaySchema } = await import(
        './services/trend-analysis/x-ray/x-ray.schema'
      );

      const jsonSchema = CodeAnalyzer.buildJSONSchema() as Record<
        string,
        unknown
      >;
      // Prefer UI schema embedded under jsonSchema['x-ui'] for a single-source payload
      const uiSchema =
        (jsonSchema as Record<string, unknown>)['x-ui'] ??
        CodeAnalyzer.buildUISchema();
      const base = buildBaseXRaySchema();

      res.json({ version: base.version, jsonSchema, uiSchema });
    } catch (e: unknown) {
      handleError(e, res);
    }
  });

  app.use(express.static(path.join(__dirname, 'assets')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'index.html'));
  });
  return app;
}

function handleError(e: unknown, res) {
  console.log('error', e);
  const message = typeof e === 'object' && 'message' in e ? e.message : '' + e;
  res.status(500).json({ message });
}

function getLimits(req: express.Request): Limits {
  return {
    limitCommits: parseInt('' + req.query.limitCommits) || null,
    limitMonths: parseInt('' + req.query.limitMonths) || null,
  };
}
