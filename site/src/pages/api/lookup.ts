import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const { env } = (locals as any).runtime;
  const input = url.searchParams.get('url') || '';

  if (input.length > 500) {
    return json({ found: false, error: 'URL too long' });
  }

  // Parse owner/repo from GitHub URL
  const match = input.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) {
    return json({ found: false, error: 'Invalid GitHub URL' });
  }
  const repo = match[1].replace(/\.git$/, '');

  // Check skills table (github_repo column)
  const skill = await env.DB.prepare(
    'SELECT slug, name, description, score, rank FROM skills WHERE github_repo = ?'
  ).bind(repo).first();

  if (skill) {
    return json({
      found: true, type: 'skill',
      slug: skill.slug, name: skill.name,
      description: skill.description,
      score: skill.score, rank: skill.rank,
    });
  }

  // Check tools table (full_name column)
  const tool = await env.DB.prepare(
    'SELECT full_name, description, score, rank FROM tools WHERE full_name = ?'
  ).bind(repo).first();

  if (tool) {
    return json({
      found: true, type: 'tool',
      slug: tool.full_name, name: tool.full_name,
      description: tool.description,
      score: tool.score, rank: tool.rank,
    });
  }

  return json({ found: false });
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
