import { emptyConfig } from '../model/config';
import { Limits } from '../model/limits';
import { defaultOptions } from '../options/options';

import {
  aggregateHotspots,
  findHotspotFiles,
  HotspotCriteria,
} from './hotspot';

const now = new Date();

const scopes = ['/booking', '/checkin', '/shared'];

jest.mock('../utils/complexity', () => ({
  calcCyclomaticComplexity: jest.fn(() => 30),
}));

jest.mock('../utils/count-lines', () => ({
  countLinesInFile: jest.fn(() => 100),
}));

jest.mock('../infrastructure/config', () => ({
  loadConfig: jest.fn(() => ({
    ...emptyConfig,
    scopes,
  })),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
}));

jest.mock('../infrastructure/log', () => ({
  loadCachedLog: jest.fn(
    () => `"John Doe <john.doe@acme.com>,${now.toISOString()}"
1\t0\t/booking/feature-manage/my.component.ts
1\t0\t/booking/feature-manage/my-other.component.ts
0\t1\t/checkin/feature-checkin/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts

"Jane Doe <jane.doe@acme.com>,${now.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/checkin/feature-checkin/my.component.ts

"John Doe <john.doe@acme.com>,${now.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts

"Jane Doe <john.doe@acme.com>,${now.toISOString()}"
10\t0\t/shell/my.component.ts
0\t1\t/shell/my-other.component.ts
`
  ),
}));

describe('hotspot service', () => {
  it('finds modules with number of files exceeding given threshold', async () => {
    const limits: Limits = {
      limitCommits: 3,
      limitMonths: 0,
    };

    const criteria: HotspotCriteria = {
      metric: 'Length',
      minScore: 50,
      module: '',
    };

    const result = await aggregateHotspots(criteria, limits, defaultOptions);

    expect(result.aggregated).toEqual([
      {
        parent: '/',
        module: '/booking',
        count: 1,
        countHotspot: 1,
        countOk: 1,
        countWarning: 0,
      },
      {
        parent: '/',
        module: '/checkin',
        count: 0,
        countHotspot: 0,
        countOk: 0,
        countWarning: 1,
      },
      {
        parent: '/',
        module: '/shared',
        count: 0,
        countHotspot: 0,
        countOk: 0,
        countWarning: 1,
      },
    ]);
  });

  it('finds modules with number of files exceeding given threshold with boundary criteria', async () => {
    const limits: Limits = {
      limitCommits: 3,
      limitMonths: 0,
    };

    const criteria: HotspotCriteria = {
      metric: 'Length',
      minScore: 34,
      module: '',
    };

    const result = await aggregateHotspots(criteria, limits, defaultOptions);

    expect(result.aggregated).toEqual([
      {
        parent: '/',
        module: '/booking',
        count: 1,
        countHotspot: 1,
        countOk: 1,
        countWarning: 0,
      },
      {
        parent: '/',
        module: '/checkin',
        count: 0,
        countHotspot: 0,
        countOk: 0,
        countWarning: 1,
      },
      {
        parent: '/',
        module: '/shared',
        count: 0,
        countHotspot: 0,
        countOk: 0,
        countWarning: 1,
      },
    ]);
  });

  it('finds hotspots exceeding given threshold using Length metric', async () => {
    const limits: Limits = {
      limitCommits: 3,
      limitMonths: 0,
    };

    const criteria: HotspotCriteria = {
      metric: 'Length',
      minScore: 101,
      module: '/booking',
    };

    const result = await findHotspotFiles(criteria, limits, defaultOptions);

    expect(result.hotspots).toEqual([
      {
        fileName: '/booking/feature-manage/my.component.ts',
        commits: 3,
        changedLines: 21,
        complexity: 100,
        score: 300,
      },
    ]);
  });

  it('finds hotspots exceeding given threshold using McCabe', async () => {
    const limits: Limits = {
      limitCommits: 3,
      limitMonths: 0,
    };

    const criteria: HotspotCriteria = {
      metric: 'McCabe',
      minScore: 31,
      module: '/booking',
    };

    const result = await findHotspotFiles(criteria, limits, defaultOptions);

    expect(result.hotspots).toEqual([
      {
        fileName: '/booking/feature-manage/my.component.ts',
        commits: 3,
        changedLines: 21,
        complexity: 30,
        score: 90,
      },
    ]);
  });
});
