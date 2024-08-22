"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitLog = getGitLog;
var spawn = require("child_process").spawn;
function getGitLog() {
    return new Promise(function (resolve, reject) {
        try {
            var subprocess = spawn("git", ["log", '--numstat', '--pretty=format:"%an <%ae>,%ad"']);
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
                    reject('Error running git: ' + error_1);
                }
                else {
                    resolve(text_1);
                }
            });
        }
        catch (e) {
            reject('Error running git: ' + e);
        }
    });
}
