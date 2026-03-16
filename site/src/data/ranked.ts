import rankedData from '../../../data/ranked.json';
import type { Tool } from './tools';
import { classifyTool } from './content-gen';

const tools: Tool[] = (rankedData as Tool[]).map((t) => ({
  ...t,
  category: classifyTool(t),
}));

export function getAllTools(): Tool[] {
  return tools;
}

export function getTopTools(n: number): Tool[] {
  return tools.slice(0, n);
}
