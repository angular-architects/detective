import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import type { Request, Response } from 'express';

export function createMcpHttpRouter(createServer: () => McpServer) {
  const router = express.Router();

  // Stateless Streamable HTTP endpoints (no SSE notifications)
  router.post('/', async (req: Request, res: Response) => {
    try {
      const server = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      res.on('close', () => {
        transport.close();
        server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error: unknown) {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  router.get('/', async (_req: Request, res: Response) => {
    res.status(405).end(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      })
    );
  });

  router.delete('/', async (_req: Request, res: Response) => {
    res.status(405).end(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      })
    );
  });

  router.get('/health', async (_req: Request, res: Response) => {
    res.json({ ok: true, transport: 'streamable-http' });
  });

  return router;
}
