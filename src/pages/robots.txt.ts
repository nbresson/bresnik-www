import type { APIContext } from 'astro';

export function GET(context: APIContext) {
  const sitemap = new URL('/sitemap-index.xml', context.site);
  const contenu = ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${sitemap.href}`, ''].join('\n');
  return new Response(contenu, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
