import type { APIRoute } from 'astro';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

export const GET: APIRoute = async ({ locals }) => {
  const { env } = (locals as any).runtime;

  try {
    const result = await env.DB.prepare(`
      SELECT
        full_name, sponsor_tier, description, score, category,
        sponsor_description, sponsor_cta_text, sponsor_cta_url
      FROM tools
      WHERE sponsored = 1
      ORDER BY
        CASE sponsor_tier
          WHEN 'sponsored_enterprise' THEN 1
          WHEN 'sponsored_pro' THEN 2
          WHEN 'sponsored_basic' THEN 3
          ELSE 4
        END ASC,
        rank ASC
    `).all() as {
      results: Array<{
        full_name: string;
        sponsor_tier: string | null;
        description: string | null;
        score: number;
        category: string | null;
        sponsor_description: string | null;
        sponsor_cta_text: string | null;
        sponsor_cta_url: string | null;
      }>;
    };

    return json({ sponsored: result.results ?? [] });
  } catch (err) {
    console.error('[sponsored api] DB error:', err);
    return json({ sponsored: [] });
  }
};
