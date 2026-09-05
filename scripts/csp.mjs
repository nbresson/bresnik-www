// Vérifie, sur le site construit, que la CSP de chaque page couvre ses scripts
// et styles en ligne (empreinte SHA-256 présente) et qu'aucun attribut `style`
// ne subsiste. Lancé par `scripts/verifier-csp.mjs`.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function decoderEntites(texte) {
  return texte.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

export const empreinte = (contenu) => `sha256-${createHash('sha256').update(contenu).digest('base64')}`;

/** Problèmes d'une page construite ; liste vide si tout est couvert. */
export function verifierPage(html) {
  const problemes = [];
  const meta = html.match(/<meta http-equiv="content-security-policy" content="([^"]*)"/);
  if (!meta) return ['CSP absente'];
  const csp = decoderEntites(meta[1]);
  for (const [, contenu] of html.matchAll(/<script(?![^>]*\ssrc=)(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)) {
    if (!csp.includes(empreinte(contenu))) problemes.push(`script en ligne sans empreinte : ${contenu.trim().slice(0, 40)}`);
  }
  for (const [, contenu] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    if (!csp.includes(empreinte(contenu))) problemes.push('style en ligne sans empreinte');
  }
  const attributs = (html.match(/\sstyle="/g) ?? []).length;
  if (attributs > 0) problemes.push(`${attributs} attribut(s) style`);
  return problemes;
}

export function listerPages(dossier) {
  const pages = [];
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) pages.push(...listerPages(chemin));
    else if (entree.name.endsWith('.html')) pages.push(chemin);
  }
  return pages;
}

/** Vérifie tout un dossier construit ; renvoie les lignes à afficher et le nombre de problèmes. */
export function verifierDossier(dist) {
  const lignes = [];
  let total = 0;
  const pages = listerPages(dist);
  for (const page of pages) {
    const problemes = verifierPage(readFileSync(page, 'utf8'));
    for (const probleme of problemes) lignes.push(`${page.slice(dist.length).replace(/\\/g, '/')} : ${probleme}`);
    total += problemes.length;
  }
  lignes.push(total === 0 ? `CSP : ${pages.length} page(s), scripts et styles en ligne tous couverts.` : `CSP : ${total} problème(s).`);
  return { lignes, total };
}
