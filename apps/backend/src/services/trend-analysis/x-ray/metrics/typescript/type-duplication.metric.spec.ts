import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { TypeDuplicationMetric } from './type-duplication.metric';

describe('TypeDuplicationMetric', () => {
  it('counts duplicated type shapes', () => {
    const code = `
      interface A { id: number; name: string }
      type B = { name: string; id: number }
      interface C { id: number; name: string }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new TypeDuplicationMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(2);
  });

  it('does not count when shapes are unique', () => {
    const code = `
      interface A { id: number; name: string }
      interface B { id: number; title: string }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new TypeDuplicationMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
