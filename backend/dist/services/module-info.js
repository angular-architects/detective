'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.calcModuleInfo = calcModuleInfo;
var config_1 = require('../infrastructure/config');
var deps_1 = require('../infrastructure/deps');
function calcModuleInfo(options) {
  var config = (0, config_1.loadConfig)(options);
  var deps = (0, deps_1.loadDeps)(options);
  var fileCount = new Array(config.scopes.length).fill(0);
  for (var _i = 0, _a = Object.keys(deps); _i < _a.length; _i++) {
    var dep = _a[_i];
    for (var i = 0; i < config.scopes.length; i++) {
      var scope = config.scopes[i];
      if (dep.startsWith(scope)) {
        fileCount[i]++;
      }
    }
  }
  return {
    fileCount: fileCount,
  };
}
