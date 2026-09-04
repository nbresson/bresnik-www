// Génère favicon et image Open Graph à partir des polices de la charte,
// sans navigateur. Rejouer avec `npm run generer-images` après un changement
// de charte. Les fichiers produits sont commités.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const racine = new URL('../', import.meta.url);
const chemin = (relatif) => fileURLToPath(new URL(relatif, racine));

const COULEURS = {
  papier: '#faf8f4',
  encre: '#1c2331',
  encre2: '#4f5868',
  cobalt: '#1f4fc7',
  blanc: '#ffffff',
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

function motSymbole(taille) {
  return el('div', { display: 'flex', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: taille, letterSpacing: -taille * 0.025, color: COULEURS.encre, lineHeight: 1 }, [
    el('span', {}, 'Bresni'),
    el('span', { color: COULEURS.cobalt }, 'k'),
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
    el('div', { display: 'flex', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', color: COULEURS.cobalt }, 'Logiciels pour l’écosystème Sage 100'),
    motSymbole(148),
    el('div', { display: 'flex', fontSize: 40, color: COULEURS.encre2, lineHeight: 1.3 }, 'Des logiciels qui complètent Sage 100, conçus par un consultant Sage.'),
    el('div', { display: 'flex', width: 120, height: 8, background: COULEURS.cobalt, borderRadius: 4, marginTop: 12 }, ''),
  ],
);

const arbreFavicon = el(
  'div',
  {
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: COULEURS.cobalt,
    borderRadius: 12,
    fontFamily: 'Bricolage Grotesque',
    fontWeight: 700,
    fontSize: 44,
    color: COULEURS.blanc,
  },
  'B',
);

async function svgDepuis(arbre, largeur, hauteur) {
  return satori(arbre, { width: largeur, height: hauteur, fonts: polices });
}

function pngDepuis(svg, largeur) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: largeur } }).render().asPng();
}

await mkdir(chemin('public'), { recursive: true });

const svgOg = await svgDepuis(arbreOg, 1200, 630);
await writeFile(chemin('public/og-default.png'), pngDepuis(svgOg, 1200));

const svgFavicon = await svgDepuis(arbreFavicon, 64, 64);
await writeFile(chemin('public/favicon.svg'), svgFavicon);
await writeFile(chemin('public/favicon-32.png'), pngDepuis(svgFavicon, 32));
await writeFile(chemin('public/apple-touch-icon.png'), pngDepuis(svgFavicon, 180));

console.log('Images générées : og-default.png, favicon.svg, favicon-32.png, apple-touch-icon.png');
