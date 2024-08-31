"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmptyMatrix = getEmptyMatrix;
function getEmptyMatrix(size) {
    return Array.from({ length: size }, function () { return new Array(size).fill(0); });
}
