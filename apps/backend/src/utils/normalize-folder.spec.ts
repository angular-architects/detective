import { normalizeFolder, toDisplayFolder } from './normalize-folder';

describe('normalize-folder', () => {
  it('normalizeFolder adds trailing slash', () => {
    const path = 'x/y/z';
    const result = normalizeFolder(path);
    expect(result).toBe('x/y/z/');
  });

  it('normalizeFolder does not add 2nd trailing slash', () => {
    const path = 'x/y/z/';
    const result = normalizeFolder(path);
    expect(result).toBe('x/y/z/');
  });

  it('toDisplayFolder removes trailing slash', () => {
    const path = 'x/y/z/';
    const result = toDisplayFolder(path);
    expect(result).toBe('x/y/z');
  });

  it('toDisplayFolder does not change path without trailing slash', () => {
    const path = 'x/y/z';
    const result = toDisplayFolder(path);
    expect(result).toBe('x/y/z');
  });
});
