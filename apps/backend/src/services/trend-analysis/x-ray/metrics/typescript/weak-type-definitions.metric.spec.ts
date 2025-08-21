import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { WeakTypeDefinitionsMetric } from './weak-type-definitions.metric';

describe('WeakTypeDefinitionsMetric', () => {
  it('counts interfaces where all members are optional', () => {
    const code = `
      interface W { a?: number; b?: string }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new WeakTypeDefinitionsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(1);
  });

  it('does not count when at least one member is required', () => {
    const code = `
      interface S { a?: number; b: string }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new WeakTypeDefinitionsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
