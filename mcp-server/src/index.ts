#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { searchToolDef, lookupToolDef, badgeToolDef } from './tools.js';

const server = new McpServer({
  name: 'agentrank',
  version: '1.0.0',
});

server.tool(searchToolDef.name, searchToolDef.description, searchToolDef.schema, searchToolDef.handler);
server.tool(lookupToolDef.name, lookupToolDef.description, lookupToolDef.schema, lookupToolDef.handler);
server.tool(badgeToolDef.name, badgeToolDef.description, badgeToolDef.schema, badgeToolDef.handler);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AgentRank MCP server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
