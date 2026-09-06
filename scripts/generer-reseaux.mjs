// Vignettes pour les réseaux sociaux (LinkedIn, Facebook) : avatars,
// couvertures et visuels de publication, en plusieurs variantes de fond.
// Écrit les fichiers dans public/reseaux/ et le manifeste src/data/reseaux.json
// que la charte affiche. Lancé par `npm run generer-images`.
import { writeFile, mkdir } from 'node:fs/promises';
import { COULEURS, chemin, el, imageEnDonnees, logoImg, motSymbole, rendrePng } from './marque.mjs';

const PROMESSE = 'Faites faire à Sage 100 ce qu’il ne fait pas.';
const PRODUITS = 'BankBridge · FEC Analyzer · MajTarifPQ · LinkCsvSage · BOCS';
const SOUS_TITRE = 'Logiciels et conseil pour Sage 100, par un consultant avec plus de 12 ans d’expérience.';

const tuileGrille = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><circle cx="14" cy="14" r="1.8" fill="${COULEURS.ligne}"/></svg>`).toString('base64')}`;

const captures = {
  bankbridge: await imageEnDonnees(chemin('src/content/produits/captures/bankbridge/tableau-de-bord.png'), 1600),
  bocs: await imageEnDonnees(chemin('src/content/produits/captures/bocs/demarrer.png'), 1600),
};

/**
 * Fonds. Chacun renvoie { couche, texte, secondaire, filet } : la couche est
 * un élément absolu qui couvre toute la surface, les couleurs servent au texte.
 */
const FONDS = {
  papier: {
    libelle: 'Papier',
    couche: () => el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COULEURS.papier }, ''),
    texte: COULEURS.encre, secondaire: COULEURS.encre2, filet: COULEURS.cobalt, marque: COULEURS.encre,
  },
  marine: {
    libelle: 'Marine',
    couche: () => el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(160deg, ${COULEURS.marineHaut} 0%, ${COULEURS.marineBas} 100%)` }, ''),
    texte: COULEURS.blanc, secondaire: COULEURS.encreClaire, filet: COULEURS.flamme, marque: COULEURS.blanc,
  },
  ruban: {
    libelle: 'Ruban',
    couche: (l, h) => el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', backgroundImage: `linear-gradient(160deg, ${COULEURS.marineHaut} 0%, ${COULEURS.marineBas} 100%)` }, [
      el('div', { position: 'absolute', right: -h * 0.4, top: -h * 0.6, width: l * 0.42, height: h * 2.2, transform: 'rotate(18deg)', backgroundImage: `linear-gradient(180deg, ${COULEURS.flamme} 0%, ${COULEURS.rouge} 100%)`, borderRadius: h * 0.3 }, ''),
    ]),
    texte: COULEURS.blanc, secondaire: COULEURS.encreClaire, filet: COULEURS.flamme, marque: COULEURS.blanc,
  },
  grille: {
    libelle: 'Grille technique',
    couche: () => el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COULEURS.papier, backgroundImage: `url(${tuileGrille})`, backgroundRepeat: 'repeat', backgroundSize: '28px 28px' }, ''),
    texte: COULEURS.encre, secondaire: COULEURS.encre2, filet: COULEURS.cobalt, marque: COULEURS.encre,
  },
  capture: {
    libelle: 'Capture BankBridge',
    couche: (l, h) => el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', backgroundColor: COULEURS.marineBas }, [
      { type: 'img', props: { src: captures.bankbridge, style: { position: 'absolute', right: 0, top: 0, height: h, width: l * 0.62, objectFit: 'cover', objectPosition: 'left top' } } },
      el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(90deg, ${COULEURS.marineBas} 0%, ${COULEURS.marineBas} 42%, rgba(6,32,69,0.85) 58%, rgba(6,32,69,0.25) 100%)` }, ''),
    ]),
    texte: COULEURS.blanc, secondaire: COULEURS.encreClaire, filet: COULEURS.flamme, marque: COULEURS.blanc,
  },
  'capture-bocs': {
    libelle: 'Capture BOCS',
    couche: (l, h) => el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', backgroundColor: COULEURS.marineBas }, [
      { type: 'img', props: { src: captures.bocs, style: { position: 'absolute', right: 0, top: 0, height: h, width: l * 0.62, objectFit: 'cover', objectPosition: 'left top' } } },
      el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(90deg, ${COULEURS.marineBas} 0%, ${COULEURS.marineBas} 42%, rgba(6,32,69,0.85) 58%, rgba(6,32,69,0.25) 100%)` }, ''),
    ]),
    texte: COULEURS.blanc, secondaire: COULEURS.encreClaire, filet: COULEURS.flamme, marque: COULEURS.blanc,
  },
  filigrane: {
    libelle: 'Logo en filigrane',
    couche: (l, h) => el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', backgroundImage: `linear-gradient(160deg, ${COULEURS.marineHaut} 0%, ${COULEURS.marineBas} 100%)` }, [
      logoImg(h * 1.6, { position: 'absolute', right: -h * 0.35, top: -h * 0.3, opacity: 0.18 }),
    ]),
    texte: COULEURS.blanc, secondaire: COULEURS.encreClaire, filet: COULEURS.flamme, marque: COULEURS.blanc,
  },
  duo: {
    libelle: 'Papier et marine',
    couche: (l) => el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', backgroundColor: COULEURS.papier }, [
      el('div', { position: 'absolute', right: 0, top: 0, bottom: 0, width: l * 0.34, backgroundImage: `linear-gradient(160deg, ${COULEURS.marineHaut} 0%, ${COULEURS.marineBas} 100%)` }, ''),
      el('div', { position: 'absolute', right: l * 0.34 - 6, top: 0, bottom: 0, width: 12, backgroundImage: `linear-gradient(180deg, ${COULEURS.flamme} 0%, ${COULEURS.rouge} 100%)` }, ''),
    ]),
    texte: COULEURS.encre, secondaire: COULEURS.encre2, filet: COULEURS.cobalt, marque: COULEURS.encre,
  },
  flamme: {
    libelle: 'Flamme',
    couche: () => el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(135deg, ${COULEURS.flamme} 0%, ${COULEURS.rouge} 100%)` }, ''),
    texte: COULEURS.blanc, secondaire: '#ffe4d1', filet: COULEURS.blanc, marque: COULEURS.blanc,
  },
};

