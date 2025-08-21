import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { TemporalCouplingMetric } from './temporal-coupling.metric';

describe('TemporalCouplingMetric', () => {
  it('counts 1 when a field is written in one method and read in a condition in another (order dependence)', () => {
    const code = `
      class Service {
        flag = false;

        initialize() {
          this.flag = true;
        }

        execute() {
          if (this.flag) {
            return 'go';
          }
          return 'stop';
        }
      }
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new TemporalCouplingMetric();
    const count = metric.analyze(ctx);

    expect(count).toBe(1);
  });

  it('counts 0 when reads in conditions happen only within the same method that writes (no cross-method order dependence)', () => {
    const code = `
      class Service {
        ready = false;

        process() {
          this.ready = !this.ready;
          if (this.ready) {
            return 'ok';
          }
          return 'wait';
        }
      }
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new TemporalCouplingMetric();
    const count = metric.analyze(ctx);

    expect(count).toBe(0);
  });
});
