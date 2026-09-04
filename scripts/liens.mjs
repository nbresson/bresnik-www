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
    for (const lien of extraireLiens(html).filter(estInterne)) {
      const candidats = cheminsCandidats(lien);
      let trouve = false;
      for (const candidat of candidats) {
        if (await existe(join(dossier, ...candidat.split('/')))) {
          trouve = true;
          break;
        }
      }
      if (!trouve) casses.push({ fichier: relative(dossier, fichier).split(sep).join('/'), lien });
    }
  }
  return casses;
}
