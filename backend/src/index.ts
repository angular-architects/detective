#!/usr/bin/env node

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { calcCoupling } from './services/coupling';
import { cwd } from 'process';
import { parseOptions } from './options/parse-options';
import { validateOptions } from './options/validate-options';
import { getFolders } from './services/folders';


const options = parseOptions(process.argv.slice(2));
if (!validateOptions(options)) {
  console.log('Usage: forensic [sheriff-dump] [--port port] [--config path]')
  process.exit(1);
}

const app = express();

app.use(express.json());

// Route für /api/config - Liefert eine statische JSON-Datei
app.get('/api/config', (req, res) => {
  res.sendFile(path.join(cwd(), options.config));
});

app.post('/api/config', (req, res) => {
    const newConfig = req.body;
    const configPath = path.join(cwd(), options.config);

    fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf8', (error) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.json({});
    });
  });

  app.get('/api/folders', (req, res) => {
    try {
      const result = getFolders();
      res.json(result)
    }
    catch(e) {
      res.status(500).json(e);
    } 
  });

app.get('/api/coupling', (req, res) => {
  try {
    const result = calcCoupling(options);
    res.json(result)
  }
  catch(e) {
    res.status(500).json(e);
  } 
});

  // Route für / - Liefert eine index.html-Datei
app.get('/', (req, res) => {
  console.log('index')
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

// Server starten
app.listen(options.port, () => {
  console.log(`Forensic runs at http://localhost:${options.port}`);
});