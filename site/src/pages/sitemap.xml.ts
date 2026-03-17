import type { APIRoute } from 'astro';

export const prerender = false;

const SITE = 'https://agentrank-ai.com';

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily' },
  { path: '/tools/', changefreq: 'daily' },
  { path: '/movers/', changefreq: 'daily' },
  { path: '/agents/', changefreq: 'weekly' },
  { path: '/submit/', changefreq: 'weekly' },
  { path: '/api-docs/', changefreq: 'weekly' },
  { path: '/blog/', changefreq: 'weekly' },
  { path: '/category/', changefreq: 'weekly' },
];

// Auto-discover blog posts at build time via Vite glob
const blogGlob = import.meta.glob('./blog/*.astro');
const BLOG_POSTS = Object.keys(blogGlob)
  .map((p) => p.replace('./blog/', '').replace('.astro', ''))
  .filter((slug) => slug !== 'index')
  .map((slug) => ({ path: `/blog/${slug}/`, changefreq: 'weekly' as const }));

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ locals }) => {
  const { env } = (locals as any).runtime;
  const db = env.DB;

  const [toolRows, skillRows, categoryRows] = await Promise.all([
    db.prepare('SELECT full_name FROM tools WHERE score IS NOT NULL').all(),
    db.prepare('SELECT slug FROM skills WHERE score IS NOT NULL').all(),
    db.prepare('SELECT DISTINCT category FROM tools WHERE category IS NOT NULL AND score IS NOT NULL UNION SELECT DISTINCT category FROM skills WHERE category IS NOT NULL AND score IS NOT NULL').all(),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  let urls = '';

  for (const page of [...STATIC_PAGES, ...BLOG_POSTS]) {
    urls += `  <url>
    <loc>${SITE}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
  </url>\n`;
  }

  for (const row of toolRows.results as { full_name: string }[]) {
    const slug = row.full_name.replace('/', '--');
    urls += `  <url>
    <loc>${SITE}/tool/${escapeXml(slug)}/</loc>
    <changefreq>weekly</changefreq>
  </url>\n`;
  }

  for (const row of skillRows.results as { slug: string }[]) {
    const slug = row.slug.replace(/\//g, '--').replace(/:/g, '-');
    urls += `  <url>
    <loc>${SITE}/skill/${escapeXml(slug)}/</loc>
    <changefreq>weekly</changefreq>
  </url>\n`;
  }

  for (const row of categoryRows.results as { category: string }[]) {
    urls += `  <url>
    <loc>${SITE}/category/${escapeXml(row.category)}/</loc>
    <changefreq>weekly</changefreq>
  </url>\n`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, max-age=3600',
    },
  });
};
