import { getGitLog } from "../infrastructure/git";

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

export async function parseGitLog(callback: ParserCallback) {
  let pos = 0;
  const log = await getGitLog();

  let header = initHeader;
  let body: LogBodyEntry[] = [];

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
        const bodyEntry = parseBodyEntry(line);
        body.push(bodyEntry);
      }
    }
  }
}

function parseBodyEntry(line: string): LogBodyEntry {
  const parts = line.split("\t");
  const linesAdded = parseInt(parts[0]);
  const linesRemoved = parseInt(parts[1]);
  const path = parts[2];

  const bodyEntry: LogBodyEntry = {
    linesAdded: linesAdded || 0,
    linesRemoved: linesRemoved || 0,
    path: path || '',
  };
  return bodyEntry;
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
