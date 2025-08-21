import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { NullChecksMetric } from './null-checks.metric';

describe('NullChecksMetric', () => {
  it('counts non-strict equality checks against null/undefined', () => {
    const code = `
      if (x == null) {}
      if (y != undefined) {}
      if (z === null) {}
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new NullChecksMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(2);
  });

  it('ignores strict nullish comparisons', () => {
    const code = `
      if (a === null) {}
      if (b !== undefined) {}
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new NullChecksMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
