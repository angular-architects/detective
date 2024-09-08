import { emptyConfig } from '../model/config';
import { defaultOptions } from '../options/options';
import { inferFolders } from './folders';
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
        'booking/feature-a/b1.ts': {
          module: '',
          tags: [],
          imports: ['booking/b2.ts', 'checkin/c1.ts', 'shared/s1.ts'],
        },
        'booking/utils/b2.ts': {
          module: '',
          tags: [],
          imports: ['shared/s1.ts'],
        },
        'checkin/feature-a/c1.ts': {
          module: '',
          tags: [],
          imports: ['shared/s1.ts'],
        },
        'shared/util-a/s1.ts': {
          module: '',
          tags: [],
          imports: ['shared/s2.ts'],
        },
        'shared/util-a/s2.ts': {
          module: '',
          tags: [],
          imports: [],
        },
        'shared/util-b/s3.ts': {
          module: '',
          tags: [],
          imports: [],
        },
      } as Deps)
  ),
}));

describe('folders service', () => {
  it('infers folder structure from dependencies', async () => {
    const result = await inferFolders(defaultOptions);

    expect(result).toEqual([
      {
        name: 'booking',
        path: 'booking',
        folders: [
          {
            name: 'feature-a',
            path: 'booking/feature-a',
            folders: [],
          },
          {
            name: 'utils',
            path: 'booking/utils',
            folders: [],
          },
        ],
      },
      {
        name: 'checkin',
        path: 'checkin',
        folders: [
          {
            name: 'feature-a',
            path: 'checkin/feature-a',
            folders: [],
          },
        ],
      },
      {
        name: 'shared',
        path: 'shared',
        folders: [
          {
            name: 'util-a',
            path: 'shared/util-a',
            folders: [],
          },
          {
            name: 'util-b',
            path: 'shared/util-b',
            folders: [],
          },
        ],
      },
    ]);
  });
});
