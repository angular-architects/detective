import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { AnyTypesMetric } from './any-types.metric';

describe('AnyTypesMetric', () => {
  it('counts any type occurrences', () => {
    const code = `
      function f(x: any) { return x; }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new AnyTypesMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(1);
  });

  it('does not count when no any is used', () => {
    const code = `
      function f(x: string) { return x; }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new AnyTypesMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
