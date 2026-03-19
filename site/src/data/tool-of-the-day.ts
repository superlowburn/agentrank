import rankedData from '../../../data/ranked.json';
import historyData from '../../../data/tool-of-the-day.json';
import type { Tool } from './tools';
import { classifyTool } from './content-gen';
import { toSlug } from './tools';

export interface TotdResult {
  tool: Tool;
  date: string;
  slug: string;
}

export function getToolOfTheDay(): TotdResult {
  const history = historyData as Record<string, string>;
  // Build date determines the TOTD (static site)
  const today = new Date().toISOString().slice(0, 10);

  let featuredName = history[today];

  if (!featuredName) {
    // Auto-select: highest ranked not in last 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFeatured = new Set(
      Object.entries(history)
        .filter(([date]) => new Date(date) >= thirtyDaysAgo)
        .map(([, name]) => name)
    );
    const raw = rankedData as Tool[];
    const candidate = raw.find(
      (t) => !t.is_archived && t.description && !recentFeatured.has(t.full_name)
    );
    featuredName = candidate?.full_name ?? (raw[0]?.full_name as string);
  }

  const tools = (rankedData as Tool[]).map((t) => ({ ...t, category: classifyTool(t) }));
  const tool = tools.find((t) => t.full_name === featuredName) ?? tools[0];

  return { tool, date: today, slug: toSlug(tool.full_name) };
}
