import { MethodResponsibilityMetric } from './method-responsibility-metric';
import { getFirstMethodFrom, createContext, parseClass } from './test-utils';

describe('MethodResponsibilityMetric', () => {
  // Helpers imported from test-utils

  it('computes responsibilities, categories, and flags for a simple method', () => {
    const code = `
      class TestClass {
        simpleMethod(param) {
          const x = 1;
          console.log(x);
          return x + 2;
        }
      }
    `;

    const { sourceFile } = parseClass(code);
    const ctx = createContext(sourceFile);
    const method = getFirstMethodFrom(ctx.sourceFile);
    const metric = new MethodResponsibilityMetric();
    const result = metric.analyze(ctx, method);

    expect(result.responsibilities).toBeGreaterThanOrEqual(1);
    expect(result.categories.has('logging')).toBe(true);
    expect(result.writesThis).toBe(false);
    expect(result.mutatesParams).toBe(false);
  });

  it('detects writes to this, param mutations, and global categories', () => {
    const code = `
      class UserService {
        updateUser(user) {
          console.log('Updating user:', user.id);
          this.status = 'updating';
          user = { id: user.id };
          fetch('/api/users/' + user.id, { method: 'PUT' });
          localStorage.setItem('lastUser', user.id);
          this.users.push(user);
        }
      }
    `;

    const { sourceFile } = parseClass(code);
    const ctx = createContext(sourceFile);
    const method = getFirstMethodFrom(ctx.sourceFile);
    const metric = new MethodResponsibilityMetric();
    const result = metric.analyze(ctx, method);

    expect(result.writesThis).toBe(true);
    expect(result.mutatesParams).toBe(true);
    expect(result.categories.has('logging')).toBe(true);
    expect(result.categories.has('networking')).toBe(true);
    expect(result.categories.has('storage')).toBe(true);
    expect(result.responsibilities).toBeGreaterThanOrEqual(3);
  });
});
