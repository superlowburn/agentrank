import type { APIRoute } from 'astro';
import { generateBadgeSvg } from '../../../../data/badge';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug!;
  const { env } = (locals as any).runtime;

  // Try tool lookup first (slug uses -- for /)
  const fullName = slug.replace(/--/g, '/');
  let row = await env.DB.prepare('SELECT score FROM tools WHERE full_name = ?')
    .bind(fullName)
    .first();

  if (!row) {
    // Fall back to skill lookup (direct slug, then with prefix decoding)
    row = await env.DB.prepare('SELECT score FROM skills WHERE slug = ?')
      .bind(slug)
      .first();

    if (!row) {
      // Try decoding platform prefix (e.g. skills.sh-foo → skills.sh:foo)
      const decoded = slug.replace(/^(skills\.sh|glama|clawhub)-/, '$1:');
      if (decoded !== slug) {
        row = await env.DB.prepare('SELECT score FROM skills WHERE slug = ?')
          .bind(decoded)
          .first();
      }
    }
  }

  const score = row ? (row.score as number) : null;

  return new Response(generateBadgeSvg(score), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 's-maxage=3600, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
