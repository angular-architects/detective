import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { MagicNumbersMetric } from './magic-numbers.metric';

describe('MagicNumbersMetric', () => {
  it('counts numeric literals not in the allowed set', () => {
    const code = `
      const a = 3, b = 5, c = -1, d = 0, e = 2;
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new MagicNumbersMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(2);
  });

  it('does not count allowed literals (-1, 0, 1, 2)', () => {
    const code = `
      const a = -1, b = 0, c = 1, d = 2;
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new MagicNumbersMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
