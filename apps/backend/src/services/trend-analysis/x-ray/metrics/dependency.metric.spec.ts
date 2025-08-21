import { DependencyMetric } from './dependency.metric';
import { parseClass, createContext } from './test-utils';

describe('DependencyMetric', () => {
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
      const analyzer = new DependencyMetric();
      const ctx = createContext(sourceFile);
      const result = analyzer.analyze({ ...ctx, scopeNode: classNode });

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
      const analyzer = new DependencyMetric();
      const ctx = createContext(sourceFile);
      const result = analyzer.analyze({ ...ctx, scopeNode: classNode });

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
      const analyzer = new DependencyMetric();
      const ctx = createContext(sourceFile);
      const result = analyzer.analyze({ ...ctx, scopeNode: classNode });

      expect(result.count).toBe(0);
      expect(result.types.size).toBe(0);
    });
  });
});
