import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { MiddleManMetric } from './middle-man.metric';

describe('MiddleManMetric', () => {
  it('counts 1 when a class has ≥3 methods and ≥60% are single-statement delegations', () => {
    const code = `
      class Service {
        // internal helpers as fields so they don't count as methods
        fetchInternal = () => 1;
        persist = (item) => item;

        // delegating to this (recognized)
        doFetch() { return this.fetchInternal(); }

        // delegating to parameter (recognized)
        execute(task) { return task.run(); }

        // delegating to this again (recognized)
        save(item) { return this.persist(item); }

        // non-delegating (multiple statements)
        compute(x) { const y = x + 1; return y * 2; }

        // non-delegating (not a call expression)
        identity(v) { return v; }
      }
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new MiddleManMetric();
    const count = metric.analyze(ctx);

    expect(count).toBe(1);
  });

  it('counts 0 when delegating ratio is below 60% or methods < 3', () => {
    const code = `
      class ApiClient {}

      class Service {
        constructor(private api: ApiClient) {}

        // delegating
        getOne(id) { return this.api.getOne(id); }

        // delegating
        run(task) { return task.run(); }

        // non-delegating
        calc(a) { const b = a * 2; return b - 1; }

        // non-delegating
        noop() { /* nothing */ }
      }
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new MiddleManMetric();
    const count = metric.analyze(ctx);

    expect(count).toBe(0);
  });
});
