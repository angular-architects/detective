import { emptyConfig } from '../model/config';
import { Limits } from '../model/limits';
import { defaultOptions, Options } from '../options/options';

import { calcTeamAlignment } from './team-alignment';

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
    aliases: {
      'Mäster, Max': 'Max Mäster',
    },
    teams: {
      alpha: ['John Doe'],
      beta: ['Jane Doe', 'Max Muster'],
    },
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
0\t20\t/checkin/feature-checkin/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts

"Jane Doe <jane.doe@acme.com>,${now.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/checkin/feature-checkin/my.component.ts

"Max Muster <max.muster@acme.com>,${now.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts

"Maria Muster <maria.muster@acme.com>,${now.toISOString()}"
0\t20\t/checkin/feature-checkin/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts

"Jane Doe <john.doe@acme.com>,${now.toISOString()}"
20\t0\t/shell/my.component.ts
0\t1\t/shell/my-other.component.ts

"Mäster, Max <max.maester@acme.com>,${now.toISOString()}"
10\t0\t/booking/feature-manage/my.component.ts
0\t1\t/checkin/feature-checkin/my.component.ts

"Max Ma\u0308ster <max.maester@acme.com>,${now.toISOString()}"
0\t20\t/checkin/feature-checkin/my.component.ts
0\t1\t/shared/feature-checkin/my.component.ts
`
  ),
}));

describe('team alignment service', () => {
  it('derives team alignment from git logs', async () => {
    const limits: Limits = {
      limitCommits: 4,
      limitMonths: 0,
    };

    const result = await calcTeamAlignment(false, limits, defaultOptions);

    expect(result.modules).toEqual({
      '/booking': {
        changes: {
          alpha: 2,
          beta: 20,
        },
      },
      '/checkin': {
        changes: {
          alpha: 20,
          beta: 1,
          unknown: 20,
        },
      },
      '/shared': {
        changes: {
          alpha: 1,
          beta: 1,
          unknown: 1,
        },
      },
    });

    expect(result.teams).toEqual(['alpha', 'beta', 'unknown']);
  });

  it('breaks down team alignment to user level', async () => {
    const limits: Limits = {
      limitCommits: 4,
      limitMonths: 0,
    };

    const result = await calcTeamAlignment(true, limits, defaultOptions);

    expect(result.modules).toEqual({
      '/booking': {
        changes: { 'John Doe': 2, 'Jane Doe': 10, 'Max Muster': 10 },
      },
      '/checkin': {
        changes: { 'John Doe': 20, 'Jane Doe': 1, 'Maria Muster': 20 },
      },
      '/shared': {
        changes: { 'John Doe': 1, 'Max Muster': 1, 'Maria Muster': 1 },
      },
    });

    expect(result.teams).toEqual([
      'Jane Doe',
      'John Doe',
      'Maria Muster',
      'Max Muster',
    ]);
  });

  it('uses dummy users in demo mode', async () => {
    const limits: Limits = {
      limitCommits: 4,
      limitMonths: 0,
    };

    const options: Options = {
      ...defaultOptions,
      demoMode: true,
    };

    const result = await calcTeamAlignment(true, limits, options);

    expect(result.modules).toEqual({
      '/booking': {
        changes: {
          'Max Muster': 2,
          'John Doe': 10,
          'Jane Doe': 10,
        },
      },
      '/checkin': {
        changes: {
          'Max Muster': 20,
          'John Doe': 1,
          'Maria Muster': 20,
        },
      },
      '/shared': {
        changes: {
          'Max Muster': 1,
          'Jane Doe': 1,
          'Maria Muster': 1,
        },
      },
    });
  });

  it('should treat usernames with composed and decomposed umlauts as identical', async () => {
    const limits: Limits = {
      limitCommits: 7,
      limitMonths: 0,
    };

    const result = await calcTeamAlignment(true, limits, defaultOptions);

    expect(result.modules).toEqual({
      '/booking': {
        changes: {
          'Jane Doe': 10,
          'John Doe': 2,
          'Max Muster': 10,
          'Max Mäster': 10,
        },
      },
      '/checkin': {
        changes: {
          'Jane Doe': 1,
          'John Doe': 20,
          'Maria Muster': 20,
          'Max Mäster': 21,
        },
      },
      '/shared': {
        changes: {
          'John Doe': 1,
          'Maria Muster': 1,
          'Max Muster': 1,
          'Max Mäster': 1,
        },
      },
    });

    expect(result.teams).toEqual([
      'Jane Doe',
      'John Doe',
      'Maria Muster',
      'Max Muster',
      'Max Mäster',
    ]);
  });
});
