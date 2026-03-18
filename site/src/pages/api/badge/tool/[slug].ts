import type { APIRoute } from 'astro';
import { generateBadgeSvg } from '../../../../data/badge';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug!;
  const fullName = slug.replace('--', '/');
  const { env } = (locals as any).runtime;

  const row = await env.DB.prepare('SELECT score FROM tools WHERE full_name = ?')
    .bind(fullName)
    .first();

  const score = row ? (row.score as number) : null;

  return new Response(generateBadgeSvg(score), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 's-maxage=3600, max-age=600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
