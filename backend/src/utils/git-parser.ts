import { getGitLog } from "../infrastructure/git";
import * as path from 'path';
import { Limits, NoLimits } from "../model/limit";

type State = "header" | "body";

export type LogHeader = {
  userName: string;
  email: string;
  date: Date;
};

export type LogBodyEntry = {
    linesAdded: number;
    linesRemoved: number;
    path: string;
  };

export type LogEntry = {
    header: LogHeader;
    body: LogBodyEntry[];
}

export type ParserCallback = (entry: LogEntry) => void;

const initHeader: LogHeader = {
  userName: "",
  email: "",
  date: new Date(0),
};

export async function parseGitLog(callback: ParserCallback, limits = NoLimits) {
  let pos = 0;
  const log = await getGitLog(limits);

  let header = initHeader;
  let body: LogBodyEntry[] = [];

  const renameMap = new Map<string, string>();

  let state: State = "header";

  while (pos < log.length) {
    const [line, next] = getNextLine(log, pos);
    pos = next;

    if (state === "header") {
      header = parseHeader(line);
      state = "body";
    } else if (state === "body") {
      if (!line.trim()) {
        callback({header, body});
        body = [];
        state = "header";
      } 
      else if (!line.includes('\t')) {
        header = parseHeader(line);
      }
      else {
        const bodyEntry = parseBodyEntry(line, renameMap);
        body.push(bodyEntry);
      }
    }
  }
}

function parseBodyEntry(line: string, renameMap: Map<string, string>): LogBodyEntry {
  const parts = line.split("\t");
  const linesAdded = parseInt(parts[0]);
  const linesRemoved = parseInt(parts[1]);
  let filePath = parts[2];

  filePath = handleRenames(filePath, renameMap);
  
  const bodyEntry: LogBodyEntry = {
    linesAdded: linesAdded || 0,
    linesRemoved: linesRemoved || 0,
    path: filePath || '',
  };
  return bodyEntry;
}

function handleRenames(filePath: string, renameMap: Map<string, string>) {
  const result = filePath.match(/(.*?)\{(.*?) \=\> (.*?)\}(.*)/);

  if (result) {
    const start = result[1];
    const before = result[2];
    const after = result[3];
    const end = result[4];

    const from = path.join(start, before, end);
    const to = path.join(start, after, end);

    renameMap.set(from, renameMap.get(to) || to);
    filePath = to;
  }

  filePath = renameMap.get(filePath) || filePath;
  return filePath;
}

function parseHeader(line: string): LogHeader {
  const parts = line.split(",");
  const fullUserName = parts[0];
  const date = new Date(parts[1]);
  const userParts = fullUserName.split("<");
  const userName = cleanUserName(userParts[0]);
  const email = cleanEmail(userParts);
  return { userName, email, date };
}

function cleanEmail(userParts: string[]) {
  return userParts[1].substring(0, userParts[1].length - 1);
}

function cleanUserName(userName: string) {
  userName = userName.trim();
  if (userName.startsWith('"')) {
    userName = userName.substring(1);
  }
  return userName;
}

function getNextLine(text: string, start: number): [line: string, end: number] {
  let line = "";
  let current = "";
  let pos = start;

  while (pos < text.length && current !== "\n") {
    current = text[pos];
    if (current !== "\n" && current !== "\r") {
      line += current;
    }
    pos++;
  }

  return [line, pos];
}
