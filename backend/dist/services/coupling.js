'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.calcCoupling = calcCoupling;
var config_1 = require('../infrastructure/config');
var deps_1 = require('../infrastructure/deps');
var module_info_1 = require('./module-info');
var to_percent_1 = require('../utils/to-percent');
var matrix_1 = require('../utils/matrix');
var normalize_folder_1 = require('../utils/normalize-folder');
function calcCoupling(options) {
  var config = (0, config_1.loadConfig)(options);
  var deps = (0, deps_1.loadDeps)(options);
  var files = Object.keys(deps);
  var modules = config.scopes.map(function (m) {
    return (0, normalize_folder_1.normalizeFolder)(m);
  });
  var scopeMap = calcScopeMap(modules);
  var matrixSize = modules.length;
  var matrix = (0, matrix_1.getEmptyMatrix)(matrixSize);
  for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
    var row = modules_1[_i];
    for (var _a = 0, modules_2 = modules; _a < modules_2.length; _a++) {
      var col = modules_2[_a];
      var count = calcCell(files, deps, row, col);
      var i = scopeMap.get(row);
      var j = scopeMap.get(col);
      if (typeof i === 'undefined' || typeof j === 'undefined') {
        throw new Error('undefined matrix position '.concat(i, ', ').concat(j));
      }
      matrix[i][j] = count;
    }
  }
  // TODO: Improve performance by combinding this with matrix calculation
  var moduleInfo = (0, module_info_1.calcModuleInfo)(options);
  var cohesion = calcCohesion(moduleInfo, matrix);
  return {
    groups: config.groups,
    dimensions: config.scopes,
    fileCount: moduleInfo.fileCount,
    cohesion: cohesion,
    matrix: matrix,
  };
}
function calcCohesion(moduleInfo, matrix) {
  return moduleInfo.fileCount.map(function (count, index) {
    var edges = matrix[index][index];
    var maxEdges = (count * (count - 1)) / 2;
    return (0, to_percent_1.toPercent)(edges / maxEdges);
  });
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
function calcScopeMap(modules) {
  var scopeMap = new Map();
  for (var i = 0; i < modules.length; i++) {
    scopeMap.set(modules[i], i);
  }
  return scopeMap;
}
