"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFolder = normalizeFolder;
exports.toDisplayFolder = toDisplayFolder;
function normalizeFolder(folder) {
    if (!folder.endsWith('/')) {
        return folder + '/';
    }
    return folder;
}
function toDisplayFolder(folder) {
    if (folder === null || folder === void 0 ? void 0 : folder.endsWith('/')) {
        return folder.substring(0, folder.length - 1);
    }
    return folder;
}
