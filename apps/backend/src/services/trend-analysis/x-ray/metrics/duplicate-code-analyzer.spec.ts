import { DuplicateCodeAnalyzer } from './duplicate-code-analyzer';

describe('DuplicateCodeAnalyzer', () => {
  let analyzer: DuplicateCodeAnalyzer;

  beforeEach(() => {
    analyzer = new DuplicateCodeAnalyzer();
  });

  describe('analyze', () => {
    it('should analyze code and return duplicate info map', async () => {
      const code = `
          function processData(data: any): void {
            console.log('Processing data');
            console.log('Step 1');
            console.log('Step 2');
            console.log('Done');
          }

          function handleData(data: any): void {
            console.log('Processing data');
            console.log('Step 1');
            console.log('Step 2');
            console.log('Done');
          }
          `;

      const result = await analyzer.analyze('test.ts', code);
      expect(result.duplicateInfo).toBeDefined();
      expect(result.duplicateInfo instanceof Map).toBe(true);
    });

    it('should classify severity correctly', async () => {
      // Create a 13-line duplicate for MEDIUM severity
      const lines = Array(13).fill('  console.log("line");').join('\n');
      const code = `
        function method1() {
          ${lines}
        }
        function method2() {
          ${lines}
        }
        `;

      const result = await analyzer.analyze('test.ts', code);
      const severities = Array.from(result.duplicateInfo.values()).map(
        (d) => d.severity
      );
      expect(severities).toContain('MEDIUM');
    });

    it('should return empty result for unique code', async () => {
      const code = `
        function add(a: number, b: number): number {
          return a + b;
        }
        function multiply(x: number, y: number): number {
          return x * y;
        }
        `;

      const result = await analyzer.analyze('test.ts', code);
      expect(result.duplicateInfo.size).toBe(0);
    });
  });
});
