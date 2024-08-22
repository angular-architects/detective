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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcTeamAlignment = calcTeamAlignment;
var config_1 = require("../infrastructure/config");
var git_parser_1 = require("../utils/git-parser");
var UNKNOWN_TEAM = 'unknown';
function calcTeamAlignment() {
    return __awaiter(this, arguments, void 0, function (byUser, options) {
        var config, modules, teams, userToTeam, result, usersWithoutTeam, count;
        if (byUser === void 0) { byUser = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = (0, config_1.loadConfig)(options);
                    modules = config.scopes;
                    teams = config.teams || {};
                    userToTeam = initUserToTeam(teams);
                    result = initResult(modules, Object.keys(teams));
                    usersWithoutTeam = new Set();
                    count = 0;
                    return [4 /*yield*/, (0, git_parser_1.parseGitLog)(function (entry) {
                            var userName = entry.header.userName;
                            if (options.demoMode) {
                                count++;
                                if (count % 4 === 2) {
                                    userName = 'John Doe';
                                }
                                else if (count % 4 == 3) {
                                    userName = 'Jane Doe';
                                }
                            }
                            if (!userToTeam[userName]) {
                                usersWithoutTeam.add(userName);
                            }
                            var key = calcKey(byUser, userName, userToTeam);
                            for (var _i = 0, _a = entry.body; _i < _a.length; _i++) {
                                var change = _a[_i];
                                for (var _b = 0, modules_1 = modules; _b < modules_1.length; _b++) {
                                    var module_1 = modules_1[_b];
                                    if (change.path.startsWith(module_1)) {
                                        var changes = result.modules[module_1].changes;
                                        var current = changes[key] || 0;
                                        changes[key] = current + change.linesAdded + change.linesRemoved;
                                    }
                                }
                            }
                        })];
                case 1:
                    _a.sent();
                    console.log('usersWithoutTeam', usersWithoutTeam);
                    return [2 /*return*/, result];
            }
        });
    });
}
function calcKey(byUser, userName, userToTeam) {
    if (byUser) {
        return userName;
    }
    else {
        return userToTeam[userName] || UNKNOWN_TEAM;
    }
}
function initUserToTeam(teams) {
    var userToTeam = {};
    for (var _i = 0, _a = Object.keys(teams); _i < _a.length; _i++) {
        var teamName = _a[_i];
        var team = teams[teamName];
        for (var _b = 0, team_1 = team; _b < team_1.length; _b++) {
            var user = team_1[_b];
            userToTeam[user] = teamName;
        }
    }
    return userToTeam;
}
function initResult(modules, teams) {
    var sorted = __spreadArray([], teams, true).sort();
    var result = {
        modules: {},
        teams: __spreadArray(__spreadArray([], sorted, true), [UNKNOWN_TEAM], false),
    };
    for (var _i = 0, modules_2 = modules; _i < modules_2.length; _i++) {
        var module_2 = modules_2[_i];
        result.modules[module_2] = { changes: {} };
    }
    return result;
}
