/**
 * Glyphes métier : les pictogrammes qui illustrent domaines, fonctionnalités
 * et lignes techniques. La liste borne ce que le contenu peut demander.
 */

export const GLYPHES = [
  'banque', 'rapprochement', 'fichier-controle', 'bouclier', 'etiquette-prix', 'export-fichier', 'boite-outils', 'base-donnees',
  'prise', 'migration', 'rapport', 'livre-comptes', 'colis', 'courrier', 'rss', 'consultant',
] as const;

/** Icônes acceptées pour illustrer une fonctionnalité : les glyphes métier et quelques icônes génériques du jeu. */
export const ICONES_FONCTIONNALITE = [...GLYPHES, 'tendance-haut', 'recherche', 'document', 'ecran', 'parametres', 'calendrier', 'coche'] as const;

export type Glyphe = (typeof GLYPHES)[number];
export type IconeFonctionnalite = (typeof ICONES_FONCTIONNALITE)[number];

export interface Fonctionnalite {
  titre: string;
  icone: IconeFonctionnalite;
}

/** Une fonctionnalité peut être écrite comme une simple chaîne (coche) ou avec son icône. */
export function normaliserFonctionnalites(entrees: (string | { titre: string; icone?: IconeFonctionnalite })[]): Fonctionnalite[] {
  return entrees.map((entree) => (typeof entree === 'string' ? { titre: entree, icone: 'coche' } : { titre: entree.titre, icone: entree.icone ?? 'coche' }));
}

/** Glyphe d'un ensemble de modules Sage : comptabilité, gestion commerciale, ou générique. */
export function glypheModules(modules: string[]): Glyphe | 'document' {
  if (modules.length === 0) return 'document';
  const compta = modules.every((m) => /comptabilit/i.test(m));
  const commerce = modules.every((m) => /gestion commerciale/i.test(m));
  if (compta) return 'livre-comptes';
  if (commerce) return 'colis';
  return 'document';
}

/** Glyphe du mode d'accès d'un produit. */
export function glypheAcces(disponibilite: 'contact' | 'telechargement' | 'essai'): 'courrier' | 'telecharger' {
  return disponibilite === 'contact' ? 'courrier' : 'telecharger';
}
