#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var coupling_1 = require("./services/coupling");
var app = (0, express_1.default)();
// Route für /api/config - Liefert eine statische JSON-Datei
app.get('/api/config', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'data', 'config.json'));
});
app.post('/api/config', function (req, res) {
    var newConfig = req.body;
    var configPath = path_1.default.join(__dirname, 'data', 'config.json');
    fs_1.default.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf8', function (err) {
        if (err) {
            return res.status(500).json({ error: 'Fehler beim Speichern der Konfiguration' });
        }
        res.json({ message: 'Konfiguration erfolgreich aktualisiert' });
    });
});
app.get('/api/coupling', function (req, res) {
    try {
        var result = (0, coupling_1.calcCoupling)();
        res.json(result);
    }
    catch (e) {
        res.status(500).json(e);
    }
});
// Route für / - Liefert eine index.html-Datei
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '..', 'public', 'index.html'));
});
// Server starten
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server l\u00E4uft auf http://localhost:".concat(PORT));
});
console.log('env', process.env.NODE_ENV);
