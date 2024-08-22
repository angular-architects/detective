"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPercent = toPercent;
function toPercent(n, count) {
    var factor = Math.pow(10, count);
    return Math.round(n * factor);
}
