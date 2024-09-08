import * as path from 'path';
import { noLimits } from '../model/limits';
import { loadCachedLog } from '../infrastructure/log';
import { getToday, subtractMonths } from '../utils/date-utils';

type State = 'header' | 'body' | 'skip';

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
};
11;
export type ParserCallback = (entry: LogEntry) => void;

const initHeader: LogHeader = {
  userName: '',
  email: '',
  date: new Date(0),
};

export async function parseGitLog(callback: ParserCallback, limits = noLimits) {
  let pos = 0;
  const log = loadCachedLog();

  const today = getToday();
  const dateLimit = limits.limitMonths
    ? subtractMonths(today, limits.limitMonths)
    : new Date(0);

  let header = initHeader;
  let body: LogBodyEntry[] = [];

  const renameMap = new Map<string, string>();

  let state: State = 'header';

  let count = 0;

  while (pos < log.length) {
    const [line, next] = getNextLine(log, pos);
    pos = next;

    if (state === 'header') {
      count++;

      if (limits.limitCommits && count > limits.limitCommits) {
        return;
      }

      header = parseHeader(line);

      if (header.date.getTime() < dateLimit.getTime()) {
        state = 'skip';
      } else {
        state = 'body';
      }
    } else if (state === 'body') {
      if (!line.trim()) {
        callback({ header, body });
        body = [];
        state = 'header';
      } else if (!line.includes('\t')) {
        header = parseHeader(line);
      } else {
        const bodyEntry = parseBodyEntry(line, renameMap);
        body.push(bodyEntry);
      }
    } else if (state === 'skip') {
      if (!line.trim()) {
        body = [];
        state = 'header';
      }
    }
  }

  if (body.length > 0) {
    callback({ header, body });
  }
}

function parseBodyEntry(
  line: string,
  renameMap: Map<string, string>
): LogBodyEntry {
  const parts = line.split('\t');
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
  const result = filePath.match(/(.*?)\{(.*?) => (.*?)\}(.*)/);

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
  const parts = line.split(',');
  const isoString = parts.pop() as string;
  const date = toDate(isoString);
  const fullUserName = parts.join(',');
  const userParts = fullUserName.split('<');
  const userName = cleanUserName(userParts[0]);
  const email = cleanEmail(userParts);
  return { userName, email, date };
}

function toDate(isoString: string): Date {
  if (isoString.endsWith('"')) {
    isoString = isoString.substring(0, isoString.length - 1);
  }
  const date = new Date(isoString);
  return date;
}

function cleanEmail(userParts: string[]) {
  try {
    return userParts[1].substring(0, userParts[1].length - 1);
  } catch (e) {
    console.log('ERROR', e);
    console.log('userParts', userParts);
    throw e;
  }
}

function cleanUserName(userName: string) {
  userName = userName.trim();
  if (userName.startsWith('"')) {
    userName = userName.substring(1);
  }
  return userName;
}

function getNextLine(text: string, start: number): [line: string, end: number] {
  let line = '';
  let current = '';
  let pos = start;

  while (pos < text.length && current !== '\n') {
    current = text[pos];
    if (current !== '\n' && current !== '\r') {
      line += current;
    }
    pos++;
  }

  return [line, pos];
}
