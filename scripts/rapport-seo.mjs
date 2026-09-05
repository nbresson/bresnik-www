// Rapport des titres et descriptions du site construit, avec leurs longueurs.
// Usage : npm run build && node scripts/rapport-seo.mjs
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listerPages } from './csp.mjs';

const dist = join(process.cwd(), 'dist');
const decoder = (t) => t.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
for (const page of listerPages(dist)) {
  const html = readFileSync(page, 'utf8');
  const titre = decoder(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const description = decoder(html.match(/name="description" content="([^"]*)"/)?.[1] ?? '');
  const noindex = /name="robots" content="noindex"/.test(html);
  const ld = (html.match(/application\/ld\+json/g) ?? []).length;
  const chemin = page.slice(dist.length).replace(/\\/g, '/').replace(/index\.html$/, '');
  const alerte = (!noindex && (titre.length > 60 || description.length < 100 || description.length > 160)) ? ' ⚠' : '';
  console.log(`${chemin.padEnd(28)} titre ${String(titre.length).padStart(2)} | description ${String(description.length).padStart(3)} | ld+json ${ld}${noindex ? ' | noindex' : ''}${alerte}`);
}
