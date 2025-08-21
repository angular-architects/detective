import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { TypeAssertionsMetric } from './type-assertions.metric';

describe('TypeAssertionsMetric', () => {
  it('counts type assertions (as / <Type>)', () => {
    const code = `
      const a = (42 as unknown) as number;
      const b = <number>(42 as any);
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new TypeAssertionsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(4);
  });

  it('does not count when no assertions present', () => {
    const code = `
      const a = 42;
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new TypeAssertionsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
