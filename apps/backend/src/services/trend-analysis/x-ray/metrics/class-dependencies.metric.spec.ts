import * as ts from 'typescript';

import { ClassDependenciesMetric } from './class-dependencies.metric';
import { parseClass } from './test-utils';

describe('ClassDependenciesMetric', () => {
  describe('analyze', () => {
    it('should collect dependencies from constructor', () => {
      const code = `
class TestClass {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}
}
`;
      const { classNode, sourceFile } = parseClass(code);
      const analyzer = new ClassDependenciesMetric();
      const result = analyzer.analyze({
        sourceFile,
        program: ts.createProgram([], {}),
        checker: ts.createProgram([], {}).getTypeChecker(),
        sourceCode: code,
        scopeNode: classNode,
      });

      expect(result.count).toBe(2);
      expect(result.types.has('UserService')).toBe(true);
      expect(result.types.has('Logger')).toBe(true);
    });

    it('should collect service-like properties', () => {
      const code = `
class TestClass {
  private readonly dataService: DataService;
  private userRepository: UserRepository;
}
`;
      const { classNode, sourceFile } = parseClass(code);
      const analyzer = new ClassDependenciesMetric();
      const result = analyzer.analyze({
        sourceFile,
        program: ts.createProgram([], {}),
        checker: ts.createProgram([], {}).getTypeChecker(),
        sourceCode: code,
        scopeNode: classNode,
      });

      expect(result.count).toBe(2);
      expect(result.types.has('DataService')).toBe(true);
      expect(result.types.has('UserRepository')).toBe(true);
    });

    it('should return empty for class without dependencies', () => {
      const code = `
class EmptyClass {
  private name: string;
  private count: number;
}
`;
      const { classNode, sourceFile } = parseClass(code);
      const analyzer = new ClassDependenciesMetric();
      const result = analyzer.analyze({
        sourceFile,
        program: ts.createProgram([], {}),
        checker: ts.createProgram([], {}).getTypeChecker(),
        sourceCode: code,
        scopeNode: classNode,
      });

      expect(result.count).toBe(0);
      expect(result.types.size).toBe(0);
    });

    it('should collect dependencies from inject() calls', () => {
      const code = `
class TestClass {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  statusStore = inject(StatusStore);
}
`;
      const { classNode, sourceFile } = parseClass(code);
      const analyzer = new ClassDependenciesMetric();
      const result = analyzer.analyze({
        sourceFile,
        program: ts.createProgram([], {}),
        checker: ts.createProgram([], {}).getTypeChecker(),
        sourceCode: code,
        scopeNode: classNode,
      });

      expect(result.count).toBe(3);
      expect(result.types.has('HttpClient')).toBe(true);
      expect(result.types.has('UserService')).toBe(true);
      expect(result.types.has('StatusStore')).toBe(true);
    });
  });
});
