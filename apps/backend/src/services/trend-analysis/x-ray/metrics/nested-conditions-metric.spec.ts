import { NestedConditionsMetric } from './nested-conditions-metric';
import { parseClass } from './test-utils';

describe('NestedConditionsMetric', () => {
  it('should return 0 for method with no conditionals', () => {
    const classCode = `
      class SimpleClass {
        simpleMethod() {
          const x = 1;
          return x + 2;
        }
      }
    `;

    const { method } = parseClass(classCode);
    const metric = new NestedConditionsMetric();
    const nestedCount = metric.analyze(method);

    expect(nestedCount).toBe(0);
  });

  it('should return 5 for deeply nested conditional method', () => {
    const classCode = `
      class ComplexClass {
        complexMethod(condition1, condition2) {
          if (condition1) {
            while (condition2) {
              for (let i = 0; i < 10; i++) {
                if (i % 2 === 0) {
                  switch (i) {
                    case 0:
                      return 'zero';
                    case 2:
                      return 'two';
                    default:
                      break;
                  }
                }
              }
            }
          }
          return 'done';
        }
      }
    `;

    const { method } = parseClass(classCode);
    const metric = new NestedConditionsMetric();
    const nestedCount = metric.analyze(method);

    expect(nestedCount).toBe(5);
  });

  it('should return 2 for method with nested ternary operators', () => {
    const classCode = `
      class TernaryClass {
        ternaryMethod(a, b, c) {
          return a ?
            (b ? 'both true' : 'only a true') :
            (c ? 'only c true' : 'all false');
        }
      }
    `;

    const { method } = parseClass(classCode);
    const metric = new NestedConditionsMetric();
    const nestedCount = metric.analyze(method);

    expect(nestedCount).toBe(2);
  });
});
