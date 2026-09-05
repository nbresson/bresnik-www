// Extraction et vérification des liens internes d'un dossier de build statique.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const MOTIF_ATTRIBUT = /\b(?:href|src)="([^"]*)"/g;
const EXCLUS = ['/api/'];

export function extraireLiens(html) {
  const liens = new Set();
  for (const correspondance of html.matchAll(MOTIF_ATTRIBUT)) {
    liens.add(correspondance[1]);
  }
  return [...liens];
}

export function estInterne(lien) {
  if (!lien.startsWith('/') || lien.startsWith('//')) return false;
  return !EXCLUS.some((prefixe) => lien.startsWith(prefixe));
}

/** Ancre d'un lien (« #contenu » → « contenu »), ou null s'il n'en a pas. */
export function ancreDe(lien) {
  const position = lien.indexOf('#');
  if (position < 0) return null;
  let ancre = lien.slice(position + 1);
  try {
    ancre = decodeURIComponent(ancre);
  } catch {}
  return ancre === '' ? null : ancre;
}

/** Vrai si le HTML déclare un élément portant cet identifiant. */
export function possedeAncre(html, ancre) {
  const echappee = ancre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\sid="${echappee}"`).test(html);
}

export function cheminsCandidats(lien) {
  const brut = lien.split('#')[0].split('?')[0];
  let sansSuffixe;
  try {
    sansSuffixe = decodeURIComponent(brut);
  } catch {
    sansSuffixe = brut;
  }
  const relatif = sansSuffixe.replace(/^\/+/, '');
  if (relatif === '') return ['index.html'];
  if (relatif.endsWith('/')) return [`${relatif}index.html`];
  const dernier = relatif.split('/').pop() ?? '';
  if (dernier.includes('.')) return [relatif];
  return [relatif, `${relatif}/index.html`, `${relatif}.html`];
}

async function listerHtml(dossier) {
  const resultat = [];
  for (const entree of await readdir(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) resultat.push(...(await listerHtml(chemin)));
    else if (entree.name.endsWith('.html')) resultat.push(chemin);
  }
  return resultat;
}

async function existe(chemin) {
  try {
    return (await stat(chemin)).isFile();
  } catch {
    return false;
  }
}

export async function verifierDist(dossier) {
  const casses = [];
  for (const fichier of await listerHtml(dossier)) {
    const html = await readFile(fichier, 'utf8');
    const nomFichier = relative(dossier, fichier).split(sep).join('/');
    for (const lien of extraireLiens(html)) {
      // Ancre vers la page elle-même.
      if (lien.startsWith('#')) {
        const ancre = ancreDe(lien);
        if (ancre && !possedeAncre(html, ancre)) casses.push({ fichier: nomFichier, lien });
        continue;
      }
      if (!estInterne(lien)) continue;
      let cible = null;
      for (const candidat of cheminsCandidats(lien)) {
        const chemin = join(dossier, ...candidat.split('/'));
        if (await existe(chemin)) {
          cible = chemin;
          break;
        }
      }
      if (!cible) {
        casses.push({ fichier: nomFichier, lien });
        continue;
      }
      // Ancre vers une autre page : l'identifiant doit exister dans la page cible.
      const ancre = ancreDe(lien);
      if (ancre && cible.endsWith('.html') && !possedeAncre(await readFile(cible, 'utf8'), ancre)) casses.push({ fichier: nomFichier, lien });
    }
  }
  return casses;
}
