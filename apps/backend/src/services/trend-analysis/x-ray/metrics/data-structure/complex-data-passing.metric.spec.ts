import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { ComplexDataPassingMetric } from './complex-data-passing.metric';

describe('ComplexDataPassingMetric', () => {
  it('counts large object literals passed to calls/constructors', () => {
    const code = `
      function f() {}
      f({ a: 1, b: 2, c: 3, d: 4 });
      new Date({ a: 1, b: 2, c: 3, d: 4 });
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new ComplexDataPassingMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(2);
  });

  it('counts large destructures and inline object types in params', () => {
    const code = `
      function g({a,b,c,d}) {}
      function h(p: {a: number, b: number, c: number, d: number}) {}
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new ComplexDataPassingMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(2);
  });

  it('ignores decorator arguments', () => {
    const code = `
      function Dec(): any { return () => {} }
      @Dec()
      class C {
        @Dec()
        method() {}
      }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new ComplexDataPassingMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
