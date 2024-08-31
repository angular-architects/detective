"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRepo = isRepo;
exports.getGitLog = getGitLog;
var fs = __importStar(require("fs"));
var spawn = require("child_process").spawn;
function isRepo() {
    return fs.existsSync('.git');
}
function getGitLog(limits) {
    return new Promise(function (resolve, reject) {
        try {
            var args = ["log", '--numstat', '--pretty=format:"%an <%ae>,%ad"'];
            if (limits.limitCommits) {
                args.push('-n ' + limits.limitCommits);
            }
            if (limits.limitMonths) {
                args.push("--since=\"".concat(limits.limitMonths, " months ago\""));
            }
            var subprocess = spawn("git", args);
            var text_1 = "";
            var error_1 = "";
            subprocess.stdout.on("data", function (data) {
                text_1 += data;
            });
            subprocess.stderr.on("data", function (data) {
                error_1 += data;
            });
            subprocess.on("exit", function (code) {
                if (code || error_1) {
                    reject(new Error('[Error running Git] ' + error_1));
                }
                else {
                    resolve(text_1);
                }
            });
        }
        catch (e) {
            reject(new Error('Error running git: ' + e));
        }
    });
}
