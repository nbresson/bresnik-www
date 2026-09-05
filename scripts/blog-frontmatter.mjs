// Lecture minimale du frontmatter des articles, utilisable dans astro.config.mjs
// (où les collections de contenu ne sont pas disponibles) : identifiant, dates,
// état de brouillon. Sert au sitemap (dates de modification, blog vide).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Extrait `cle: valeur` en tête de fichier ; valeurs scalaires seulement. */
export function lireFrontmatter(texte) {
  const bloc = texte.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const champs = {};
  if (!bloc) return champs;
  for (const ligne of bloc[1].split(/\r?\n/)) {
    const m = ligne.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (m && m[2] !== '') champs[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return champs;
}

/** Articles publiés (brouillon absent ou faux) avec leurs dates. */
export function articlesPublies(dossier = join(process.cwd(), 'src/content/blog')) {
  const articles = [];
  for (const nom of readdirSync(dossier)) {
    if (!nom.endsWith('.mdx') && !nom.endsWith('.md')) continue;
    const champs = lireFrontmatter(readFileSync(join(dossier, nom), 'utf8'));
    if (champs.brouillon === 'true') continue;
    articles.push({
      id: nom.replace(/\.mdx?$/, ''),
      date: champs.date ? new Date(champs.date) : undefined,
      miseAJour: champs.miseAJour ? new Date(champs.miseAJour) : undefined,
    });
  }
  return articles;
}
