#!/usr/bin/env node
/**
 * solyto-mcp — dual-mode MCP server
 *
 * stdio mode  (default, for Claude Desktop / Claude Code / local clients)
 *   node dist/index.js
 *
 * HTTP mode   (for Claude.ai web, remote clients)
 *   PORT=3000 node dist/index.js --http
 *
 * Environment variables
 *   SOLYTO_API_URL   Base URL of your solyto instance  (default: http://localhost:8080)
 *   SOLYTO_TOKEN     solyto API bearer token            (required)
 *   MCP_AUTH_KEY     Secret key callers must send as   (optional — recommended for HTTP mode)
 *                    "Authorization: Bearer <key>"
 *   PORT             HTTP port                          (default: 3000)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import { TOOLS, dispatch, makeApiClient } from "./tools.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const API_URL = process.env.SOLYTO_API_URL ?? "http://localhost:8080";
const TOKEN = process.env.SOLYTO_TOKEN ?? "";
const AUTH_KEY = process.env.MCP_AUTH_KEY ?? "";
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const HTTP_MODE = process.argv.includes("--http");

if (!TOKEN) {
  process.stderr.write("Warning: SOLYTO_TOKEN is not set.\n");
}

const callApi = makeApiClient(API_URL, TOKEN);

// ---------------------------------------------------------------------------
// Build the MCP server (shared between both modes)
// ---------------------------------------------------------------------------
function buildMcpServer(): Server {
  const server = new Server(
    { name: "solyto-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    try {
      const result = await dispatch(
        name,
        args as Record<string, unknown>,
        callApi
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      if (err instanceof McpError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      throw new McpError(ErrorCode.InternalError, msg);
    }
  });

  return server;
}

// ---------------------------------------------------------------------------
// Auth middleware (only used in HTTP mode)
// ---------------------------------------------------------------------------
function requireAuth(req: Request, res: Response, next: () => void) {
  if (!AUTH_KEY) return next();
  const header = req.headers["authorization"] ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (provided !== AUTH_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ---------------------------------------------------------------------------
// HTTP mode — Streamable HTTP transport (required for Claude.ai / remote)
// ---------------------------------------------------------------------------
async function startHttp() {
  const app = express();
  app.use(express.json());

  // Health check — lets Claude.ai (and you) verify the server is alive
  app.get("/", (_req, res) => {
    res.json({ name: "solyto-mcp", version: "1.0.0", status: "ok" });
  });

  // MCP endpoint — one POST handles the full JSON-RPC + SSE lifecycle
  app.post("/mcp", requireAuth, async (req: Request, res: Response) => {
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless — one session per request
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({ error: String(err) });
      }
    }
  });

  // Reject GET/DELETE on /mcp (not supported in stateless mode)
  app.get("/mcp", (_req, res) => {
    res.status(405).json({ error: "Method not allowed — use POST /mcp" });
  });

  app.listen(PORT, () => {
    process.stderr.write(
      `solyto-mcp HTTP server listening on port ${PORT}\n` +
        `MCP endpoint: POST http://localhost:${PORT}/mcp\n` +
        (AUTH_KEY ? "Auth: enabled (MCP_AUTH_KEY)\n" : "Auth: disabled\n")
    );
  });
}

// ---------------------------------------------------------------------------
// Stdio mode — for Claude Desktop / Claude Code / local clients
// ---------------------------------------------------------------------------
async function startStdio() {
  const server = buildMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("solyto-mcp running (stdio)\n");
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
if (HTTP_MODE) {
  await startHttp();
} else {
  await startStdio();
}
