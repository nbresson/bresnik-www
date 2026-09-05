/** Les deux palettes de la charte (spec thème sombre §2, révisées le 2026-09-05 d'après le logo). Source de vérité partagée avec tokens.css, vérifiée par test. */
export type NomToken =
  | 'papier' | 'papier-2' | 'blanc' | 'encre' | 'encre-2' | 'ligne'
  | 'cobalt' | 'cobalt-fonce' | 'cobalt-teinte' | 'ambre' | 'ambre-teinte'
  | 'flamme' | 'braise'
  | 'succes' | 'succes-teinte' | 'erreur' | 'erreur-teinte'
  | 'bande' | 'bande-texte' | 'encre-claire' | 'voile';

export const PALETTES: { clair: Record<NomToken, string>; sombre: Record<NomToken, string> } = {
  clair: {
    papier: '#faf8f4', 'papier-2': '#f1ede4', blanc: '#ffffff', encre: '#0f2445', 'encre-2': '#4a566e', ligne: '#e2ddd2',
    cobalt: '#1b4a8c', 'cobalt-fonce': '#133868', 'cobalt-teinte': '#e6ecf7', ambre: '#b8460a', 'ambre-teinte': '#fdeadb',
    flamme: '#f87800', braise: '#e0480a',
    succes: '#1e6b45', 'succes-teinte': '#e4f3ea', erreur: '#b42318', 'erreur-teinte': '#fbe9e7',
    bande: '#0f2445', 'bande-texte': '#ffffff', 'encre-claire': '#c2cbdd', voile: 'rgb(15 36 69 / 0.5)',
  },
  sombre: {
    papier: '#0c1830', 'papier-2': '#122040', blanc: '#17284a', encre: '#eef1f7', 'encre-2': '#aab5cc', ligne: '#2a3b5c',
    cobalt: '#8fb3ff', 'cobalt-fonce': '#adc6ff', 'cobalt-teinte': '#1f3358', ambre: '#ffa25a', 'ambre-teinte': '#40261a',
    flamme: '#ff8a2a', braise: '#ff5a2a',
    succes: '#6fd19a', 'succes-teinte': '#1a3326', erreur: '#ff9384', 'erreur-teinte': '#40201d',
    bande: '#16305a', 'bande-texte': '#eef1f7', 'encre-claire': '#bcc7dd', voile: 'rgb(0 0 0 / 0.6)',
  },
};

export const GRAPHIQUES = {
  clair: ['#2a5db5', '#d45c10', '#2a8a4a', '#8a3fa8', '#c2452e'],
  sombre: ['#5d88e8', '#b8852c', '#3fa46c', '#a46ee6', '#d9655a'],
};

/** Ombre des cadres de capture (spec thème sombre §2), vérifiée par le même test anti-dérive. Non affichée sur la charte. */
export const OMBRES = {
  clair: '0 24px 48px -32px rgb(15 36 69 / 0.35)',
  sombre: '0 24px 48px -32px rgb(0 0 0 / 0.6)',
};

/** Couleurs du logo, référence de la palette (jamais utilisées directement dans l'interface). */
export const LOGO = {
  marineHaut: '#133868',
  marineBas: '#062045',
  orange: '#f87800',
  rouge: '#f84808',
};

export const USAGES: Record<NomToken, string> = {
  papier: 'Fond de page', 'papier-2': 'Bandes de rythme', blanc: 'Surface des cartes', encre: 'Texte principal (marine du logo)', 'encre-2': 'Texte secondaire',
  ligne: 'Bordures', cobalt: 'Accent, liens, boutons (marine)', 'cobalt-fonce': 'Survol', 'cobalt-teinte': 'Fond teinté marine', ambre: 'Orange lisible : surtitres, consultants',
  'ambre-teinte': 'Fond teinté orange', flamme: 'Orange du logo, décoratif', braise: 'Rouge-orange du logo : « k », gros titres, décoratif',
  succes: 'Succès, statut actif', 'succes-teinte': 'Fond succès', erreur: 'Erreurs', 'erreur-teinte': 'Fond erreur',
  bande: 'Fond des bandes (marine)', 'bande-texte': 'Texte sur bande', 'encre-claire': 'Texte secondaire sur bande', voile: 'Voile des dialogues',
};
