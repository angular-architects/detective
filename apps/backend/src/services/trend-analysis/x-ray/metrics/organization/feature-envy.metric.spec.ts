import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { FeatureEnvyMetric } from './feature-envy.metric';

describe('FeatureEnvyMetric', () => {
  it('counts 1 for a method that accesses foreign params properties 3+ times and more than this', () => {
    const code = `
      class OrderService {
        process(user, order) {
          const id = user.id;
          const total = order.total;
          const status = order.status;
          return id + total + status;
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
    const metric = new FeatureEnvyMetric();
    const count = metric.analyze(ctx);

    expect(count).toBe(1);
  });

  it('counts 0 when foreign property accesses are below threshold or not greater than this', () => {
    const code = `
      class OrderService {
        process(user) {
          this.doSomething();
          return user.id;
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
    const metric = new FeatureEnvyMetric();
    const count = metric.analyze(ctx);

    expect(count).toBe(0);
  });
});
