import * as ts from 'typescript';

import { AnalyzerContext } from '../x-ray-metrics.types';

export function parseClass(code: string): {
  classNode: ts.ClassDeclaration;
  method: ts.MethodDeclaration;
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
  const method = classNode.members[0] as ts.MethodDeclaration;
  return { classNode, method, sourceFile };
}

export function createContext(sourceFile: ts.SourceFile): AnalyzerContext {
  const fileName = sourceFile.fileName;
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS,
    lib: ['lib.es2018.d.ts', 'lib.dom.d.ts'],
  };

  const host = ts.createCompilerHost(options);
  const origGetSourceFile = host.getSourceFile.bind(host);
  const origReadFile = host.readFile?.bind(host);
  const origFileExists = host.fileExists?.bind(host);

  host.getSourceFile = (f, languageVersion) => {
    if (f === fileName) {
      return ts.createSourceFile(
        f,
        sourceFile.getFullText(),
        languageVersion,
        true
      );
    }
    return origGetSourceFile(f, languageVersion);
  };
  host.readFile = (f) =>
    f === fileName ? sourceFile.getFullText() : origReadFile?.(f);
  host.fileExists = (f) =>
    f === fileName ? true : origFileExists?.(f) ?? false;
  host.writeFile = () => undefined;

  const program = ts.createProgram([fileName], options, host);
  const sf =
    program.getSourceFile(fileName) ??
    ts.createSourceFile(
      fileName,
      sourceFile.getFullText(),
      ts.ScriptTarget.Latest,
      true
    );
  const checker = program.getTypeChecker();

  return {
    sourceFile: sf,
    sourceCode: sf.getFullText(),
    checker,
    program,
  };
}

export function getFirstMethodFrom(sf: ts.SourceFile): ts.MethodDeclaration {
  let found: ts.MethodDeclaration | undefined;
  ts.forEachChild(sf, (node) => {
    if (
      ts.isClassDeclaration(node) &&
      node.members.length > 0 &&
      ts.isMethodDeclaration(node.members[0])
    ) {
      found = node.members[0] as ts.MethodDeclaration;
    }
  });
  if (!found) throw new Error('No method found');
  return found;
}
