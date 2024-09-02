import * as fs from 'fs';

export function countLinesInFile(filePath: string) {
  const data = fs.readFileSync(filePath, 'utf8');
  return data.split(/\n/).length;
}
