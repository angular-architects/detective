import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { ComplexAlgorithmsMetric } from './complex-algorithms.metric';

describe('ComplexAlgorithmsMetric', () => {
  it('counts 1 when a method has cyclomatic complexity ≥ 15 or nesting depth ≥ 4', () => {
    const code = `
      function complex(a, b, c, d) {
        if (a) {
          for (let i = 0; i < 3; i++) {
            while (b) {
              if (c) {
                switch (d) {
                  case 1: if (a && b) { return 1; } break;
                  case 2: if (a || c) { return 2; } break;
                  default: if (!d) { return 3; }
                }
              }
            }
          }
        }
        return 0;
      }
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new ComplexAlgorithmsMetric();
    const count = metric.analyze(ctx);

    expect(count).toBe(1);
  });

  it('counts 0 for simple functions below thresholds', () => {
    const code = `
      function simple(x) {
        if (x) {
          return 1;
        }
        return 0;
      }
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new ComplexAlgorithmsMetric();
    const count = metric.analyze(ctx);

    expect(count).toBe(0);
  });
});
