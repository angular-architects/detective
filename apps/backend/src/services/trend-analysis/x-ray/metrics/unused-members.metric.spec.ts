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
    const count = metric.analyze({
      sourceFile,
      program,
      checker,
      sourceCode: code,
      scopeNode: classNode,
    });
    expect(count).toBe(5);
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
    const count = metric.analyze({
      sourceFile,
      program,
      checker,
      sourceCode: code,
      scopeNode: classNode,
    });
    expect(count).toBe(3);
  });

  it('detects unused constructor parameter properties', () => {
    const code = `
      class Test {
        constructor(private unused: any) {}
      }
    `;
    const { sourceFile, classNode, program, checker } = buildContext(code);
    const count = metric.analyze({
      sourceFile,
      program,
      checker,
      sourceCode: code,
      scopeNode: classNode,
    });
    expect(count).toBe(1);
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
    const count = metric.analyze({
      sourceFile,
      program,
      checker,
      sourceCode: code,
      scopeNode: classNode,
    });
    expect(count).toBe(0);
  });
});
