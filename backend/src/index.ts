#!/usr/bin/env node

import express from "express";
import path from "path";
import fs from "fs";
import { calcCoupling } from "./services/coupling";
import { cwd } from "process";
import { parseOptions } from "./options/parse-options";
import { inferFolders } from "./services/folders";
import { calcModuleInfo } from "./services/module-info";
import { calcTeamAlignment } from "./services/team-alignment";
import { ensureConfig } from "./infrastructure/config";
import { aggregateHotspots, findHotspotFiles } from "./services/hotspot";
import { calcChangeCoupling } from "./services/change-coupling";
import { getEntryGlobs, inferDeps } from "./infrastructure/deps";
import { isRepo } from "./infrastructure/git";
import { openSync } from "./utils/open";

const options = parseOptions(process.argv.slice(2));

if (options.path) {
  process.chdir(options.path);
}

ensureConfig(options);

if (!inferDeps(options)) {
  console.error(
    "No entry points found. Tried:",
    getEntryGlobs(options).join(", ")
  );
  console.error(
    "\nPlease configured your entry points in .detective/config.json"
  );
  process.exit(1);
}

if (!isRepo()) {
  console.warn("This does not seem to be a git repository.");
  console.warn("Most diagrams provided by detective do not work without git!");
}

const app = express();

app.use(express.json());

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
  } catch (e: any) {
    console.log("error", e);
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/folders", (req, res) => {
  try {
    const result = inferFolders(options);
    res.json(result);
  } catch (e: any) {
    console.log("error", e);
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/coupling", (req, res) => {
  try {
    const result = calcCoupling(options);
    res.json(result);
  } catch (e: any) {
    console.log("error", e);
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/change-coupling", async (req, res) => {
  try {
    const result = await calcChangeCoupling(options);
    res.json(result);
  } catch (e: any) {
    console.log("error", e);
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/team-alignment", async (req, res) => {
  const byUser = Boolean(req.query.byUser);

  try {
    const result = await calcTeamAlignment(byUser, options);
    res.json(result);
  } catch (e: any) {
    console.log("error", e);
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/hotspots/aggregated", async (req, res) => {
  const minScore = Number(req.query.minScore) || -1;
  const criteria = { minScore, module: "" };

  try {
    const result = await aggregateHotspots(criteria, options);
    res.json(result);
  } catch (e: any) {
    console.log("error", e);
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/hotspots", async (req, res) => {
  const minScore = Number(req.query.minScore) || -1;
  const module = req.query.module ? String(req.query.module) : "";

  const criteria = { minScore, module };

  try {
    const result = await findHotspotFiles(criteria, options);
    res.json(result);
  } catch (e: any) {
    console.log("error", e);
    res.status(500).json({ message: e.message });
  }
});

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(options.port, () => {
  const url = `http://localhost:${options.port}`;
  console.log(`Detective runs at ${url}`);
  openSync(url);
});
