import { loadCachedLog } from '../infrastructure/log';
import { emptyConfig } from '../model/config';
import { getToday, subtractMonths, subtractSeconds } from '../utils/date-utils';

import { LogEntry, parseGitLog, ParseOptions } from './git-parser';

const today = getToday();
const past = subtractSeconds(subtractMonths(today, 1), 1);

const scopes = ['/booking', '/checkin', '/shared'];

jest.mock('../infrastructure/config', () => ({
  loadConfig: jest.fn(() => ({
    ...emptyConfig,
    scopes,
  })),
}));

const logWithoutRenames = `"John Doe <john.doe@acme.com>,${today.toISOString()}\t123456,ci: format with prettier"
1\t0\t/booking/feature-manage/my.component.ts
1\t0\t/booking/feature-manage/my-other.component.ts
0\t1\t/checkin/feature-checkin/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts

"Jane Doe <jane.doe@acme.com>,${today.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/checkin/feature-checkin/my.component.ts

"Jane Doe <john.doe@acme.com>,${past.toISOString()}"
"John Doe <john.doe@acme.com>,${past.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts

"Jane Doe <john.doe@acme.com>,${today.toISOString()}"
10\t0\t/shell/my.component.ts
0\t1\t/shell/my-other.component.ts
`;

const logWithSpecFiles = `"John Doe <john.doe@acme.com>,${today.toISOString()}\t123456,ci: format with prettier"
1\t0\t/booking/feature-manage/my.component.ts
1\t0\t/booking/feature-manage/my-other.component.ts
0\t1\t/checkin/feature-checkin/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts
0\t1\t/shared/feature-checkin/my.component.spec.ts

"Jane Doe <jane.doe@acme.com>,${today.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/checkin/feature-checkin/my.component.ts

"Jane Doe <john.doe@acme.com>,${past.toISOString()}"
"John Doe <john.doe@acme.com>,${past.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts

"Jane Doe <john.doe@acme.com>,${today.toISOString()}"
10\t0\t/shell/my.component.ts
0\t1\t/shell/my-other.component.ts
`;

const logWithRenames = `"John Doe <john.doe@acme.com>,${today.toISOString()}"
1\t0\t/booking/feature-manage/{my.renamed.component.ts => my.renamed.again.component.ts}
1\t0\t/booking/feature-manage/my-other.component.ts
0\t1\t/checkin/{feature-manage/step1 => feature-manage/init}/my.component.ts
0\t1\t/shared/sub-features/feature-checkin/my.component.ts

"Jane Doe <jane.doe@acme.com>,${today.toISOString()}"
10\t0\t/booking/feature-manage/{my.component.ts => my.renamed.component.ts}
0\t1\t/checkin/{feature-checkin => feature-manage/step1}/my.component.ts

"John Doe <john.doe@acme.com>,${past.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/shared/{ => sub-features}/feature-checkin/my.component.ts

"Jane Doe <john.doe@acme.com>,${today.toISOString()}"
10\t0\t/shell/my.component.ts
0\t1\t/shell/my-other.component.ts
`;

jest.mock('../infrastructure/log');
const mocks = jest.mocked({ loadCachedLog });

