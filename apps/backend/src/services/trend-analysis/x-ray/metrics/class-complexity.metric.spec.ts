import * as ts from 'typescript';

import { ClassComplexityMetric } from './class-complexity.metric';

describe('ClassComplexityMetric', () => {
  function parseClass(code: string): {
    classNode: ts.ClassDeclaration;
    sourceFile: ts.SourceFile;
  } {
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    let classNode: ts.ClassDeclaration | undefined;

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node)) {
        classNode = node;
      }
    });

    if (!classNode) throw new Error('No class found');
    return { classNode, sourceFile };
  }

  describe('calculateClassComplexity', () => {
    it('should calculate higher complexity for branching code', () => {
      const code = `
class TestClass {
  method() {
    if (true) return 1;
    for (let i = 0; i < 10; i++) {
      console.log(i);
    }
  }
}`;
      const { classNode, sourceFile } = parseClass(code);
      const metric = new ClassComplexityMetric();
      const result = metric.analyze({
        sourceFile,
        program: ts.createProgram([], {}),
        checker: ts.createProgram([], {}).getTypeChecker(),
        sourceCode: code,
        scopeNode: classNode,
      });

      expect(result.cyclomaticComplexity).toBeGreaterThan(1);
      expect(result.fileComplexity).toBeGreaterThan(0);
    });

    it('should handle arrow function properties', () => {
      const code = `
class TestClass {
  handleClick = () => {
    if (this.isValid()) this.process();
  }
}`;
      const { classNode, sourceFile } = parseClass(code);
      const metric = new ClassComplexityMetric();
      const result = metric.analyze({
        sourceFile,
        program: ts.createProgram([], {}),
        checker: ts.createProgram([], {}).getTypeChecker(),
        sourceCode: code,
        scopeNode: classNode,
      });

      expect(result.cyclomaticComplexity).toBeGreaterThan(0);
      expect(result.fileComplexity).toBeDefined();
    });

    it('should return baseline complexity for empty class', () => {
      const code = `class EmptyClass {}`;
      const { classNode, sourceFile } = parseClass(code);
      const metric = new ClassComplexityMetric();
      const result = metric.analyze({
        sourceFile,
        program: ts.createProgram([], {}),
        checker: ts.createProgram([], {}).getTypeChecker(),
        sourceCode: code,
        scopeNode: classNode,
      });

      expect(result.cyclomaticComplexity).toBe(1);
      expect(result.fileComplexity).toBe(1);
    });
  });
});
