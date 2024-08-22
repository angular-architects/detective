"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGitLog = parseGitLog;
var git_1 = require("../infrastructure/git");
var initHeader = {
    userName: "",
    email: "",
    date: new Date(0),
};
function parseGitLog(callback) {
    return __awaiter(this, void 0, void 0, function () {
        var pos, log, header, body, state, _a, line, next, bodyEntry;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pos = 0;
                    return [4 /*yield*/, (0, git_1.getGitLog)()];
                case 1:
                    log = _b.sent();
                    header = initHeader;
                    body = [];
                    state = "header";
                    while (pos < log.length) {
                        _a = getNextLine(log, pos), line = _a[0], next = _a[1];
                        pos = next;
                        if (state === "header") {
                            header = parseHeader(line);
                            state = "body";
                        }
                        else if (state === "body") {
                            if (!line.trim()) {
                                callback({ header: header, body: body });
                                body = [];
                                state = "header";
                            }
                            else if (!line.includes('\t')) {
                                header = parseHeader(line);
                            }
                            else {
                                bodyEntry = parseBodyEntry(line);
                                body.push(bodyEntry);
                            }
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function parseBodyEntry(line) {
    var parts = line.split("\t");
    var linesAdded = parseInt(parts[0]);
    var linesRemoved = parseInt(parts[1]);
    var path = parts[2];
    var bodyEntry = {
        linesAdded: linesAdded || 0,
        linesRemoved: linesRemoved || 0,
        path: path || '',
    };
    return bodyEntry;
}
function parseHeader(line) {
    var parts = line.split(",");
    var fullUserName = parts[0];
    var date = new Date(parts[1]);
    var userParts = fullUserName.split("<");
    var userName = cleanUserName(userParts[0]);
    var email = cleanEmail(userParts);
    return { userName: userName, email: email, date: date };
}
function cleanEmail(userParts) {
    return userParts[1].substring(0, userParts[1].length - 1);
}
function cleanUserName(userName) {
    userName = userName.trim();
    if (userName.startsWith('"')) {
        userName = userName.substring(1);
    }
    return userName;
}
function getNextLine(text, start) {
    var line = "";
    var current = "";
    var pos = start;
    while (pos < text.length && current !== "\n") {
        current = text[pos];
        if (current !== "\n" && current !== "\r") {
            line += current;
        }
        pos++;
    }
    return [line, pos];
}
