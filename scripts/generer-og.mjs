// Génère favicons et images Open Graph à partir du logo et des polices de la
// charte, sans navigateur : favicons aux tailles utiles, image par défaut, une
// image par produit publié et une par article publié. Rejouer avec
// `npm run generer-images` après un changement de logo, de charte, de produit
// ou d'article. Les fichiers produits sont commités.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import { lireFrontmatter } from './blog-frontmatter.mjs';

const racine = new URL('../', import.meta.url);
const chemin = (relatif) => fileURLToPath(new URL(relatif, racine));

const COULEURS = {
  papier: '#faf8f4',
  encre: '#0f2445',
  encre2: '#4a566e',
  cobalt: '#1b4a8c',
  ambre: '#b8460a',
  braise: '#e0480a',
  blanc: '#ffffff',
  ligne: '#e2ddd2',
};

const polices = [
  {
    name: 'Bricolage Grotesque',
    data: await readFile(chemin('node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff')),
    weight: 700,
    style: 'normal',
  },
  {
    name: 'Source Sans 3',
    data: await readFile(chemin('node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff')),
    weight: 400,
    style: 'normal',
  },
];

const el = (type, style, children) => ({ type, props: { style, children } });

/** Logo de la marque, réduit pour les images de partage, en URI de données. */
const LOGO = chemin('src/assets/marque/bresnik-logo.png');
const logoReduit = await sharp(LOGO).resize(320, 320).png().toBuffer();
const logoDonnees = `data:image/png;base64,${logoReduit.toString('base64')}`;
const logoImg = (taille) => ({ type: 'img', props: { src: logoDonnees, width: taille, height: taille, style: { width: taille, height: taille } } });

function motSymbole(taille) {
  return el('div', { display: 'flex', alignItems: 'center', gap: taille * 0.22 }, [
    logoImg(Math.round(taille * 0.95)),
    el('div', { display: 'flex', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: taille, letterSpacing: -taille * 0.025, color: COULEURS.encre, lineHeight: 1 }, [
      el('span', {}, 'Bresni'),
      el('span', { color: COULEURS.braise }, 'k'),
    ]),
  ]);
}

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
    background: COULEURS.papier,
    fontFamily: 'Source Sans 3',
  },
  [
    el('div', { display: 'flex', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', color: COULEURS.ambre }, 'Logiciels pour l’écosystème Sage 100'),
    motSymbole(148),
    el('div', { display: 'flex', fontSize: 40, color: COULEURS.encre2, lineHeight: 1.3 }, 'Des logiciels qui complètent Sage 100, conçus par un consultant Sage.'),
    el('div', { display: 'flex', width: 120, height: 8, background: COULEURS.cobalt, borderRadius: 4, marginTop: 12 }, ''),
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
    { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 96px', background: COULEURS.papier, fontFamily: 'Source Sans 3' },
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

async function svgDepuis(arbre, largeur, hauteur) {
  return satori(arbre, { width: largeur, height: hauteur, fonts: polices });
}

function pngDepuis(svg, largeur) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: largeur } }).render().asPng();
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
  const svg = await svgDepuis(arbrePage(page), 1200, 630);
  await writeFile(chemin(sortie), pngDepuis(svg, 1200));
}

await mkdir(chemin('public/og/produits'), { recursive: true });
await mkdir(chemin('public/og/blog'), { recursive: true });

const svgOg = await svgDepuis(arbreOg, 1200, 630);
await writeFile(chemin('public/og-default.png'), pngDepuis(svgOg, 1200));

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
