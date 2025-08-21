import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { MissingTypeGuardsMetric } from './missing-type-guards.metric';

describe('MissingTypeGuardsMetric', () => {
  it('counts 1 for guard-like function lacking a type predicate but narrowing param', () => {
    const code = `
      function isUser(x) {
        return typeof x === 'object' && 'id' in x;
      }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new MissingTypeGuardsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(1);
  });

  it('does not count proper type predicate guards', () => {
    const code = `
      function isUser(x: any): x is { id: number } {
        return typeof x === 'object' && 'id' in x;
      }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new MissingTypeGuardsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
