#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { searchToolDef, lookupToolDef, badgeToolDef } from './tools.js';

function createServerInstance() {
  const srv = new McpServer({
    name: 'agentrank',
    version: '1.0.0',
  });

  srv.tool(searchToolDef.name, searchToolDef.description, searchToolDef.schema, searchToolDef.handler);
  srv.tool(lookupToolDef.name, lookupToolDef.description, lookupToolDef.schema, lookupToolDef.handler);
  srv.tool(badgeToolDef.name, badgeToolDef.description, badgeToolDef.schema, badgeToolDef.handler);

  return srv;
}

// Smithery sandbox scanning support
export function createSandboxServer() {
  return createServerInstance();
}

const server = createServerInstance();

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AgentRank MCP server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
