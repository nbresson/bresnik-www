import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GRAPHIQUES, PALETTES, type NomToken } from '../../src/lib/palettes';
import { ratioContraste } from '../../src/lib/contraste';

const css = readFileSync('src/styles/tokens.css', 'utf8');

/** Extrait les déclarations `--couleur-*` et `--graphique-*` d'un bloc CSS délimité par son sélecteur. */
function variablesDuBloc(selecteur: string): Record<string, string> {
  const debut = css.indexOf(selecteur);
  expect(debut, `bloc ${selecteur} introuvable`).toBeGreaterThan(-1);
  const corps = css.slice(css.indexOf('{', debut) + 1, css.indexOf('}', debut));
  return Object.fromEntries([...corps.matchAll(/--(couleur|graphique)-([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1] === 'graphique' ? `graphique-${m[2]}` : m[2], m[3].trim()]));
}

const couples: [NomToken, NomToken][] = [
  ['encre', 'papier'], ['encre-2', 'papier'], ['encre', 'blanc'], ['encre-2', 'blanc'], ['cobalt', 'papier'], ['cobalt', 'blanc'],
  ['blanc', 'cobalt'], ['cobalt', 'cobalt-teinte'], ['ambre', 'ambre-teinte'], ['succes', 'succes-teinte'], ['erreur', 'erreur-teinte'],
  ['erreur', 'blanc'], ['bande-texte', 'bande'], ['encre-claire', 'bande'],
];

describe('palettes', () => {
  it('le bloc clair de tokens.css reprend la palette claire', () => {
    const clair = variablesDuBloc(':root {');
    for (const [nom, valeur] of Object.entries(PALETTES.clair)) expect(clair[nom], nom).toBe(valeur);
    GRAPHIQUES.clair.forEach((valeur, i) => expect(clair[`graphique-${i + 1}`]).toBe(valeur));
  });

  it('les deux blocs sombres de tokens.css reprennent la palette sombre', () => {
    for (const selecteur of [':root:not([data-theme="light"])', ':root[data-theme="dark"]']) {
      const sombre = variablesDuBloc(selecteur);
      for (const [nom, valeur] of Object.entries(PALETTES.sombre)) expect(sombre[nom], `${selecteur} ${nom}`).toBe(valeur);
      GRAPHIQUES.sombre.forEach((valeur, i) => expect(sombre[`graphique-${i + 1}`]).toBe(valeur));
    }
  });

  it('les couples de la spécification atteignent 4,5 dans les deux palettes', () => {
    for (const palette of [PALETTES.clair, PALETTES.sombre]) {
      for (const [texte, fond] of couples) {
        expect(ratioContraste(palette[texte], palette[fond]), `${texte} sur ${fond}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
