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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOptions = parseOptions;
var options_1 = require("./options");
function parseOptions(args) {
    var state = 'none';
    var parsed = {};
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var arg = args_1[_i];
        if (state === 'none') {
            if (arg === '--port') {
                state = 'port';
            }
            else if (arg === '--config') {
                state = 'config';
            }
            else if (arg === '--path') {
                state = 'path';
            }
            else if (!parsed.sheriffDump) {
                parsed.sheriffDump = arg;
            }
        }
        else if (state === 'port') {
            parsed.port = parseInt(arg);
            state = 'none';
        }
        else if (state === 'path') {
            parsed.path = arg;
            state = 'none';
        }
        else if (state === 'config') {
            parsed.config = arg;
            state = 'none';
        }
    }
    return __assign(__assign({}, options_1.defaultOptions), parsed);
}
