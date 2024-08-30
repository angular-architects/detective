import * as fs from 'fs';
import { Limits } from '../model/limits';
const { spawn } = require("child_process");

export function isRepo(): boolean {
  return fs.existsSync('.git');
}

export function getGitLog(limits: Limits): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        try {
            const args = ["log", '--numstat', '--pretty=format:"%an <%ae>,%ad"'];

            if (limits.limitCommits) {
              args.push('-n ' + limits.limitCommits);
            }

            if (limits.limitMonths) {
              args.push(`--since="${limits.limitMonths} months ago"`);
            }

            const subprocess = spawn("git", args);

            let text = "";
            let error = "";
          
            subprocess.stdout.on("data", (data: string) => {
              text += data;
            });
          
            subprocess.stderr.on("data", (data: string) => {
                error += data;
            });
          
            subprocess.on("exit", (code: string) => {
                if (code || error) {
                  reject(new Error('[Error running Git] ' + error));
                } else {
                resolve(text);
              }
            });
    
        }
        catch(e) {
            reject(new Error('Error running git: ' + e));
        }
    })
}
