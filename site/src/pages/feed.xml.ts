import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { env } = (locals as any).runtime;

  const tools = await env.DB.prepare(
    `SELECT full_name, description, score, rank, last_commit_at
     FROM tools WHERE score IS NOT NULL
     ORDER BY score DESC LIMIT 20`
  ).all();

  const skills = await env.DB.prepare(
    `SELECT slug, name, description, score, rank
     FROM skills WHERE score IS NOT NULL
     ORDER BY score DESC LIMIT 20`
  ).all();

  const now = new Date().toISOString();

  const entries: string[] = [];

  for (const t of tools.results || []) {
    const name = t.full_name as string;
    const score = (t.score as number).toFixed(1);
    const desc = escapeXml((t.description as string) || 'No description');
    entries.push(`
    <entry>
      <title>#${t.rank} ${escapeXml(name)} (Score: ${score})</title>
      <link href="https://agentrank-ai.com/tool/${escapeXml(name)}/"/>
      <id>https://agentrank-ai.com/tool/${escapeXml(name)}/</id>
      <updated>${(t.last_commit_at as string) || now}</updated>
      <summary type="text">${desc} — AgentRank score: ${score}, rank #${t.rank}</summary>
    </entry>`);
  }

  for (const s of skills.results || []) {
    const slug = s.slug as string;
    const urlSlug = slug.replace(/\//g, '--').replace(/:/g, '-');
    const name = (s.name as string) || slug;
    const score = (s.score as number).toFixed(1);
    const desc = escapeXml((s.description as string) || 'No description');
    entries.push(`
    <entry>
      <title>#${s.rank} ${escapeXml(name)} (Score: ${score})</title>
      <link href="https://agentrank-ai.com/skill/${urlSlug}/"/>
      <id>https://agentrank-ai.com/skill/${urlSlug}/</id>
      <updated>${now}</updated>
      <summary type="text">${desc} — AgentRank score: ${score}, rank #${s.rank}</summary>
    </entry>`);
  }

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>AgentRank — Top MCP Servers &amp; AI Tools</title>
  <subtitle>The reputation layer for AI skills, tools &amp; agents. Ranked by real signals, updated daily.</subtitle>
  <link href="https://agentrank-ai.com"/>
  <link rel="self" href="https://agentrank-ai.com/feed.xml"/>
  <id>https://agentrank-ai.com/</id>
  <updated>${now}</updated>
  <author><name>AgentRank</name></author>
${entries.join('\n')}
</feed>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, max-age=1800',
    },
  });
};

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
