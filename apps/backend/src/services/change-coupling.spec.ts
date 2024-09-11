import { emptyConfig } from '../model/config';
import { Limits } from '../model/limits';
import { defaultOptions } from '../options/options';
import { calcChangeCoupling } from './change-coupling';

const now = new Date();

const scopes = ['/booking', '/checkin', '/shared'];

jest.mock('../infrastructure/config', () => ({
  loadConfig: jest.fn(() => ({
    ...emptyConfig,
    scopes,
  })),
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

describe('change coupling service', () => {
  it('calculates commits per module alongside change coupling', async () => {
    const limits: Limits = {
      limitCommits: 3,
      limitMonths: 0,
    };

    const result = await calcChangeCoupling(limits, defaultOptions);

    expect(result.dimensions).toEqual(scopes);

    expect(result.matrix).toEqual([
      [0, 2, 2],
      [0, 0, 1],
      [0, 0, 0],
    ]);

    expect(result.sumOfCoupling).toEqual([4, 3, 3]);
    expect(result.fileCount).toEqual([3, 2, 2]);
  });
});
