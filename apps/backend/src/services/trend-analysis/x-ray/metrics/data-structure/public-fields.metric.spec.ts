import * as ts from 'typescript';

import { createContext } from '../test-utils';

import { PublicFieldsMetric } from './public-fields.metric';

describe('PublicFieldsMetric', () => {
  it('counts public fields excluding Angular signals', () => {
    const code = `
      import { signal, computed } from '@angular/core';
      class C {
        x = 1; // public
        y: string; // public
        a = signal(1); // Angular signal initializer
        b: Signal<number>;
        c: WritableSignal<string>;
        d: ReadonlySignal<boolean>;
        e: ComputedSignal<number>;
        constructor() { this.y = 'ok'; this.b = signal(2) as any; }
      }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new PublicFieldsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(2);
  });

  it('does not count private/protected fields', () => {
    const code = `
      class C {
        private x = 1;
        protected y = 2;
        public z = 3;
      }
    `;
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const ctx = createContext(sourceFile);
    const metric = new PublicFieldsMetric();
    const count = metric.analyze(ctx);
    expect(count).toBe(1);
  });
});
