import rankedData from '../../../data/ranked.json';
import type { Tool } from './tools';

const tools: Tool[] = rankedData as Tool[];

export function getAllTools(): Tool[] {
  return tools;
}

export function getTopTools(n: number): Tool[] {
  return tools.slice(0, n);
}
