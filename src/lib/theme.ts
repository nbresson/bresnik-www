export type ChoixTheme = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

export const CLE_STOCKAGE = 'bresnik-theme';

export function resoudreTheme(choix: ChoixTheme, systemeSombre: boolean): Theme {
  if (choix === 'system') return systemeSombre ? 'dark' : 'light';
  return choix;
}

export function libelleTheme(choix: ChoixTheme): string {
  return { light: 'Clair', dark: 'Sombre', system: 'Système' }[choix];
}
