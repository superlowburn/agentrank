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
      SELECT full_name, sponsor_tier FROM tools WHERE sponsored=1 ORDER BY rank ASC
    `).all() as { results: Array<{ full_name: string; sponsor_tier: string | null }> };

    return json({ sponsored: result.results ?? [] });
  } catch (err) {
    console.error('[sponsored api] DB error:', err);
    return json({ sponsored: [] });
  }
};
