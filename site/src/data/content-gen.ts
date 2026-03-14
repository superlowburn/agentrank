import type { Tool } from './tools';

const PERMISSIVE_LICENSES = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense'];

export function getCategoryFromQueries(matchedQueries: string[]): string {
  for (const q of matchedQueries) {
    if (q.toLowerCase().includes('mcp server') || q.toLowerCase().includes('model context protocol')) return 'MCP server';
    if (q.toLowerCase().includes('a2a agent')) return 'A2A agent';
    if (q.toLowerCase().includes('agent tool')) return 'agent tool';
    if (q.toLowerCase().includes('agent framework')) return 'agent framework';
  }
  return 'tool';
}

export function generateToolSummary(tool: {
  full_name: string;
  description: string | null;
  language: string | null;
  license: string | null;
  matched_queries: string[];
  github_topics?: string[];
}): string {
  const category = getCategoryFromQueries(tool.matched_queries);
  const lang = tool.language ? `${tool.language} ` : '';
  const lic = tool.license && tool.license !== 'NOASSERTION' ? ` licensed under ${tool.license}` : '';

  let summary = `${tool.full_name} is a ${lang}${category}${lic}.`;

  if (tool.description) {
    summary += ` ${tool.description}`;
  }

  const topics = tool.github_topics || [];
  if (topics.length > 0) {
    summary += ` Topics: ${topics.join(', ')}.`;
  }

  return summary;
}

export function generateSkillSummary(skill: {
  name: string;
  description: string | null;
  source: string;
  author: string | null;
  platforms: string[];
}): string {
  const sourceLabel = skill.source === 'skills.sh' ? 'skills.sh' : skill.source === 'glama' ? 'Glama' : skill.source === 'clawhub' ? 'ClawHub' : skill.source;
  const authorPart = skill.author ? ` by ${skill.author}` : '';

  let summary = `${skill.name} is a ${sourceLabel} skill${authorPart}.`;

  if (skill.description) {
    summary += ` ${skill.description}`;
  }

  if (skill.platforms.length > 0) {
    const top3 = skill.platforms.slice(0, 3).join(', ');
    const extra = skill.platforms.length > 3 ? ` and ${skill.platforms.length - 3} more` : '';
    summary += ` Available on ${skill.platforms.length} platform${skill.platforms.length !== 1 ? 's' : ''} including ${top3}${extra}.`;
  }

  return summary;
}

export function generateContextSentences(item: {
  rank: number;
  score: number;
  stars?: number;
  dependents?: number;
  contributors?: number;
  last_commit_at?: string;
}, totalCount: number): string[] {
  const sentences: string[] = [];

  sentences.push(`Ranked #${item.rank} out of ${totalCount} indexed ${item.stars !== undefined ? 'tools' : 'skills'}.`);

  const topPercent = Math.ceil((item.rank / totalCount) * 100);
  if (topPercent <= 10) {
    sentences.push(`In the top ${topPercent}% of all indexed ${item.stars !== undefined ? 'tools' : 'skills'}.`);
  }

  if (item.stars !== undefined && item.stars >= 1000) {
    sentences.push(`Has ${item.stars.toLocaleString('en-US')} GitHub stars.`);
  }

  if (item.dependents !== undefined && item.dependents >= 10) {
    sentences.push(`Used by ${item.dependents.toLocaleString('en-US')} other projects.`);
  }

  if (item.contributors !== undefined && item.contributors >= 10) {
    sentences.push(`Has ${item.contributors} contributors.`);
  }

  if (item.last_commit_at) {
    const days = Math.floor((Date.now() - new Date(item.last_commit_at).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) {
      sentences.push('Actively maintained with commits in the last week.');
    }
  }

  return sentences;
}

export function getLicenseClass(license: string | null): 'permissive' | 'copyleft' | 'missing' {
  if (!license || license === 'NOASSERTION') return 'missing';
  if (PERMISSIVE_LICENSES.includes(license)) return 'permissive';
  return 'copyleft';
}

export function generateToolJsonLd(tool: {
  full_name: string;
  url: string;
  description: string | null;
  language: string | null;
  license: string | null;
  score: number;
  last_commit_at: string;
  matched_queries: string[];
  github_topics?: string[];
}, pageUrl: string): object {
  const topics = tool.github_topics || [];
  const keywords = [...new Set([...tool.matched_queries, ...topics])];

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.full_name,
    description: tool.description || `Agent tool: ${tool.full_name}`,
    url: pageUrl,
    codeRepository: tool.url,
    programmingLanguage: tool.language || undefined,
    license: tool.license || undefined,
    dateModified: tool.last_commit_at,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tool.score.toFixed(1),
      bestRating: '100',
      worstRating: '0',
      ratingCount: 1,
    },
  };
}

export function generateSkillJsonLd(skill: {
  name: string;
  slug: string;
  description: string | null;
  source: string;
  author: string | null;
  score: number;
  platforms: string[];
}, pageUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: skill.name,
    description: skill.description || `AI skill: ${skill.name}`,
    url: pageUrl,
    author: skill.author ? { '@type': 'Person', name: skill.author } : undefined,
    applicationCategory: 'AI Agent Skill',
    operatingSystem: skill.platforms.join(', ') || undefined,
    keywords: `${skill.source}, AI skill, agent skill`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: skill.score.toFixed(1),
      bestRating: '100',
      worstRating: '0',
      ratingCount: 1,
    },
  };
}
