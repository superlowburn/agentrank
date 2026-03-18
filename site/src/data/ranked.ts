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

export function getComparisonPairs(minScore = 50): Array<{ a: Tool; b: Tool }> {
  const topTools = tools.filter((t) => (t.score ?? 0) >= minScore);
  const byCategory: Record<string, Tool[]> = {};
  for (const t of topTools) {
    const cat = t.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  }
  const pairs: Array<{ a: Tool; b: Tool }> = [];
  for (const cats of Object.values(byCategory)) {
    const top = cats.slice(0, 10);
    if (top.length < 2) continue;
    for (let i = 0; i < top.length - 1; i++) {
      for (let j = i + 1; j < top.length; j++) {
        pairs.push({ a: top[i], b: top[j] });
      }
    }
  }
  pairs.sort((x, y) => (y.a.score + y.b.score) - (x.a.score + x.b.score));
  return pairs.slice(0, 60);
}
