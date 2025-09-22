import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { loadConfig } from '../infrastructure/config';
import { DETECTIVE_VERSION } from '../infrastructure/version';
import { Options } from '../options/options';
import { calcChangeCoupling } from '../services/change-coupling';
import { calcCoupling } from '../services/coupling';
import { inferFolders } from '../services/folders';
import {
  aggregateHotspots,
  findHotspotFiles,
  HotspotCriteria,
  ComplexityMetric,
} from '../services/hotspot';
import { updateLogCache, isStale } from '../services/log-cache';
import { calcModuleInfo } from '../services/module-info';
import { calcTeamAlignment } from '../services/team-alignment';
import {
  runTrendAnalysis,
  formatTrendAnalysisForAPI,
} from '../services/trend-analysis';

type Limits = {
  limitCommits: number | null;
  limitMonths: number | null;
};

const limitsSchema = z.object({
  limitCommits: z.number().int().nullable().optional(),
  limitMonths: z.number().int().nullable().optional(),
});
const limitsSchemaShape = {
  limitCommits: z.number().int().nullable().optional(),
  limitMonths: z.number().int().nullable().optional(),
} as const;
type LimitsArgs = {
  limitCommits?: number | null;
  limitMonths?: number | null;
};

function toLimits(input: Partial<z.infer<typeof limitsSchema>>): Limits {
  return {
    limitCommits:
      typeof input.limitCommits === 'number' ? input.limitCommits : null,
    limitMonths:
      typeof input.limitMonths === 'number' ? input.limitMonths : null,
  };
}