/** Couverture (LinkedIn 1584 × 396, Facebook 820 × 312) : promesse à gauche, marque et produits. */
function arbreCouverture(fond, l, h) {
  const marge = Math.round(h * 0.16);
  const tailleTitre = Math.round(h * 0.16);
  const zoneTexte = fond.libelle.startsWith('Capture') || fond.libelle === 'Papier et marine' ? 0.6 : 0.78;
  return el('div', { width: l, height: h, display: 'flex', position: 'relative', fontFamily: 'Source Sans 3', overflow: 'hidden' }, [
    fond.couche(l, h),
    el('div', { position: 'absolute', left: marge, top: marge, bottom: marge, width: l * zoneTexte - marge, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }, [
      motSymbole(Math.round(h * 0.15), fond.marque),
      el('div', { display: 'flex', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: tailleTitre, letterSpacing: -tailleTitre * 0.025, lineHeight: 1.05, color: fond.texte }, PROMESSE),
      el('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
        el('div', { display: 'flex', width: Math.round(h * 0.12), height: 4, background: fond.filet, borderRadius: 2 }, ''),
        el('div', { display: 'flex', fontSize: Math.round(h * 0.075), color: fond.secondaire }, PRODUITS),
      ]),
    ]),
  ]);
}

/** Avatar carré : le logo sur un fond, marges généreuses (les réseaux rognent en cercle). */
function arbreAvatar(fond, taille) {
  return el('div', { width: taille, height: taille, display: 'flex', position: 'relative', overflow: 'hidden' }, [
    fond.couche(taille, taille),
    el('div', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }, [logoImg(Math.round(taille * 0.6))]),
  ]);
}

/** Visuel de publication 1200 × 630 : marque, promesse, sous-titre. */
function arbrePublication(fond, l, h) {
  return el('div', { width: l, height: h, display: 'flex', position: 'relative', fontFamily: 'Source Sans 3', overflow: 'hidden' }, [
    fond.couche(l, h),
    el('div', { position: 'absolute', left: 96, top: 80, bottom: 80, width: 700, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }, [
      motSymbole(64, fond.marque),
      el('div', { display: 'flex', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 68, letterSpacing: -1.7, lineHeight: 1.05, color: fond.texte }, PROMESSE),
      el('div', { display: 'flex', fontSize: 30, lineHeight: 1.35, color: fond.secondaire }, SOUS_TITRE),
    ]),
  ]);
}

const FORMATS = [
  { id: 'linkedin-couverture', libelle: 'Couverture LinkedIn (profil)', largeur: 1584, hauteur: 396, arbre: arbreCouverture },
  { id: 'facebook-couverture', libelle: 'Couverture Facebook (page)', largeur: 820, hauteur: 312, arbre: arbreCouverture },
  { id: 'publication', libelle: 'Visuel de publication', largeur: 1200, hauteur: 630, arbre: arbrePublication },
  { id: 'avatar', libelle: 'Avatar (profil et page)', largeur: 400, hauteur: 400, arbre: arbreAvatar, fonds: ['papier', 'marine', 'ruban', 'grille', 'flamme'] },
];

await mkdir(chemin('public/reseaux'), { recursive: true });
await mkdir(chemin('src/data'), { recursive: true });
const manifeste = [];
for (const format of FORMATS) {
  for (const cle of format.fonds ?? Object.keys(FONDS)) {
    const fond = FONDS[cle];
    const fichier = `${format.id}-${cle}.png`;
    const arbre = format.id === 'avatar' ? format.arbre(fond, format.largeur) : format.arbre(fond, format.largeur, format.hauteur);
    await writeFile(chemin(`public/reseaux/${fichier}`), await rendrePng(arbre, format.largeur, format.hauteur));
    manifeste.push({ format: format.id, libelle: format.libelle, fond: cle, fondLibelle: fond.libelle, fichier: `/reseaux/${fichier}`, largeur: format.largeur, hauteur: format.hauteur });
  }
}
await writeFile(chemin('src/data/reseaux.json'), JSON.stringify(manifeste, null, 2) + '\n');
console.log(`Vignettes réseaux : ${manifeste.length} fichiers dans public/reseaux/.`);
