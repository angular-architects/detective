"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFolders = getFolders;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var exclude = new Set(['node_modules', 'dist']);
function getFolders(parent, base) {
    if (parent === void 0) { parent = '.'; }
    if (base === void 0) { base = parent; }
    var folders = fs_1.default.readdirSync(parent)
        .map(function (entry) { return ({
        name: entry,
        path: path_1.default.join(parent, entry)
    }); })
        .filter(function (folder) { return !folder.name.startsWith('.')
        && fs_1.default.lstatSync(folder.path).isDirectory()
        && !exclude.has(folder.name); })
        .map(function (entry) { return (__assign(__assign({}, entry), { path: entry.path, folders: getFolders(entry.path, base) })); });
    return folders;
}
