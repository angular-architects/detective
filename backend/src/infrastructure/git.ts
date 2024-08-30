import * as fs from 'fs';
const { spawn } = require("child_process");

export function isRepo(): boolean {
  return fs.existsSync('.git');
}

export function getGitLog(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        try {
            const subprocess = spawn("git", ["log", '--numstat', '--pretty=format:"%an <%ae>,%ad"']);

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
