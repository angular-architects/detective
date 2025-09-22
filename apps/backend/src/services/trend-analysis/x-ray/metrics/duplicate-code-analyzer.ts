import {
  Detector,
  MemoryStore,
  getDefaultOptions,
  type IClone,
  type IMapFrame,
} from '@jscpd/core';
import { Tokenizer } from '@jscpd/tokenizer';
import * as ts from 'typescript';
import { z } from 'zod';

export interface DuplicateDetails {
  location: string;
  count: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DuplicateAnalysisResult {
  duplicateInfo: Map<string, DuplicateDetails>;
}

/**
 * Analyzes duplicate code blocks within a file.
 * Detects code clones and calculates severity based on the size of duplicates.
 */
export class DuplicateCodeAnalyzer {
  private static readonly MIN_LINES = 3;
  private static readonly SEVERITY_THRESHOLDS = {
    HIGH: 30,
    MEDIUM: 12,
  };

  static getMeta() {
    return {
      schema: z.object({
        duplicateBlocks: z
          .number()
          .describe('Number of duplicate blocks within this class.'),
        duplicateDetails: z
          .array(
            z.object({
              location: z.string(),
              count: z.number(),
              severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
            })
          )
          .optional(),
      }),
      ui: {
        sections: [
          {
            type: 'duplicates',
            title: 'Duplicate Code',
            path: 'duplicateDetails',
          },
        ],
      },
    } as const;
  }

  async analyze(
    fileName: string,
    sourceCode: string
  ): Promise<DuplicateAnalysisResult> {
    const duplicateInfo = await this.computeDuplicateInfo(fileName, sourceCode);
    return { duplicateInfo };
  }

  getDuplicateCountForClass(
    duplicateInfo: Map<string, DuplicateDetails>,
    classNode: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
  ): number {
    const { startLine, endLine } = this.getNodeLineRange(classNode, sourceFile);
    let duplicateCount = 0;

    duplicateInfo.forEach((details, location) => {
      const [dupStart, dupEnd] = this.parseLineRange(location);

      // Check if duplicate overlaps with class
      if (dupStart >= startLine && dupEnd <= endLine) {
        duplicateCount += details.count;
      }
    });

    return duplicateCount;
  }

  getDuplicateDetailsForClass(
    duplicateInfo: Map<string, DuplicateDetails>,
    classNode: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
  ): DuplicateDetails[] {
    const { startLine, endLine } = this.getNodeLineRange(classNode, sourceFile);
    const details: DuplicateDetails[] = [];

    duplicateInfo.forEach((info, location) => {
      const [dupStart, dupEnd] = this.parseLineRange(location);
      if (dupStart >= startLine && dupEnd <= endLine) {
        details.push(info);
      }
    });

    return details;
  }

  private getNodeLineRange(
    node: ts.Node,
    sourceFile: ts.SourceFile
  ): { startLine: number; endLine: number } {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    return {
      startLine: start.line + 1,
      endLine: end.line + 1,
    };
  }

  private async computeDuplicateInfo(
    fileName: string,
    sourceCode: string
  ): Promise<Map<string, DuplicateDetails>> {
    const tokenizer = new Tokenizer();
    const store = new MemoryStore<IMapFrame>();
    const options = getDefaultOptions();
    options.minLines = options.minLines ?? DuplicateCodeAnalyzer.MIN_LINES;

    const detector = new Detector(tokenizer, store, [], options);
    const format = 'typescript';

    let clones: IClone[] = [];
    try {
      clones = await detector.detect(fileName, sourceCode, format);
    } catch (_err) {
      // If detection fails, return empty result
      clones = [];
    }

    return this.processClones(clones);
  }

  private processClones(clones: IClone[]): Map<string, DuplicateDetails> {
    const map = new Map<string, DuplicateDetails>();

    for (const clone of clones) {
      const aStart = clone.duplicationA.start.line;
      const aEnd = clone.duplicationA.end.line;
      const bStart = clone.duplicationB.start.line;
      const bEnd = clone.duplicationB.end.line;

      const keyA = `${aStart}-${aEnd}`;
      const keyB = `${bStart}-${bEnd}`;

      const sevA = this.computeSeverity(aEnd - aStart + 1);
      const sevB = this.computeSeverity(bEnd - bStart + 1);

      const existingA = map.get(keyA);
      const existingB = map.get(keyB);

      map.set(keyA, {
        location: keyA,
        count: (existingA?.count ?? 0) + 1,
        severity: existingA ? this.maxSeverity(existingA.severity, sevA) : sevA,
      });

      map.set(keyB, {
        location: keyB,
        count: (existingB?.count ?? 0) + 1,
        severity: existingB ? this.maxSeverity(existingB.severity, sevB) : sevB,
      });
    }

    return map;
  }

  private computeSeverity(lines: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (lines >= DuplicateCodeAnalyzer.SEVERITY_THRESHOLDS.HIGH) return 'HIGH';
    if (lines >= DuplicateCodeAnalyzer.SEVERITY_THRESHOLDS.MEDIUM)
      return 'MEDIUM';
    return 'LOW';
  }

  private maxSeverity(
    a: 'LOW' | 'MEDIUM' | 'HIGH',
    b: 'LOW' | 'MEDIUM' | 'HIGH'
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    const order: Record<'LOW' | 'MEDIUM' | 'HIGH', number> = {
      LOW: 0,
      MEDIUM: 1,
      HIGH: 2,
    };
    return order[a] >= order[b] ? a : b;
  }

  private parseLineRange(location: string): [number, number] {
    const parts = location.split('-').map(Number);
    return [parts[0], parts[1]];
  }
}
