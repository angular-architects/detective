"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcCoupling = calcCoupling;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
function calcCoupling() {
    var basePath = process.cwd();
    var config = loadConfig(basePath);
    var deps = loadDeps(basePath);
    var files = Object.keys(deps);
    var scopeMap = calcScopeMap(config);
    var matrixSize = config.scopes.length;
    var matrix = getEmptyMatrix(matrixSize);
    for (var _i = 0, _a = config.scopes; _i < _a.length; _i++) {
        var row = _a[_i];
        for (var _b = 0, _c = config.scopes; _b < _c.length; _b++) {
            var col = _c[_b];
            var count = calcCell(files, deps, row, col);
            var i = scopeMap.get(row);
            var j = scopeMap.get(col);
            if (typeof i === "undefined" || typeof j === "undefined") {
                throw new Error("undefined matrix position ".concat(i, ", ").concat(j));
            }
            matrix[i][j] = count;
        }
    }
    return {
        dimensions: config.scopes,
        matrix: matrix,
    };
}
function calcCell(files, deps, row, col) {
    var count = 0;
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (file.startsWith(row)) {
            count += sumUpImports(deps, file, col);
        }
    }
    return count;
}
function sumUpImports(deps, file, col) {
    var count = 0;
    for (var _i = 0, _a = deps[file].imports; _i < _a.length; _i++) {
        var importPath = _a[_i];
        if (importPath.startsWith(col)) {
            count++;
        }
    }
    return count;
}
function loadDeps(basePath) {
    var depsPath = path_1.default.join(basePath, "data", "deps.json");
    var deps = JSON.parse(fs_1.default.readFileSync(depsPath, "utf-8"));
    return deps;
}
function loadConfig(basePath) {
    var configPath = path_1.default.join(basePath, "data", "config.json");
    var config = JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
    return config;
}
function getEmptyMatrix(size) {
    return Array.from({ length: size }, function () { return new Array(size).fill(0); });
}
function calcScopeMap(config) {
    var scopeMap = new Map();
    for (var i = 0; i < config.scopes.length; i++) {
        scopeMap.set(config.scopes[i], i);
    }
    return scopeMap;
}
