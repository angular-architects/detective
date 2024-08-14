import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { calcCoupling } from './services/coupling';

const app = express();

// Route für /api/config - Liefert eine statische JSON-Datei
app.get('/api/config', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'config.json'));
});

app.post('/api/config', (req, res) => {
    const newConfig = req.body;
    const configPath = path.join(__dirname, 'data', 'config.json');
  
    fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Fehler beim Speichern der Konfiguration' });
      }
      res.json({ message: 'Konfiguration erfolgreich aktualisiert' });
    });
  });

app.get('/api/coupling', (req, res) => {
  try {
    const result = calcCoupling();
    res.json(result)
  }
  catch(e) {
    res.status(500).json(e);
  } 
});

  // Route für / - Liefert eine index.html-Datei
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
