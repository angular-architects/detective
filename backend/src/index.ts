#!/usr/bin/env node

import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { calcCoupling } from "./services/coupling";
import { cwd } from "process";
import { parseOptions } from "./options/parse-options";
import { validateOptions } from "./options/validate-options";
import { getFolders, inferFolders } from "./services/folders";
import { calcModuleInfo } from "./services/module-info";
import { calcTeamAlignment } from "./services/team-alignment";
import { openSync } from './utils/open';
import { ensureConfig } from "./infrastructure/config";
import { aggregateHotspots, findHotspotFiles, HotspotCriteria } from "./services/hotspot";
import { calcChangeCoupling } from "./services/change-coupling";

const options = parseOptions(process.argv.slice(2));

if (options.path) {
  process.chdir(options.path);
}

if (!validateOptions(options)) {
  console.log("Usage: forensic [sheriff-dump] [--port port] [--config path]");
  process.exit(1);
}

ensureConfig(options);

const app = express();

app.use(express.json());

// Route für /api/config - Liefert eine statische JSON-Datei
app.get("/api/config", (req, res) => {
  res.sendFile(path.join(cwd(), options.config));
});

app.post("/api/config", (req, res) => {
  const newConfig = req.body;
  const configPath = path.join(cwd(), options.config);

  fs.writeFile(
    configPath,
    JSON.stringify(newConfig, null, 2),
    "utf8",
    (error) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.json({});
    }
  );
});

app.get("/api/modules", (req, res) => {
  try {
    const result = calcModuleInfo(options);
    res.json(result);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.get("/api/folders", (req, res) => {
  try {
    // const result = getFolders();
    const result = inferFolders(options);
    console.log('result', result);
    res.json(result);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.get("/api/folders2", (req, res) => {
  try {
    const result = inferFolders(options);
    res.json(result);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.get("/api/coupling", (req, res) => {
  try {
    const result = calcCoupling(options);
    res.json(result);
  } catch (e) {
    console.log('error', e);
    res.status(500).json(e);
  }
});

app.get("/api/change-coupling", async (req, res) => {
  try {
    const result = await calcChangeCoupling(options);
    res.json(result);
  } catch (e) {
    console.log('error', e);
    res.status(500).json(e);
  }
});

app.get("/api/team-alignment", async (req, res) => {
  const byUser = Boolean(req.query.byUser);

  try {
    const result = await calcTeamAlignment(byUser, options);
    res.json(result);
  } catch (e) {
    console.log('error', e);
    res.status(500).json(e);
  }
});

app.get("/api/hotspots/aggregated", async (req, res) => {
  const minScore = Number(req.query.minScore) || -1;
  const criteria = { minScore, module: '' };

  try {
    const result = await aggregateHotspots(criteria, options);
    res.json(result);
  } catch (e) {
    console.log('error', e);
    res.status(500).json(e);
  }
});

app.get("/api/hotspots", async (req, res) => {
  const minScore = Number(req.query.minScore) || -1;
  const module = req.query.module ? String(req.query.module) : '';

  const criteria = { minScore, module };

  try {
    const result = await findHotspotFiles(criteria, options);
    res.json(result);
  } catch (e) {
    console.log('error', e);
    res.status(500).json(e);
  }
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(options.port, () => {
  const url = `http://localhost:${options.port}`;
  console.log(`Detective runs at ${url}`);
  openSync(url);
});
