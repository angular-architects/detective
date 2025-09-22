import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { ArrayMixedMeaningsMetric } from './array-mixed-meanings.metric';

describe('ArrayMixedMeaningsMetric', () => {
  it('counts arrays mixing heterogeneous element kinds', () => {
    const code = `
      const a = [1, { x: 1 }, true];
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new ArrayMixedMeaningsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(1);
  });

  it('does not count homogeneous arrays', () => {
    const code = `
    type Option = {
      id: string;
      label: string;
    };
    const metricOptions: Option[] = [
        { id: 'Length', label: 'File Length' },
        { id: 'McCabe', label: 'Cyclomatic Complexity' },
      ];
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new ArrayMixedMeaningsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(0);
  });
});
