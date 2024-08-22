#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var coupling_1 = require("./services/coupling");
var process_1 = require("process");
var parse_options_1 = require("./options/parse-options");
var validate_options_1 = require("./options/validate-options");
var folders_1 = require("./services/folders");
var module_info_1 = require("./services/module-info");
var team_alignment_1 = require("./services/team-alignment");
var open_1 = require("./utils/open");
var config_1 = require("./infrastructure/config");
var options = (0, parse_options_1.parseOptions)(process.argv.slice(2));
if (options.path) {
    process.chdir(options.path);
}
if (!(0, validate_options_1.validateOptions)(options)) {
    console.log("Usage: forensic [sheriff-dump] [--port port] [--config path]");
    process.exit(1);
}
(0, config_1.ensureConfig)(options);
var app = (0, express_1.default)();
app.use(express_1.default.json());
// Route für /api/config - Liefert eine statische JSON-Datei
app.get("/api/config", function (req, res) {
    res.sendFile(path_1.default.join((0, process_1.cwd)(), options.config));
});
app.post("/api/config", function (req, res) {
    var newConfig = req.body;
    var configPath = path_1.default.join((0, process_1.cwd)(), options.config);
    fs_1.default.writeFile(configPath, JSON.stringify(newConfig, null, 2), "utf8", function (error) {
        if (error) {
            return res.status(500).json({ error: error });
        }
        res.json({});
    });
});
app.get("/api/modules", function (req, res) {
    try {
        var result = (0, module_info_1.calcModuleInfo)(options);
        res.json(result);
    }
    catch (e) {
        res.status(500).json(e);
    }
});
app.get("/api/folders", function (req, res) {
    try {
        var result = (0, folders_1.getFolders)();
        res.json(result);
    }
    catch (e) {
        res.status(500).json(e);
    }
});
app.get("/api/coupling", function (req, res) {
    try {
        var result = (0, coupling_1.calcCoupling)(options);
        res.json(result);
    }
    catch (e) {
        res.status(500).json(e);
    }
});
app.get("/api/team-alignment", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var byUser, result, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                byUser = Boolean(req.query.byUser);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, team_alignment_1.calcTeamAlignment)(byUser, options)];
            case 2:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log('error', e_1);
                res.status(500).json(e_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.get("*", function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "..", "public", "index.html"));
});
app.listen(options.port, function () {
    var url = "http://localhost:".concat(options.port);
    console.log("Detective runs at ".concat(url));
    (0, open_1.openSync)(url);
});
