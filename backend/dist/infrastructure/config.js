"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.ensureConfig = ensureConfig;
var path_1 = __importDefault(require("path"));
var process_1 = require("process");
var fs_1 = __importDefault(require("fs"));
var initConfig = {
    "scopes": [],
    "groups": [],
    "--teams": {
        "--comment": "Add a teams node with this structure",
        "alpha": [
            "John Doe",
            "Jane Doe"
        ],
        "beta": [
            "Max Muster",
            "Susi Sorglos",
        ]
    }
};
function loadConfig(options) {
    var configPath = path_1.default.join((0, process_1.cwd)(), options.config);
    var config = JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
    return config;
}
function ensureConfig(options) {
    var configPath = path_1.default.join((0, process_1.cwd)(), options.config);
    if (!fs_1.default.existsSync(configPath)) {
        fs_1.default.writeFileSync(configPath, JSON.stringify(initConfig, null, 2), 'utf-8');
    }
}
