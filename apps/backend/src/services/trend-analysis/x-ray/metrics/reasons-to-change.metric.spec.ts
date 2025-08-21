import * as ts from 'typescript';

import { ReasonsToChangeMetric } from './reasons-to-change.metric';
import { createContext, parseClass } from './test-utils';

describe('ReasonsToChangeMetric', () => {
  let metric: ReasonsToChangeMetric;

  beforeEach(() => {
    metric = new ReasonsToChangeMetric();
  });

  it('analyzes real code and aggregates method/dep categories, packages, and files', () => {
    const code = `
      export class Sample {
        items = [] as number[];

        doThings() {
          console.log('log');
          fetch('/api');
          document.title = 'x';
          this.items.push(1);
        }
      }
    `;

    const { classNode, sourceFile } = parseClass(code);
    const context = createContext(sourceFile);
    const result = metric.analyze({ ...context, scopeNode: classNode });

    // Categories should include both method-derived and dependency-derived ones
    expect(result.reasonsCategories).toEqual(
      expect.arrayContaining([
        'networking', // from fetch()
        'dom', // from document usage
      ])
    );

    // Layer crossing: UI/DOM mixed with state/IO
    expect(result.layerCrossing).toBe(true);

    // Score remains within 1..10 and should be > 1 given multiple categories
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it('returns the minimal result when no class is present in scope', () => {
    const sf = ts.createSourceFile(
      'no-class.ts',
      'export const x = 42;',
      ts.ScriptTarget.Latest,
      true
    );
    const context = createContext(sf);
    const result = metric.analyze({ ...context, scopeNode: undefined });

    expect(result.score).toBe(1);
    expect(result.reasonsCategories).toEqual([]);
    expect(result.externalPackages).toEqual([]);
    expect(result.internalFiles).toEqual([]);
    expect(result.layerCrossing).toBe(false);
  });

  it('detects layer crossing in an Angular-like class mixing DOM with IO', () => {
    const code = `
      // Local stub with the Angular name to trigger type-based networking
      class HttpClient { get(url: string): void {} }

      export class AngularLikeComponent {
        http = inject(HttpClient);

        render() {
          document.title = 'cmp';
          document.getElementById('root');
          this.http.get('/api/data');
        }
      }
    `;

    const { classNode, sourceFile } = parseClass(code);
    const context = createContext(sourceFile);
    const result = metric.analyze({ ...context, scopeNode: classNode });

    expect(result.reasonsCategories).toEqual(
      expect.arrayContaining(['dom', 'networking'])
    );
    expect(result.layerCrossing).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.score).toBeLessThanOrEqual(10);
  });
});
