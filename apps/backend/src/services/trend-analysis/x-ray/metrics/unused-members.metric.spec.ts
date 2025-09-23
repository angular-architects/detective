import ts from 'typescript';

import { UnusedMembersMetric } from './unused-members.metric';

describe('UnusedMembersMetric', () => {
  const metric = new UnusedMembersMetric();

  function buildContext(code: string) {
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );
    const classNode = sourceFile.statements.find(ts.isClassDeclaration);
    if (!classNode) throw new Error('No class found');
    const program = ts.createProgram([], {});
    const checker = program.getTypeChecker();
    return { sourceFile, classNode, program, checker };
  }

  it('detects various unused private members', () => {
    const code = `
      export class Test {
        private unusedMethod() {}
        private unusedProperty: string;
        #unusedSuperPrivate() {}
        #unusedSuperPrivateField: number;

        constructor(private unusedService: any, public publicService: any) {}

        public publicMethod() {} // should be ignored
      }
    `;
    const { sourceFile, classNode, program, checker } = buildContext(code);
    const result = metric.analyze({
      sourceFile,
      program,
      checker,
      sourceCode: code,
      scopeNode: classNode,
    });
    expect(result.unusedMembers).toBe(5);
    expect(result.unusedMemberNames?.length).toBe(5);
  });

  it('detects unused members with usage patterns', () => {
    const code = `
      class Test {
        private used1() {}
        private used2: string;
        private unused1() {}
        private unused2: string;
        #usedSuper() {}
        #unusedSuper() {}

        method() {
          this.used1();
          console.log(this.used2);
          this.#usedSuper();
        }
      }
    `;
    const { sourceFile, classNode, program, checker } = buildContext(code);
    const result = metric.analyze({
      sourceFile,
      program,
      checker,
      sourceCode: code,
      scopeNode: classNode,
    });
    expect(result.unusedMembers).toBe(3);
    expect(result.unusedMemberNames).toEqual(
      expect.arrayContaining(['unused1', 'unused2', '#unusedSuper'])
    );
  });

  it('detects unused constructor parameter properties', () => {
    const code = `
      class Test {
        constructor(private unused: any) {}
      }
    `;
    const { sourceFile, classNode, program, checker } = buildContext(code);
    const result = metric.analyze({
      sourceFile,
      program,
      checker,
      sourceCode: code,
      scopeNode: classNode,
    });
    expect(result.unusedMembers).toBe(1);
    expect(result.unusedMemberNames).toEqual(['unused']);
  });

  it('finds no unused members when all are used or public', () => {
    const code = `
      class Test {
        private used1() {}
        private used2: string;
        #usedSuper() {}

        constructor(private service: any, public config: any) {}

        public publicMethod() {}
        publicField: string;

        method() {
          this.used1();
          this.used2 = 'value';
          this.#usedSuper();
          this.service.call();
          this.config.get();
        }
      }
    `;
    const { sourceFile, classNode, program, checker } = buildContext(code);
    const result = metric.analyze({
      sourceFile,
      program,
      checker,
      sourceCode: code,
      scopeNode: classNode,
    });
    expect(result.unusedMembers).toBe(0);
    expect(result.unusedMemberNames).toEqual([]);
  });

  it('does not flag private static members used via ClassName access', () => {
    const code = `
      class Example {
        private static readonly CONST = new Set(['a']);
        private static helper() { return 'ok'; }
        private value = 'v';

        method() {
          if (Example.CONST.has('a')) {
            (Example as any).helper();
          }
          // also ensure element access is handled
          const c = (Example as any)['CONST'];
          this.value = 'x';
        }
      }
    `;
    const { sourceFile, classNode, program, checker } = buildContext(code);
    const result = metric.analyze({
      sourceFile,
      program,
      checker,
      sourceCode: code,
      scopeNode: classNode,
    });
    expect(result.unusedMembers).toBe(0);
    expect(result.unusedMemberNames).toEqual([]);
  });
});
