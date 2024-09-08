import { emptyConfig } from '../model/config';
import { defaultOptions } from '../options/options';
import { calcCoupling } from './coupling';
import { Deps } from '../model/deps';

const scopes = ['/booking', '/checkin', '/shared'];

jest.mock('../infrastructure/config', () => ({
  loadConfig: jest.fn(() => ({
    ...emptyConfig,
    scopes,
  })),
}));

jest.mock('../infrastructure/deps', () => ({
  loadDeps: jest.fn(
    () =>
      ({
        '/booking/b1.ts': {
          module: '',
          tags: [],
          imports: ['/booking/b2.ts', '/checkin/c1.ts', '/shared/s1.ts'],
        },
        '/booking/b2.ts': {
          module: '',
          tags: [],
          imports: ['/shared/s1.ts'],
        },
        '/checkin/c1.ts': {
          module: '',
          tags: [],
          imports: ['/shared/s1.ts'],
        },
        '/shared/s1.ts': {
          module: '',
          tags: [],
          imports: ['/shared/s2.ts'],
        },
        '/shared/s2.ts': {
          module: '',
          tags: [],
          imports: [],
        },
        '/shared/s3.ts': {
          module: '',
          tags: [],
          imports: [],
        },
      } as Deps)
  ),
}));

describe('coupling service', () => {
  it('infers coupling from dependencies', async () => {

    const result = await calcCoupling(defaultOptions);

    expect(result.matrix).toEqual([ 
      [ 1, 1, 2 ], 
      [ 0, 0, 1 ], 
      [ 0, 0, 1 ] 
    ]);
    expect(result.dimensions).toEqual(scopes);
    expect(result.fileCount).toEqual([ 2, 1, 3 ]);
    expect(result.cohesion).toEqual([ 100, 100, 33 ]);

  });
});
