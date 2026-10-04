/** Les deux palettes de la charte (spec thème sombre §2, révisées le 2026-09-05 d'après le logo). Source de vérité partagée avec tokens.css, vérifiée par test. */
export type NomToken =
  | 'papier' | 'papier-2' | 'blanc' | 'encre' | 'encre-2' | 'ligne'
  | 'cobalt' | 'cobalt-fonce' | 'cobalt-teinte' | 'ambre' | 'ambre-teinte'
  | 'flamme' | 'braise'
  | 'succes' | 'succes-teinte' | 'erreur' | 'erreur-teinte'
  | 'bande' | 'bande-texte' | 'encre-claire' | 'voile';

export const PALETTES: { clair: Record<NomToken, string>; sombre: Record<NomToken, string> } = {
  clair: {
    papier: '#f8fafc', 'papier-2': '#f1f5f9', blanc: '#ffffff', encre: '#0f172a', 'encre-2': '#475569', ligne: '#e2e8f0',
    cobalt: '#1d4ed8', 'cobalt-fonce': '#1e40af', 'cobalt-teinte': '#eff6ff', ambre: '#9a3412', 'ambre-teinte': '#ffedd5',
    flamme: '#f97316', braise: '#ea580c',
    succes: '#166534', 'succes-teinte': '#f0fdf4', erreur: '#b91c1c', 'erreur-teinte': '#fef2f2',
    bande: '#0f172a', 'bande-texte': '#ffffff', 'encre-claire': '#cbd5e1', voile: 'rgb(15 23 42 / 0.5)',
  },
  sombre: {
    papier: '#090d16', 'papier-2': '#0f172a', blanc: '#131d33', encre: '#f1f5f9', 'encre-2': '#94a3b8', ligne: '#1e293b',
    cobalt: '#60a5fa', 'cobalt-fonce': '#93c5fd', 'cobalt-teinte': '#172554', ambre: '#fb923c', 'ambre-teinte': '#431407',
    flamme: '#f97316', braise: '#ea580c',
    succes: '#4ade80', 'succes-teinte': '#052e16', erreur: '#f87171', 'erreur-teinte': '#450a0a',
    bande: '#0f172a', 'bande-texte': '#f8fafc', 'encre-claire': '#94a3b8', voile: 'rgb(0 0 0 / 0.6)',
  },
};

export const GRAPHIQUES = {
  clair: ['#2563eb', '#ea580c', '#16a34a', '#9333ea', '#dc2626'],
  sombre: ['#60a5fa', '#fb923c', '#4ade80', '#c084fc', '#f87171'],
};

/** Ombre des cadres de capture (spec thème sombre §2), vérifiée par le même test anti-dérive. Non affichée sur la charte. */
export const OMBRES = {
  clair: '0 20px 40px -24px rgb(15 23 42 / 0.12)',
  sombre: '0 24px 48px -32px rgb(0 0 0 / 0.7)',
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
