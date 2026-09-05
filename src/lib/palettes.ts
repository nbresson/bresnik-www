/** Les deux palettes de la charte (spec thème sombre §2). Source de vérité partagée avec tokens.css, vérifiée par test. */
export type NomToken =
  | 'papier' | 'papier-2' | 'blanc' | 'encre' | 'encre-2' | 'ligne'
  | 'cobalt' | 'cobalt-fonce' | 'cobalt-teinte' | 'ambre' | 'ambre-teinte'
  | 'succes' | 'succes-teinte' | 'erreur' | 'erreur-teinte'
  | 'bande' | 'bande-texte' | 'encre-claire' | 'voile';

export const PALETTES: { clair: Record<NomToken, string>; sombre: Record<NomToken, string> } = {
  clair: {
    papier: '#faf8f4', 'papier-2': '#f1ede4', blanc: '#ffffff', encre: '#1c2331', 'encre-2': '#4f5868', ligne: '#e2ddd2',
    cobalt: '#1f4fc7', 'cobalt-fonce': '#183f9f', 'cobalt-teinte': '#e6ecfa', ambre: '#8f620f', 'ambre-teinte': '#fbf1dd',
    succes: '#1e6b45', 'succes-teinte': '#e4f3ea', erreur: '#b42318', 'erreur-teinte': '#fbe9e7',
    bande: '#1c2331', 'bande-texte': '#ffffff', 'encre-claire': '#c9cfdb', voile: 'rgb(28 35 49 / 0.5)',
  },
  sombre: {
    papier: '#141a26', 'papier-2': '#1b2230', blanc: '#1f2735', encre: '#f1efe9', 'encre-2': '#aab3c2', ligne: '#2f3a4c',
    cobalt: '#8fb0ff', 'cobalt-fonce': '#adc4ff', 'cobalt-teinte': '#22304d', ambre: '#e3ac48', 'ambre-teinte': '#3a2f16',
    succes: '#6fd19a', 'succes-teinte': '#1a3326', erreur: '#ff9384', 'erreur-teinte': '#40201d',
    bande: '#2a3446', 'bande-texte': '#f1efe9', 'encre-claire': '#b8c0cf', voile: 'rgb(0 0 0 / 0.6)',
  },
};

export const GRAPHIQUES = {
  clair: ['#1f4fc7', '#a8650a', '#2a8a4a', '#8a3fa8', '#c2452e'],
  sombre: ['#5d88e8', '#b8852c', '#3fa46c', '#a46ee6', '#d9655a'],
};

export const USAGES: Record<NomToken, string> = {
  papier: 'Fond de page', 'papier-2': 'Bandes de rythme', blanc: 'Surface des cartes', encre: 'Texte principal', 'encre-2': 'Texte secondaire',
  ligne: 'Bordures', cobalt: 'Accent, liens, boutons', 'cobalt-fonce': 'Survol', 'cobalt-teinte': 'Fond teinté cobalt', ambre: 'Consultants, avertissement',
  'ambre-teinte': 'Fond teinté ambre', succes: 'Succès, statut actif', 'succes-teinte': 'Fond succès', erreur: 'Erreurs', 'erreur-teinte': 'Fond erreur',
  bande: 'Fond des bandes', 'bande-texte': 'Texte sur bande', 'encre-claire': 'Texte secondaire sur bande', voile: 'Voile des dialogues',
};
