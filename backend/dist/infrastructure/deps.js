'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.loadDeps = loadDeps;
exports.inferDeps = inferDeps;
exports.getEntryGlobs = getEntryGlobs;
var fs_1 = __importDefault(require('fs'));
var sheriff_core_1 = require('@softarc/sheriff-core');
var fast_glob_1 = require('fast-glob');
var config_1 = require('./config');
var process_1 = require('process');
var DEFAULT_ENTRIES = ['src/main.ts', 'main.ts', 'src/index.ts', 'index.ts'];
var DEFAULT_NX_ENTRIES = [
  'apps/**/src/main.ts',
  'libs/**/src/main.ts',
  'packages/**/src/main.ts',
];
var deps;
// export function loadDeps(options: Options): Deps {
//   const depsPath = path.join(cwd(), options.sheriffDump);
//   const deps = JSON.parse(fs.readFileSync(depsPath, "utf-8")) as Deps;
//   return deps;
// }
function loadDeps(options) {
  if (!deps) {
    throw new Error('no dependencies loaded!');
  }
  return deps;
}
function inferDeps(options) {
  var entryGlobs = getEntryGlobs(options);
  var entries = (0, fast_glob_1.globSync)(entryGlobs);
  if (entries.length === 0) {
    return false;
  }
  var dir = (0, process_1.cwd)();
  deps = entries
    .map(function (e) {
      return (0, sheriff_core_1.getProjectData)(e, dir);
    })
    .reduce(function (acc, curr) {
      return __assign(__assign({}, acc), curr);
    });
  return true;
}
function getEntryGlobs(options) {
  var _a;
  var config = (0, config_1.loadConfig)(options);
  var entryGlobs = DEFAULT_ENTRIES;
  if (
    ((_a = config.entries) === null || _a === void 0 ? void 0 : _a.length) > 0
  ) {
    entryGlobs = config.entries;
  } else if (fs_1.default.existsSync('nx.json')) {
    entryGlobs = DEFAULT_NX_ENTRIES;
  }
  return entryGlobs;
}
