"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDeps = loadDeps;
var path_1 = __importDefault(require("path"));
var process_1 = require("process");
var fs_1 = __importDefault(require("fs"));
function loadDeps(options) {
    var depsPath = path_1.default.join((0, process_1.cwd)(), options.sheriffDump);
    var deps = JSON.parse(fs_1.default.readFileSync(depsPath, "utf-8"));
    return deps;
}
