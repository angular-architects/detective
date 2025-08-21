import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { ComplexUnionsMetric } from './complex-unions.metric';

describe('ComplexUnionsMetric', () => {
  it('counts unions with more than 4 members', () => {
    const code = `
      type U = 'a' | 'b' | 'c' | 'd' | 'e';
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new ComplexUnionsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(1);
  });

  it('does not count unions with 4 or fewer members', () => {
    const code = `
      type U = 'a' | 'b' | 'c' | 'd';
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new ComplexUnionsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
