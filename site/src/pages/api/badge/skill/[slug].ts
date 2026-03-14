import type { APIRoute } from 'astro';
import { generateBadgeSvg } from '../../../../data/badge';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug!;
  const decoded = slug.replace(/--/g, '/').replace(/^(skills\.sh|glama|clawhub)-/, '$1:');
  const { env } = (locals as any).runtime;

  let row = await env.DB.prepare('SELECT score FROM skills WHERE slug = ?')
    .bind(decoded)
    .first();

  if (!row) {
    row = await env.DB.prepare('SELECT score FROM skills WHERE slug = ?')
      .bind(slug)
      .first();
  }

  const score = row ? (row.score as number) : null;

  return new Response(generateBadgeSvg(score), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 's-maxage=86400, max-age=3600',
    },
  });
};