describe('git parser', () => {
  describe('without renamed log entries', () => {
    beforeAll(() => {
      mocks.loadCachedLog.mockImplementation(() => logWithoutRenames);
    });

    it('returns all log entries', async () => {
      const parseOptions: ParseOptions = {
        limits: {
          limitCommits: 0,
          limitMonths: 0,
        },
      };

      const entries: LogEntry[] = [];

      parseGitLog((entry) => {
        entries.push(entry);
      }, parseOptions);

      expect(entries).toEqual([
        {
          header: {
            userName: 'John Doe',
            email: 'john.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 1,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 1,
              linesRemoved: 0,
              path: '/booking/feature-manage/my-other.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-checkin/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shared/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'Jane Doe',
            email: 'jane.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'John Doe',
            email: 'john.doe@acme.com',
            date: past,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shared/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'Jane Doe',
            email: 'john.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/shell/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shell/my-other.component.ts',
            },
          ],
        },
      ]);
    });

    it('returns last 2 log entries', async () => {
      const parseOptions: ParseOptions = {
        limits: {
          limitCommits: 2,
          limitMonths: 0,
        },
      };

      const entries: LogEntry[] = [];

      parseGitLog((entry) => {
        entries.push(entry);
      }, parseOptions);

      expect(entries).toEqual([
        {
          header: {
            userName: 'John Doe',
            email: 'john.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 1,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 1,
              linesRemoved: 0,
              path: '/booking/feature-manage/my-other.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-checkin/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shared/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'Jane Doe',
            email: 'jane.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-checkin/my.component.ts',
            },
          ],
        },
      ]);
    });

    it('returns last 2 log entries after filtering with multiple filters', async () => {
      const parseOptions: ParseOptions = {
        limits: {
          limitCommits: 2,
          limitMonths: 0,
        },
        filter: {
          logs: ['does not match', 'format with prettier'],
        },
      };

      const entries: LogEntry[] = [];

      parseGitLog((entry) => {
        entries.push(entry);
      }, parseOptions);

      expect(entries).toEqual([
        {
          header: {
            userName: 'Jane Doe',
            email: 'jane.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'John Doe',
            email: 'john.doe@acme.com',
            date: past,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shared/feature-checkin/my.component.ts',
            },
          ],
        },
      ]);
    });

    it("returns last month's log entries", async () => {
      const parseOptions: ParseOptions = {
        limits: {
          limitCommits: 0,
          limitMonths: 1,
        },
        filter: {
          files: [],
          logs: [],
        },
      };

      const entries: LogEntry[] = [];

      parseGitLog((entry) => {
        entries.push(entry);
      }, parseOptions);

      expect(entries).toEqual([
        {
          header: {
            userName: 'John Doe',
            email: 'john.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 1,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 1,
              linesRemoved: 0,
              path: '/booking/feature-manage/my-other.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-checkin/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shared/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'Jane Doe',
            email: 'jane.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'Jane Doe',
            email: 'john.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/shell/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shell/my-other.component.ts',
            },
          ],
        },
      ]);
    });
  });
  describe('with renamed log entries', () => {
    beforeAll(() => {
      mocks.loadCachedLog.mockImplementation(() => logWithRenames);
    });
    it('returns all log entries', async () => {
      const parseOptions: ParseOptions = {
        limits: {
          limitCommits: 0,
          limitMonths: 0,
        },
      };

      const entries: LogEntry[] = [];

      parseGitLog((entry) => {
        entries.push(entry);
      }, parseOptions);

      expect(entries).toEqual([
        {
          header: {
            userName: 'John Doe',
            email: 'john.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 1,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.renamed.again.component.ts',
            },
            {
              linesAdded: 1,
              linesRemoved: 0,
              path: '/booking/feature-manage/my-other.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-manage/init/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shared/sub-features/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'Jane Doe',
            email: 'jane.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.renamed.again.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-manage/init/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'John Doe',
            email: 'john.doe@acme.com',
            date: past,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.renamed.again.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shared/sub-features/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'Jane Doe',
            email: 'john.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/shell/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shell/my-other.component.ts',
            },
          ],
        },
      ]);
    });
  });

  describe('with filter configured', () => {
    beforeAll(() => {
      mocks.loadCachedLog.mockImplementation(() => logWithSpecFiles);
    });
    it('returns last 2 log entries after filtering', async () => {
      const parseOptions: ParseOptions = {
        limits: {
          limitCommits: 2,
          limitMonths: 0,
        },
        filter: {
          logs: ['format with prettier'],
        },
      };

      const entries: LogEntry[] = [];

      parseGitLog((entry) => {
        entries.push(entry);
      }, parseOptions);

      expect(entries).toEqual([
        {
          header: {
            userName: 'Jane Doe',
            email: 'jane.doe@acme.com',
            date: today,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/checkin/feature-checkin/my.component.ts',
            },
          ],
        },
        {
          header: {
            userName: 'John Doe',
            email: 'john.doe@acme.com',
            date: past,
          },
          body: [
            {
              linesAdded: 10,
              linesRemoved: 0,
              path: '/booking/feature-manage/my.component.ts',
            },
            {
              linesAdded: 0,
              linesRemoved: 1,
              path: '/shared/feature-checkin/my.component.ts',
            },
          ],
        },
      ]);
    });

    it('filters files', async () => {
      const parseOptions: ParseOptions = {
        limits: {
          limitCommits: 2,
          limitMonths: 0,
        },
        filter: {
          files: ['**/*.ts', '!**/*.spec.ts'],
        },
      };

      const entries: LogEntry[] = [];

      parseGitLog((entry) => {
        entries.push(entry);
      }, parseOptions);
    });
  });
});
