import * as ts from 'typescript';
import { z } from 'zod';

import { AnalyzerContext } from '../../x-ray-metrics.types';
import { BaseMetric } from '../metric.base';
import { Metric } from '../metric.decorator';

@Metric({
  schema: z.object({
    typeDuplication: z
      .number()
      .describe('Duplicate type shapes across codebase (heuristic).'),
  }),
  ui: {
    metrics: [
      {
        path: 'typeDuplication',
        label: 'Type Duplication',
        icon: 'content_copy',
        threshold: { warnGte: 1 },
        tooltip: 'Prefer reusable utility types.',
        refLink:
          'https://www.typescriptlang.org/docs/handbook/utility-types.html',
      },
    ],
  },
})
export class TypeDuplicationMetric extends BaseMetric {
  analyze(context: AnalyzerContext): number {
    const shapeCounts = new Map<string, number>();

    const recordShape = (members: readonly ts.TypeElement[]) => {
      const props: string[] = [];
      for (const m of members) {
        if (!ts.isPropertySignature(m)) continue;
        const nameNode = m.name;
        const name = ts.isIdentifier(nameNode)
          ? nameNode.text
          : ts.isStringLiteral(nameNode)
          ? nameNode.text
          : nameNode.getText();
        const optional = m.questionToken ? '?' : '';
        const typeText = m.type
          ? m.type.getText().replace(/\s+/g, ' ').trim()
          : 'any';
        props.push(`${name}${optional}:${typeText}`);
      }
      if (!props.length) return;
      props.sort();
      const signature = props.join(';');
      shapeCounts.set(signature, (shapeCounts.get(signature) ?? 0) + 1);
    };

    const visit = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node)) {
        recordShape(node.members);
      } else if (
        ts.isTypeAliasDeclaration(node) &&
        ts.isTypeLiteralNode(node.type)
      ) {
        recordShape(node.type.members);
      } else if (
        ts.isParameter(node) &&
        node.type &&
        ts.isTypeLiteralNode(node.type)
      ) {
        recordShape(node.type.members);
      } else if (
        ts.isVariableDeclaration(node) &&
        node.type &&
        ts.isTypeLiteralNode(node.type)
      ) {
        recordShape(node.type.members);
      }
      ts.forEachChild(node, visit);
    };
    visit(context.sourceFile);

    let duplicates = 0;
    shapeCounts.forEach((cnt) => {
      if (cnt > 1) duplicates += cnt - 1;
    });
    return duplicates;
  }
}
