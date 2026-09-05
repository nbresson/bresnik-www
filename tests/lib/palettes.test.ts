import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GRAPHIQUES, OMBRES, PALETTES, type NomToken } from '../../src/lib/palettes';
import { ratioContraste } from '../../src/lib/contraste';

// Commentaires retirés avant analyse : un token cité en commentaire (ex. « data-theme="dark" »)
// ne doit pas fausser la recherche de sélecteur ni l'extraction des variables.
const css = readFileSync('src/styles/tokens.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Extrait les déclarations `--couleur-*`, `--graphique-*` et `--ombre-*` d'un bloc CSS délimité par son sélecteur. */
function variablesDuBloc(selecteur: string): Record<string, string> {
  const debut = css.indexOf(selecteur);
  expect(debut, `bloc ${selecteur} introuvable`).toBeGreaterThan(-1);
  const corps = css.slice(css.indexOf('{', debut) + 1, css.indexOf('}', debut));
  return Object.fromEntries(
    [...corps.matchAll(/--(couleur|graphique|ombre)-([a-zA-Z0-9-]+):\s*([^;]+);/g)].map((m) => [
      m[1] === 'couleur' ? m[2] : `${m[1]}-${m[2]}`,
      m[3].trim(),
    ]),
  );
}

const couples: [NomToken, NomToken][] = [
  ['encre', 'papier'], ['encre-2', 'papier'], ['encre', 'blanc'], ['encre-2', 'blanc'], ['cobalt', 'papier'], ['cobalt', 'blanc'],
  ['blanc', 'cobalt'], ['cobalt', 'cobalt-teinte'], ['ambre', 'ambre-teinte'], ['succes', 'succes-teinte'], ['erreur', 'erreur-teinte'],
  ['erreur', 'blanc'], ['bande-texte', 'bande'], ['encre-claire', 'bande'],
];

/** Sépare les clés de couleur du reste (graphiques, ombre) pour la comparaison bidirectionnelle des ensembles. */
function clesCouleur(bloc: Record<string, string>): string[] {
  return Object.keys(bloc).filter((cle) => !cle.startsWith('graphique-') && cle !== 'ombre-capture');
}

describe('palettes', () => {
  it('le bloc clair de tokens.css reprend la palette claire', () => {
    const clair = variablesDuBloc(':root {');
    for (const [nom, valeur] of Object.entries(PALETTES.clair)) expect(clair[nom], nom).toBe(valeur);
    expect(clesCouleur(clair).sort()).toEqual((Object.keys(PALETTES.clair) as NomToken[]).sort());
    GRAPHIQUES.clair.forEach((valeur, i) => expect(clair[`graphique-${i + 1}`]).toBe(valeur));
    expect(clair['ombre-capture']).toBe(OMBRES.clair);
  });

  it('les deux blocs sombres de tokens.css reprennent la palette sombre', () => {
    for (const selecteur of [':root:not([data-theme="light"])', ':root[data-theme="dark"]']) {
      const sombre = variablesDuBloc(selecteur);
      for (const [nom, valeur] of Object.entries(PALETTES.sombre)) expect(sombre[nom], `${selecteur} ${nom}`).toBe(valeur);
      expect(clesCouleur(sombre).sort(), selecteur).toEqual((Object.keys(PALETTES.sombre) as NomToken[]).sort());
      GRAPHIQUES.sombre.forEach((valeur, i) => expect(sombre[`graphique-${i + 1}`]).toBe(valeur));
      expect(sombre['ombre-capture'], selecteur).toBe(OMBRES.sombre);
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