export function createMcpServer(options: Options): McpServer {
  const server = new McpServer({
    name: 'detective-backend',
    version: DETECTIVE_VERSION,
  });

  // config.read
  server.registerTool(
    'config.read',
    {
      title: 'Read Detective config',
      description: 'Returns the Detective configuration loaded from file',
      inputSchema: {},
    },
    async () => {
      const cfg = loadConfig(options);
      return {
        content: [{ type: 'text', text: JSON.stringify(cfg) }],
      };
    }
  );

  // config.write
  server.registerTool(
    'config.write',
    {
      title: 'Write Detective config',
      description:
        'Persists the Detective configuration to the configured file',
      inputSchema: {
        config: z.object({
          scopes: z.array(z.string()),
          groups: z.array(z.string()),
          entries: z.array(z.unknown()),
          filter: z.object({
            files: z.array(z.string()),
            logs: z.array(z.string()),
          }),
          aliases: z.record(z.string(), z.string()),
          teams: z.record(z.string(), z.array(z.string())),
        }),
      },
    },
    async ({ config }: { config?: unknown }) => {
      if (!config || typeof config !== 'object') {
        throw new Error("'config' object is required");
      }
      const path = await import('node:path');
      const fs = await import('node:fs/promises');
      const filePath = path.join(process.cwd(), options.config);
      await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf8');
      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: true }) }],
      };
    }
  );

  // cache.status
  server.registerTool(
    'cache.status',
    {
      title: 'Get log cache status',
      description: 'Returns whether the log cache is stale',
      inputSchema: {},
    },
    async () => {
      const stale = isStale();
      return {
        content: [{ type: 'text', text: JSON.stringify({ isStale: stale }) }],
      };
    }
  );

  // cache.update
  server.registerTool(
    'cache.update',
    {
      title: 'Update log cache',
      description: 'Updates the git log cache',
      inputSchema: {},
    },
    async () => {
      await updateLogCache();
      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: true }) }],
      };
    }
  );

  // modules.get
  server.registerTool(
    'modules.get',
    {
      title: 'Get module info',
      description: 'Calculates module information',
      inputSchema: {},
    },
    async () => {
      const result = calcModuleInfo(options);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  // folders.get
  server.registerTool(
    'folders.get',
    {
      title: 'Get inferred folders',
      description: 'Infers folder structure from configuration',
      inputSchema: {},
    },
    async () => {
      const result = inferFolders(options);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  // coupling.get
  server.registerTool(
    'coupling.get',
    {
      title: 'Get coupling',
      description: 'Calculates coupling matrix and cohesion',
      inputSchema: {},
    },
    async () => {
      const result = calcCoupling(options);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  // changeCoupling.get
  server.registerTool(
    'changeCoupling.get',
    {
      title: 'Get change coupling',
      description: 'Calculates change coupling for recent history',
      inputSchema: limitsSchemaShape,
    },
    async (input: LimitsArgs) => {
      const result = await calcChangeCoupling(toLimits(input), options);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  // teamAlignment.get
  server.registerTool(
    'teamAlignment.get',
    {
      title: 'Get team alignment',
      description: 'Calculates team alignment metrics',
      inputSchema: { ...limitsSchemaShape, byUser: z.boolean().optional() },
    },
    async (input: LimitsArgs & { byUser?: boolean }) => {
      const { byUser = false, ...rest } = input as LimitsArgs & {
        byUser?: boolean;
      };
      const result = await calcTeamAlignment(byUser, toLimits(rest), options);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  // hotspots.find
  server.registerTool(
    'hotspots.find',
    {
      title: 'Find hotspots',
      description: 'Finds hotspot files based on criteria and limits',
      inputSchema: {
        ...limitsSchemaShape,
        module: z.string().default(''),
        minScore: z.number().default(-1),
        metric: z.enum(['McCabe', 'Length']).default('McCabe'),
      },
    },
    async (
      input: LimitsArgs & {
        module?: string;
        minScore?: number;
        metric?: ComplexityMetric;
      }
    ) => {
      const criteria: HotspotCriteria = {
        module: input.module ?? '',
        minScore: typeof input.minScore === 'number' ? input.minScore : -1,
        metric: (input.metric as ComplexityMetric) ?? 'McCabe',
      };
      const limits = toLimits(input);
      const result = await findHotspotFiles(criteria, limits, options);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  // hotspots.aggregate
  server.registerTool(
    'hotspots.aggregate',
    {
      title: 'Aggregate hotspots',
      description: 'Aggregates hotspot statistics per module',
      inputSchema: {
        ...limitsSchemaShape,
        minScore: z.number().default(50),
        metric: z.enum(['McCabe', 'Length']).default('McCabe'),
      },
    },
    async (
      input: LimitsArgs & { minScore?: number; metric?: ComplexityMetric }
    ) => {
      const criteria: HotspotCriteria = {
        module: '',
        minScore: typeof input.minScore === 'number' ? input.minScore : 50,
        metric: (input.metric as ComplexityMetric) ?? 'McCabe',
      };
      const limits = toLimits(input);
      const result = await aggregateHotspots(criteria, limits, options);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  // trendAnalysis.run
  server.registerTool(
    'trendAnalysis.run',
    {
      title: 'Run trend analysis',
      description: 'Runs trend analysis and returns formatted results',
      inputSchema: {
        maxCommits: z.number().int().default(50),
        parallelWorkers: z.number().int().min(1).max(10).default(5),
        fileExtensions: z
          .array(z.string())
          .default(['.ts', '.js', '.tsx', '.jsx']),
      },
    },
    async (args: {
      maxCommits?: number;
      parallelWorkers?: number;
      fileExtensions?: string[];
    }) => {
      const maxCommits = args.maxCommits ?? 50;
      const parallelWorkers = Math.max(
        1,
        Math.min(10, args.parallelWorkers ?? 5)
      );
      const fileExtensions = args.fileExtensions ?? [
        '.ts',
        '.js',
        '.tsx',
        '.jsx',
      ];
      const result = await runTrendAnalysis(options, {
        maxCommits,
        fileExtensions,
        parallelWorkers,
      });
      const formatted = await formatTrendAnalysisForAPI(
        result,
        options.path,
        fileExtensions
      );
      return { content: [{ type: 'text', text: JSON.stringify(formatted) }] };
    }
  );

  // xray.get
  server.registerTool(
    'xray.get',
    {
      title: 'Get X-Ray analysis',
      description: 'Analyzes a file and returns X-Ray metrics',
      inputSchema: {
        file: z.string(),
        includeSource: z.boolean().default(false),
      },
    },
    async ({
      file,
      includeSource,
    }: {
      file?: string;
      includeSource?: boolean;
    }) => {
      if (!file) {
        throw new Error("Parameter 'file' is required");
      }
      const path = await import('node:path');
      const fs = await import('node:fs');
      const repoRoot = path.resolve(options.path);
      const fullPath = path.resolve(repoRoot, file);
      const relativeToRoot = path.relative(repoRoot, fullPath);
      if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
        throw new Error('File path must be within the repository root');
      }
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${file}`);
      }
      const { CodeAnalyzer } = await import(
        '../services/trend-analysis/x-ray/code-analyzer'
      );
      const analyzer = new CodeAnalyzer(fullPath);
      const metrics = await analyzer.analyze(includeSource ?? false);
      return { content: [{ type: 'text', text: JSON.stringify(metrics) }] };
    }
  );

  // xray.schema
  server.registerTool(
    'xray.schema',
    {
      title: 'Get X-Ray schema',
      description: 'Returns JSON schema and UI schema for X-Ray',
      inputSchema: {},
    },
    async () => {
      const { CodeAnalyzer } = await import(
        '../services/trend-analysis/x-ray/code-analyzer'
      );
      const { buildBaseXRaySchema } = await import(
        '../services/trend-analysis/x-ray/x-ray.schema'
      );
      const jsonSchema = CodeAnalyzer.buildJSONSchema() as Record<
        string,
        unknown
      >;
      const uiSchema =
        (jsonSchema as { [key: string]: unknown })['x-ui'] ??
        CodeAnalyzer.buildUISchema();
      const base = buildBaseXRaySchema();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              version: base.version,
              jsonSchema,
              uiSchema,
            }),
          },
        ],
      };
    }
  );

  return server;
}
