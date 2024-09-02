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
exports.getFolders = getFolders;
exports.toFolder = toFolder;
exports.inferFolders = inferFolders;
var path_1 = __importDefault(require('path'));
var fs_1 = __importDefault(require('fs'));
var deps_1 = require('../infrastructure/deps');
var exclude = new Set(['node_modules', 'dist', '.git']);
function getFolders(parent, base) {
  if (parent === void 0) {
    parent = '.';
  }
  if (base === void 0) {
    base = parent;
  }
  var folders = fs_1.default
    .readdirSync(parent)
    .map(function (entry) {
      return {
        name: entry,
        path: path_1.default.join(parent, entry),
      };
    })
    .filter(function (folder) {
      return (
        !folder.name.startsWith('.') &&
        fs_1.default.lstatSync(folder.path).isDirectory() &&
        !exclude.has(folder.name)
      );
    })
    .map(function (entry) {
      return __assign(__assign({}, entry), {
        path: entry.path,
        folders: getFolders(entry.path, base),
      });
    });
  return folders;
}
function toFolder(folder) {
  var converted = {
    name: folder.name,
    path: folder.path,
    folders: Object.keys(folder.folders)
      .sort()
      .map(function (f) {
        return toFolder(folder.folders[f]);
      }),
  };
  return converted;
}
function inferFolders(options) {
  var deps = (0, deps_1.loadDeps)(options);
  var root = { name: '/', path: '/', folders: {} };
  for (var _i = 0, _a = Object.keys(deps); _i < _a.length; _i++) {
    var key = _a[_i];
    var parts = key.split('/');
    var folders = parts.slice(0, parts.length - 1);
    var current = root;
    var history_1 = [];
    for (var _b = 0, folders_1 = folders; _b < folders_1.length; _b++) {
      var folder = folders_1[_b];
      history_1.push(folder);
      var path_2 = history_1.join('/');
      var next = current.folders[folder];
      if (!next) {
        next = { name: folder, path: path_2, folders: {} };
        current.folders[folder] = next;
      }
      current = next;
    }
  }
  var converted = toFolder(root);
  return converted.folders;
}
