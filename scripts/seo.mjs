// Contrôle du référencement sur le site construit : titres et descriptions
// dans les bornes, canonical exact, `noindex` là où il est attendu et nulle
// part ailleurs. Lancé par `scripts/verifier-seo.mjs`.
import { readFileSync } from 'node:fs';
import { listerPages } from './csp.mjs';

export const TITRE_MAX = 60;
export const DESCRIPTION = { min: 100, max: 160 };

/** Chemins qui doivent porter `noindex` (pages techniques, brouillons, remerciement). */
export const NOINDEX_ATTENDUS = ['/404.html', '/charte/', '/erreur/', '/maintenance/', '/gabarits/application/', '/gabarits/connexion/', '/contact/merci/'];

const decoder = (t) => t.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

export function analyserPage(html) {
  return {
    titre: decoder(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''),
    description: decoder(html.match(/name="description" content="([^"]*)"/)?.[1] ?? ''),
    canonical: decoder(html.match(/rel="canonical" href="([^"]*)"/)?.[1] ?? ''),
    noindex: /name="robots" content="noindex"/.test(html),
    jsonld: (html.match(/application\/ld\+json/g) ?? []).length,
  };
}

/** Problèmes d'une page ; `chemin` est son chemin public (« /produits/bocs/ » ou « /404.html »). */
export function verifierPage(html, chemin, site, noindexAttendus = NOINDEX_ATTENDUS) {
  const page = analyserPage(html);
  const problemes = [];
  const doitEtreNoindex = noindexAttendus.includes(chemin) || chemin.startsWith('/blog/tags/');
  if (!page.titre) problemes.push('titre absent');
  if (!page.description) problemes.push('description absente');
  // La page 404 est servie comme fichier mais Astro la canonise en dossier.
  const cheminCanonique = chemin === '/404.html' ? '/404/' : chemin;
  if (!page.canonical) problemes.push('canonical absent');
  else if (page.canonical !== `${site.replace(/\/$/, '')}${cheminCanonique}`) problemes.push(`canonical inattendu : ${page.canonical}`);
  if (doitEtreNoindex && !page.noindex && !chemin.startsWith('/blog/tags/')) problemes.push('noindex attendu');
  if (!doitEtreNoindex && page.noindex && !chemin.startsWith('/blog/')) problemes.push('noindex inattendu');
  if (!page.noindex && !doitEtreNoindex) {
    if (page.titre.length > TITRE_MAX) problemes.push(`titre trop long (${page.titre.length})`);
    if (page.description.length < DESCRIPTION.min || page.description.length > DESCRIPTION.max) problemes.push(`description hors bornes (${page.description.length})`);
  }
  return problemes;
}

export function cheminPublic(fichier, dist) {
  const relatif = fichier.slice(dist.length).replace(/\\/g, '/');
  return relatif.endsWith('/index.html') ? relatif.slice(0, -'index.html'.length) : relatif;
}

/** Site déduit du canonical de l'accueil. */
export function siteDepuisAccueil(dist) {
  const accueil = analyserPage(readFileSync(`${dist}/index.html`, 'utf8'));
  return accueil.canonical.replace(/\/$/, '');
}

export function verifierDossier(dist) {
  const site = siteDepuisAccueil(dist);
  const lignes = [];
  let total = 0;
  for (const fichier of listerPages(dist)) {
    const html = readFileSync(fichier, 'utf8');
    const chemin = cheminPublic(fichier, dist);
    const page = analyserPage(html);
    const problemes = verifierPage(html, chemin, site);
    total += problemes.length;
    lignes.push(
      `${chemin.padEnd(26)} titre ${String(page.titre.length).padStart(2)} | description ${String(page.description.length).padStart(3)} | ld+json ${page.jsonld}${page.noindex ? ' | noindex' : ''}${problemes.length ? ' ⚠ ' + problemes.join(' ; ') : ''}`,
    );
  }
  lignes.push(total === 0 ? `SEO : ${lignes.length} page(s), aucun problème.` : `SEO : ${total} problème(s).`);
  return { lignes, total };
}
