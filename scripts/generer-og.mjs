// Génère favicons et images Open Graph à partir du logo et des polices de la
// charte, sans navigateur : favicons aux tailles utiles, image par défaut, une
// image par produit publié et une par article publié. Rejouer avec
// `npm run generer-images` après un changement de logo, de charte, de produit
// ou d'article. Les fichiers produits sont commités.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { lireFrontmatter } from './blog-frontmatter.mjs';
import { COULEURS, LOGO, chemin, el, motSymbole, rendrePng } from './marque.mjs';

const arbreOg = el(
  'div',
  {
    width: 1200,
    height: 630,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 28,
    padding: '0 96px',
    backgroundColor: COULEURS.papier,
    fontFamily: 'Source Sans 3',
  },
  [
    el('div', { display: 'flex', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', color: COULEURS.ambre }, 'Logiciels pour l’écosystème Sage 100'),
    motSymbole(148),
    el('div', { display: 'flex', fontSize: 40, color: COULEURS.encre2, lineHeight: 1.3 }, 'Des logiciels qui complètent Sage 100, conçus par un consultant Sage.'),
    el('div', { display: 'flex', width: 120, height: 8, backgroundColor: COULEURS.cobalt, borderRadius: 4, marginTop: 12 }, ''),
  ],
);

/** Image de partage d'une page : surtitre, titre (avec logo facultatif), sous-titre, marque en pied. */
function arbrePage({ eyebrow, titre, sousTitre, logo }) {
  const tailleTitre = titre.length > 24 ? 64 : 92;
  const ligneTitre = el('div', { display: 'flex', alignItems: 'center', gap: 32 }, [
    ...(logo ? [{ type: 'img', props: { src: logo, width: 120, height: 120, style: { width: 120, height: 120, borderRadius: 24 } } }] : []),
    el('div', { display: 'flex', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: tailleTitre, letterSpacing: -tailleTitre * 0.025, color: COULEURS.encre, lineHeight: 1.05 }, titre),
  ]);
  return el(
    'div',
    { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 96px', backgroundColor: COULEURS.papier, fontFamily: 'Source Sans 3' },
    [
      el('div', { display: 'flex', flexDirection: 'column', gap: 28 }, [
        el('div', { display: 'flex', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', color: COULEURS.ambre }, eyebrow),
        ligneTitre,
        el('div', { display: 'flex', fontSize: 38, color: COULEURS.encre2, lineHeight: 1.3 }, sousTitre),
      ]),
      el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid ${COULEURS.ligne}`, paddingTop: 28 }, [
        motSymbole(48),
        el('div', { display: 'flex', fontSize: 24, color: COULEURS.encre2 }, 'Logiciels et conseil pour Sage 100'),
      ]),
    ],
  );
}

/** Logo d'un produit en URI de données, ou null (SVG et PNG acceptés par satori). */
async function logoEnDonnees(relatif) {
  if (!relatif) return null;
  try {
    const fichier = chemin(`src/content/produits/${relatif.replace(/^\.\//, '')}`);
    const octets = await readFile(fichier);
    const type = relatif.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    return `data:${type};base64,${octets.toString('base64')}`;
  } catch {
    return null;
  }
}

async function genererPage(sortie, page) {
  await writeFile(chemin(sortie), await rendrePng(arbrePage(page), 1200, 630));
}

await mkdir(chemin('public/og/produits'), { recursive: true });
await mkdir(chemin('public/og/blog'), { recursive: true });

const ogDefaut = await rendrePng(arbreOg, 1200, 630);
await writeFile(chemin('public/og-default.png'), ogDefaut);
// Copie servant d'exemple de capture sur la charte (galerie, carrousel) : toujours la même image que le partage.
await writeFile(chemin('src/assets/exemple-capture.png'), ogDefaut);

// Favicons : le logo réduit ; l'icône Apple est aplatie sur le fond papier (iOS n'aime pas la transparence).
for (const taille of [32, 192, 512]) {
  await writeFile(chemin(`public/favicon-${taille}.png`), await sharp(LOGO).resize(taille, taille).png().toBuffer());
}
await writeFile(chemin('public/apple-touch-icon.png'), await sharp(LOGO).resize(180, 180).flatten({ background: COULEURS.papier }).png().toBuffer());

const produits = [];
for (const nom of await readdir(chemin('src/content/produits'))) {
  if (!nom.endsWith('.md')) continue;
  const champs = lireFrontmatter(await readFile(chemin(`src/content/produits/${nom}`), 'utf8'));
  if (champs.publie === 'false') continue;
  const slug = nom.replace(/\.md$/, '');
  await genererPage(`public/og/produits/${slug}.png`, {
    eyebrow: 'Logiciel pour Sage 100',
    titre: champs.nom ?? slug,
    sousTitre: champs.sousTitre ?? '',
    logo: await logoEnDonnees(champs.logo),
  });
  produits.push(slug);
}

const articles = [];
for (const nom of await readdir(chemin('src/content/blog'))) {
  if (!nom.endsWith('.mdx') && !nom.endsWith('.md')) continue;
  const champs = lireFrontmatter(await readFile(chemin(`src/content/blog/${nom}`), 'utf8'));
  if (champs.brouillon === 'true') continue;
  const id = nom.replace(/\.mdx?$/, '');
  await genererPage(`public/og/blog/${id}.png`, { eyebrow: 'Blog', titre: champs.titre ?? id, sousTitre: champs.description ?? '' });
  articles.push(id);
}

console.log(`Images générées : favicons 32/192/512, apple-touch-icon.png, og-default.png, ${produits.length} produit(s), ${articles.length} article(s).`);
