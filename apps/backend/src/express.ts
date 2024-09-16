import fs from 'fs';
import path from 'path';
import { cwd } from 'process';

import express from 'express';

import { getCommitCount } from './infrastructure/git';
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

export function setupExpress(options: Options) {
  const app = express();

  app.use(express.json());

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
