// Briques partagées des scripts d'images : couleurs de la charte, polices,
// logo, mot-symbole, rendu SVG → PNG. Utilisées par generer-og.mjs et
// generer-reseaux.mjs.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const racine = new URL('../', import.meta.url);
export const chemin = (relatif) => fileURLToPath(new URL(relatif, racine));

/** Couleurs de la palette claire (src/lib/palettes.ts) et du logo. */
export const COULEURS = {
  papier: '#faf8f4',
  papier2: '#f1ede4',
  encre: '#0f2445',
  encre2: '#4a566e',
  cobalt: '#1b4a8c',
  cobaltFonce: '#133868',
  cobaltTeinte: '#e6ecf7',
  ambre: '#b8460a',
  flamme: '#f87800',
  braise: '#e0480a',
  rouge: '#f84808',
  marineHaut: '#133868',
  marineBas: '#062045',
  blanc: '#ffffff',
  ligne: '#e2ddd2',
  encreClaire: '#c2cbdd',
};

export const polices = [
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

export const el = (type, style, children) => ({ type, props: { style, children } });

/** Logo de la marque, réduit, en URI de données. */
export const LOGO = chemin('src/assets/marque/bresnik-logo.png');
const logoReduit = await sharp(LOGO).resize(320, 320).png().toBuffer();
export const logoDonnees = `data:image/png;base64,${logoReduit.toString('base64')}`;
export const logoImg = (taille, style = {}) => ({ type: 'img', props: { src: logoDonnees, width: taille, height: taille, style: { width: taille, height: taille, ...style } } });

/** Mot-symbole « Bresnik » précédé du logo ; `couleur` du texte, le « k » toujours en braise. */
export function motSymbole(taille, couleur = COULEURS.encre) {
  return el('div', { display: 'flex', alignItems: 'center', gap: taille * 0.22 }, [
    logoImg(Math.round(taille * 0.95)),
    el('div', { display: 'flex', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: taille, letterSpacing: -taille * 0.025, color: couleur, lineHeight: 1 }, [
      el('span', {}, 'Bresni'),
      el('span', { color: COULEURS.braise }, 'k'),
    ]),
  ]);
}

/** Image de fichier en URI de données, redimensionnée à la largeur donnée. */
export async function imageEnDonnees(fichier, largeur) {
  const octets = await sharp(fichier).resize({ width: largeur }).png().toBuffer();
  return `data:image/png;base64,${octets.toString('base64')}`;
}

export async function svgDepuis(arbre, largeur, hauteur) {
  return satori(arbre, { width: largeur, height: hauteur, fonts: polices });
}

export function pngDepuis(svg, largeur) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: largeur } }).render().asPng();
}

export async function rendrePng(arbre, largeur, hauteur) {
  return pngDepuis(await svgDepuis(arbre, largeur, hauteur), largeur);
}
