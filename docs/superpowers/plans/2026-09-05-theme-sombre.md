# Thème clair et thème sombre — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner au site un thème sombre validé, suivant le système par défaut, avec un sélecteur à trois états mémorisé, sans flash, sans réécrire les composants, et une charte montrant les deux palettes.

**Architecture:** Les tokens de `src/styles/tokens.css` reçoivent une seconde définition sombre, appliquée par `prefers-color-scheme` ou par `data-theme="dark"` sur `<html>`. Une table TypeScript `src/lib/palettes.ts` porte les deux palettes pour la charte et pour un test anti-dérive qui relit `tokens.css`. Trois tokens nouveaux (`bande`, `bande-texte`, `voile`) remplacent les usages de `bg-encre text-blanc` et `backdrop:bg-encre` dans les composants qui dessinent une bande ou un voile. Un script en ligne dans `<head>` pose l'attribut avant le rendu ; un composant `SelecteurTheme` (élément `bk-theme`) gère le menu à trois choix.

**Tech Stack:** Astro 7, Tailwind 4 (`@theme inline`), Vitest 4, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-05-theme-sombre-design.md` (binding) ; composants et charte : `docs/superpowers/specs/2026-09-03-design-site-vitrine-design.md`.

## Global Constraints

- Langue : français partout.
- Valeurs des deux palettes exactement celles de la spec §2 (tokens, ombres, graphiques). Aucune autre couleur en dur dans les composants ; l'exception documentée reste les pastilles décoratives `#d9d2c4` du cadre de capture.
- Clé de stockage `bresnik-theme` ; valeurs `light` ou `dark` ; absence = système. Attribut `data-theme` sur `<html>`.
- Le script de thème est en ligne (`is:inline`), placé dans `<head>` avant les feuilles de style, sans dépendance, entouré de `try/catch`.
- Composants sans style en ligne, classes Tailwind sur les tokens ; focus visible ; cibles 44 px.
- `npm run check`, `npm run check:worker`, `npm test`, `npm run build`, `npm run verifier-liens` passent à la fin de chaque tâche.
- Fin de chaque message de commit : `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1 : Palettes, tokens sombres et mécanisme de base

**Files:**
- Create: `src/lib/palettes.ts`, `src/lib/theme.ts`, `tests/lib/palettes.test.ts`, `tests/lib/theme.test.ts`
- Modify: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`

**Interfaces:**
- Produces: `PALETTES: { clair: Record<NomToken, string>; sombre: Record<NomToken, string> }` avec `NomToken` = les 19 tokens de couleur de la spec §2 (`papier`, `papier-2`, `blanc`, `encre`, `encre-2`, `ligne`, `cobalt`, `cobalt-fonce`, `cobalt-teinte`, `ambre`, `ambre-teinte`, `succes`, `succes-teinte`, `erreur`, `erreur-teinte`, `bande`, `bande-texte`, `encre-claire`, `voile`) et `GRAPHIQUES: { clair: string[]; sombre: string[] }` ; `resoudreTheme(choix: ChoixTheme, systemeSombre: boolean): 'light' | 'dark'` et `libelleTheme(choix: ChoixTheme): string` avec `ChoixTheme = 'light' | 'dark' | 'system'` ; utilitaires Tailwind `bg-bande`, `text-bande-texte`, `bg-voile` ; `<html>` avec le script de thème et deux `theme-color`.

- [ ] **Étape 1 : Tests (échec attendu)**

`tests/lib/theme.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { libelleTheme, resoudreTheme } from '../../src/lib/theme';

describe('resoudreTheme', () => {
  it('suit le système quand aucun thème n\'est forcé', () => {
    expect(resoudreTheme('system', true)).toBe('dark');
    expect(resoudreTheme('system', false)).toBe('light');
  });

  it('respecte un thème forcé quel que soit le système', () => {
    expect(resoudreTheme('dark', false)).toBe('dark');
    expect(resoudreTheme('light', true)).toBe('light');
  });
});

describe('libelleTheme', () => {
  it('nomme chaque choix en français', () => {
    expect(libelleTheme('light')).toBe('Clair');
    expect(libelleTheme('dark')).toBe('Sombre');
    expect(libelleTheme('system')).toBe('Système');
  });
});
```

`tests/lib/palettes.test.ts` :

```ts
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
  ['erreur', 'blanc'], ['bande-texte', 'bande'], ['encre-claire', 'bande'], ['cobalt', 'bande'],
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
```

Run : `npm test` → FAIL, modules introuvables.

- [ ] **Étape 2 : Modules**

`src/lib/theme.ts` :

```ts
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
```

`src/lib/palettes.ts` :

```ts
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
```

Note : `ratioContraste` attend un hexadécimal ; `voile` n'est dans aucun couple testé.

- [ ] **Étape 3 : Tokens**

Remplacer `src/styles/tokens.css` par :

```css
/* Tokens de la marque Bresnik, direction « Atelier technique ».
   Deux palettes : claire (par défaut) et sombre (réglage du système ou
   data-theme="dark" sur <html>). Les valeurs sont dupliquées dans
   src/lib/palettes.ts et un test vérifie qu'elles restent identiques.
   Réutilisables par les applications : ne rien ajouter ici sans l'inscrire
   dans la spécification design. */
:root {
  color-scheme: light;

  --couleur-papier: #faf8f4;
  --couleur-papier-2: #f1ede4;
  --couleur-blanc: #ffffff;
  --couleur-encre: #1c2331;
  --couleur-encre-2: #4f5868;
  --couleur-ligne: #e2ddd2;
  --couleur-cobalt: #1f4fc7;
  --couleur-cobalt-fonce: #183f9f;
  --couleur-cobalt-teinte: #e6ecfa;
  --couleur-ambre: #8f620f;
  --couleur-ambre-teinte: #fbf1dd;

  /* Couleurs sémantiques, réservées aux alertes, statuts et erreurs. */
  --couleur-succes: #1e6b45;
  --couleur-succes-teinte: #e4f3ea;
  --couleur-erreur: #b42318;
  --couleur-erreur-teinte: #fbe9e7;

  /* Bandes sombres (appel, annonce, info-bulle) et voile des dialogues. */
  --couleur-bande: #1c2331;
  --couleur-bande-texte: #ffffff;
  --couleur-encre-claire: #c9cfdb;
  --couleur-voile: rgb(28 35 49 / 0.5);

  /* Palette catégorielle des graphiques, ordre fixe, validée pour les daltonismes
     (à compléter par étiquettes ou jours entre barres). Jamais réutilisée ailleurs. */
  --graphique-1: #1f4fc7;
  --graphique-2: #a8650a;
  --graphique-3: #2a8a4a;
  --graphique-4: #8a3fa8;
  --graphique-5: #c2452e;

  --ombre-capture: 0 24px 48px -32px rgb(28 35 49 / 0.35);

  --rayon-bouton: 6px;
  --rayon-carte: 8px;
  --rayon-cadre: 10px;
  --rayon-bande: 12px;
}

/* Thème sombre suivant le système, sauf si le visiteur a forcé le clair. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --couleur-papier: #141a26;
    --couleur-papier-2: #1b2230;
    --couleur-blanc: #1f2735;
    --couleur-encre: #f1efe9;
    --couleur-encre-2: #aab3c2;
    --couleur-ligne: #2f3a4c;
    --couleur-cobalt: #8fb0ff;
    --couleur-cobalt-fonce: #adc4ff;
    --couleur-cobalt-teinte: #22304d;
    --couleur-ambre: #e3ac48;
    --couleur-ambre-teinte: #3a2f16;
    --couleur-succes: #6fd19a;
    --couleur-succes-teinte: #1a3326;
    --couleur-erreur: #ff9384;
    --couleur-erreur-teinte: #40201d;
    --couleur-bande: #2a3446;
    --couleur-bande-texte: #f1efe9;
    --couleur-encre-claire: #b8c0cf;
    --couleur-voile: rgb(0 0 0 / 0.6);
    --graphique-1: #5d88e8;
    --graphique-2: #b8852c;
    --graphique-3: #3fa46c;
    --graphique-4: #a46ee6;
    --graphique-5: #d9655a;
    --ombre-capture: 0 24px 48px -32px rgb(0 0 0 / 0.6);
  }
}

/* Thème sombre forcé par le visiteur. Bloc identique au précédent. */
:root[data-theme="dark"] {
  color-scheme: dark;
  --couleur-papier: #141a26;
  --couleur-papier-2: #1b2230;
  --couleur-blanc: #1f2735;
  --couleur-encre: #f1efe9;
  --couleur-encre-2: #aab3c2;
  --couleur-ligne: #2f3a4c;
  --couleur-cobalt: #8fb0ff;
  --couleur-cobalt-fonce: #adc4ff;
  --couleur-cobalt-teinte: #22304d;
  --couleur-ambre: #e3ac48;
  --couleur-ambre-teinte: #3a2f16;
  --couleur-succes: #6fd19a;
  --couleur-succes-teinte: #1a3326;
  --couleur-erreur: #ff9384;
  --couleur-erreur-teinte: #40201d;
  --couleur-bande: #2a3446;
  --couleur-bande-texte: #f1efe9;
  --couleur-encre-claire: #b8c0cf;
  --couleur-voile: rgb(0 0 0 / 0.6);
  --graphique-1: #5d88e8;
  --graphique-2: #b8852c;
  --graphique-3: #3fa46c;
  --graphique-4: #a46ee6;
  --graphique-5: #d9655a;
  --ombre-capture: 0 24px 48px -32px rgb(0 0 0 / 0.6);
}
```

Dans `src/styles/global.css`, bloc `@theme inline`, ajouter après `--color-erreur-teinte` :

```css
  --color-bande: var(--couleur-bande);
  --color-bande-texte: var(--couleur-bande-texte);
  --color-voile: var(--couleur-voile);
```

Run : `npm test` → les tests de palettes passent (le bloc clair contient déjà `encre-claire`, `bande`, `bande-texte`, `voile`).

- [ ] **Étape 4 : Layout**

Dans `src/layouts/Base.astro` :

1. Remplacer `<meta name="theme-color" content="#faf8f4" />` par :

```astro
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf8f4" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#141a26" />
```

2. Insérer immédiatement après `<meta name="viewport" … />` (donc avant `<title>` et avant toute feuille de style) :

```astro
    <script is:inline>
      // Applique le thème mémorisé avant le premier rendu pour éviter tout flash.
      try {
        var theme = localStorage.getItem('bresnik-theme');
        if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
      } catch (erreur) {}
    </script>
```

- [ ] **Étape 5 : Vérifier**

Run : `npm run check && npm run check:worker && npm test && npm run build && npm run verifier-liens && grep -c 'bresnik-theme' dist/index.html && grep -c 'name="theme-color"' dist/index.html && grep -c 'data-theme="dark"' dist/_astro/*.css && node -e "const h=require('fs').readFileSync('dist/index.html','utf8');console.log(h.indexOf('bresnik-theme')<h.indexOf('<link rel=\"stylesheet\"')?'script avant css':'ORDRE INCORRECT')"`

Expected : tout passe ; `1` ; `2` ; au moins `1` ; « script avant css ».

- [ ] **Étape 6 : Commit**

```bash
git add -A
git commit -m "feat(theme): palette sombre, tokens de bande et de voile, script anti-flash et theme-color

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2 : Bandes et voiles sur les nouveaux tokens

**Files:**
- Modify: `src/components/BandeAppel.astro`, `src/components/CarteAppel.astro`, `src/components/BandeauAnnonce.astro`, `src/components/Section.astro`, `src/components/Video.astro`, `src/components/InfoBulle.astro`, `src/components/LienFleche.astro`, `src/components/application/Modale.astro`, `src/components/application/BoiteConfirmation.astro`, `src/pages/charte.astro`, `src/components/CadreCapture.astro`

**Interfaces:**
- Produces: `LienFleche` prop `ton` accepte `'cobalt' | 'bande'` (`'bande'` remplace `'blanc'`) ; tous les appels mis à jour.

- [ ] **Étape 1 : Remplacements**

Appliquer exactement, fichier par fichier :

- `BandeAppel.astro` : `bg-encre px-6 py-7 text-blanc` → `bg-bande px-6 py-7 text-bande-texte` ; `text-blanc md:text-[34px]` → `text-bande-texte md:text-[34px]`.
- `CarteAppel.astro` : `bg-encre p-5 text-blanc` → `bg-bande p-5 text-bande-texte` ; `<LienFleche href="/contact/" ton="blanc">` → `ton="bande"`.
- `BandeauAnnonce.astro` : `<div class="bg-encre text-blanc">` → `<div class="bg-bande text-bande-texte">` ; `ton="blanc"` → `ton="bande"`.
- `Section.astro` : `encre: 'bg-encre text-blanc'` → `encre: 'bg-bande text-bande-texte'` (la valeur de prop `fond="encre"` reste, pour compatibilité).
- `Video.astro` : `border-ligne bg-encre shadow-capture` → `border-ligne bg-bande shadow-capture` ; `rounded-bouton bg-encre px-4 py-2 text-[15px] font-semibold text-blanc` → `rounded-bouton bg-bande px-4 py-2 text-[15px] font-semibold text-bande-texte` ; `text-encre-claire underline` (lien de téléchargement) inchangé.
- `InfoBulle.astro` : `rounded-bouton bg-encre px-3 py-2 text-[14px] leading-[1.4] text-blanc` → `rounded-bouton bg-bande px-3 py-2 text-[14px] leading-[1.4] text-bande-texte`.
- `LienFleche.astro` : `ton?: 'cobalt' | 'blanc'` → `ton?: 'cobalt' | 'bande'` ; `const couleur = ton === 'blanc' ? 'text-blanc hover:text-encre-claire' : '';` → `const couleur = ton === 'bande' ? 'text-bande-texte hover:text-encre-claire' : '';`.
- `Modale.astro` et `BoiteConfirmation.astro` : `backdrop:bg-encre/50` → `backdrop:bg-voile`.
- `CadreCapture.astro` : `fonce: 'bg-encre opacity-60'` → `fonce: 'bg-encre-2'` (lisible dans les deux thèmes).
- `charte.astro` : les deux démonstrations `rounded-carte bg-encre p-6` et `rounded-carte bg-encre px-4 py-3` → `bg-bande` ; `ton="blanc"` → `ton="bande"` ; la section « Section sur fond encre » garde `fond="encre"` mais ses textes `text-blanc` → `text-bande-texte` ; dans la liste `couleurs` de la charte, l'usage de `encre` devient `'Texte principal'` et une ligne est ajoutée pour chaque nouveau token : `{ nom: 'bande', classe: 'bg-bande', valeur: '#1c2331', usage: 'Fond des bandes' }`, `{ nom: 'bande-texte', classe: 'bg-bande-texte', valeur: '#ffffff', usage: 'Texte sur bande' }` (les valeurs seront remplacées par la table des palettes en tâche 4).

- [ ] **Étape 2 : Vérifier**

Run : `npm run check && npm run build && npm run verifier-liens && grep -rn "bg-encre text-blanc\|text-blanc md:text-\[34px\]\|backdrop:bg-encre\|ton=\"blanc\"" src || echo "aucun reliquat"`

Expected : tout passe ; « aucun reliquat ».

- [ ] **Étape 3 : Commit**

```bash
git add -A
git commit -m "refactor(theme): bandes, info-bulle, vidéo et voiles sur les tokens bande et voile

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3 : Sélecteur de thème

**Files:**
- Create: `src/components/SelecteurTheme.astro`
- Modify: `src/components/Icone.astro`, `src/components/Header.astro`, `src/pages/gabarits/application.astro`

**Interfaces:**
- Consumes: `CLE_STOCKAGE`, `resoudreTheme`, `libelleTheme` de `src/lib/theme.ts` (côté client, importés dans le script du composant).
- Produces: `SelecteurTheme.astro` props `{ id: string; alignement?: 'gauche' | 'droite' }` ; icônes `soleil`, `lune`, `ecran` dans `Icone.astro`.

- [ ] **Étape 1 : Icônes**

Dans `src/components/Icone.astro`, ajouter au type `NomIcone` : `| 'soleil' | 'lune' | 'ecran'`, et dans `traces` :

```ts
  soleil: ['circle:12,12,4', 'M12 2v2', 'M12 20v2', 'M2 12h2', 'M20 12h2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  lune: ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z'],
  ecran: ['rect:3,4,18,12,2', 'M8 20h8', 'M12 16v4'],
```

- [ ] **Étape 2 : Composant**

`src/components/SelecteurTheme.astro` :

```astro
---
import Icone from './Icone.astro';

interface Props {
  id: string;
  alignement?: 'gauche' | 'droite';
}

const { id, alignement = 'droite' } = Astro.props;
const choix = [
  { valeur: 'light', libelle: 'Clair', icone: 'soleil' as const },
  { valeur: 'dark', libelle: 'Sombre', icone: 'lune' as const },
  { valeur: 'system', libelle: 'Système', icone: 'ecran' as const },
];
---
<bk-theme class="relative hidden" data-id={id}>
  <button
    type="button"
    id={`${id}-bouton`}
    aria-haspopup="menu"
    aria-expanded="false"
    aria-controls={`${id}-menu`}
    aria-label="Thème d'affichage"
    class="inline-flex size-11 items-center justify-center rounded-bouton text-encre-2 transition-colors duration-150 hover:bg-papier-2 hover:text-cobalt"
  >
    <Icone nom="soleil" taille={20} class="icone-light hidden" />
    <Icone nom="lune" taille={20} class="icone-dark hidden" />
    <Icone nom="ecran" taille={20} class="icone-system" />
  </button>
  <ul role="menu" id={`${id}-menu`} aria-labelledby={`${id}-bouton`} hidden class={`absolute z-20 mt-1 min-w-[180px] rounded-carte border border-ligne bg-blanc py-1.5 shadow-capture ${alignement === 'droite' ? 'right-0' : 'left-0'}`}>
    {choix.map((option) => (
      <li role="none">
        <button type="button" role="menuitemradio" aria-checked="false" data-theme-choix={option.valeur} tabindex="-1" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-encre hover:bg-papier-2 aria-checked:text-cobalt">
          <Icone nom={option.icone} taille={18} class="shrink-0" />
          {option.libelle}
          <Icone nom="coche" taille={16} class="ml-auto hidden aria-checked:inline" />
        </button>
      </li>
    ))}
  </ul>
</bk-theme>

<script>
  import { CLE_STOCKAGE, resoudreTheme, type ChoixTheme } from '../lib/theme';

  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function choixMemorise(): ChoixTheme {
    try {
      const valeur = localStorage.getItem(CLE_STOCKAGE);
      return valeur === 'light' || valeur === 'dark' ? valeur : 'system';
    } catch {
      return 'system';
    }
  }

  function appliquer(choix: ChoixTheme) {
    const racine = document.documentElement;
    if (choix === 'system') delete racine.dataset.theme;
    else racine.dataset.theme = choix;
    try {
      if (choix === 'system') localStorage.removeItem(CLE_STOCKAGE);
      else localStorage.setItem(CLE_STOCKAGE, choix);
    } catch {}
    const effectif = resoudreTheme(choix, media.matches);
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = effectif === 'dark' ? '#141a26' : '#faf8f4';
    }
    document.dispatchEvent(new CustomEvent('bk-theme', { detail: { choix, effectif } }));
  }

  class SelecteurTheme extends HTMLElement {
    connectedCallback() {
      const bouton = this.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]');
      const menu = this.querySelector<HTMLUListElement>('[role="menu"]');
      if (!bouton || !menu) return;
      const elements = () => Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
      const refleter = (choix: ChoixTheme) => {
        for (const element of elements()) element.setAttribute('aria-checked', String(element.dataset.themeChoix === choix));
        for (const valeur of ['light', 'dark', 'system']) this.querySelector(`.icone-${valeur}`)?.classList.toggle('hidden', valeur !== choix);
      };
      const fermer = (refocaliser = true) => {
        if (menu.hidden) return;
        menu.hidden = true;
        bouton.setAttribute('aria-expanded', 'false');
        if (refocaliser) bouton.focus();
      };
      const ouvrir = () => {
        menu.hidden = false;
        bouton.setAttribute('aria-expanded', 'true');
        (elements().find((e) => e.getAttribute('aria-checked') === 'true') ?? elements()[0])?.focus();
      };
      bouton.addEventListener('click', () => (menu.hidden ? ouvrir() : fermer()));
      menu.addEventListener('click', (evenement) => {
        const element = (evenement.target as Element).closest<HTMLButtonElement>('[role="menuitemradio"]');
        if (!element) return;
        const choix = element.dataset.themeChoix as ChoixTheme;
        appliquer(choix);
        refleter(choix);
        fermer();
      });
      menu.addEventListener('keydown', (evenement) => {
        const liste = elements();
        const index = liste.indexOf(document.activeElement as HTMLButtonElement);
        if (evenement.key === 'ArrowDown') { evenement.preventDefault(); liste[(index + 1) % liste.length]?.focus(); }
        if (evenement.key === 'ArrowUp') { evenement.preventDefault(); liste[(index - 1 + liste.length) % liste.length]?.focus(); }
        if (evenement.key === 'Escape') { evenement.preventDefault(); fermer(); }
        if (evenement.key === 'Tab') fermer(false);
      });
      document.addEventListener('click', (evenement) => { if (!this.contains(evenement.target as Node)) fermer(false); });
      document.addEventListener('bk-theme', (evenement) => refleter((evenement as CustomEvent<{ choix: ChoixTheme }>).detail.choix));
      media.addEventListener('change', () => { if (choixMemorise() === 'system') appliquer('system'); });
      refleter(choixMemorise());
      this.classList.remove('hidden');
      this.classList.add('inline-block');
    }
  }
  if (!customElements.get('bk-theme')) customElements.define('bk-theme', SelecteurTheme);
</script>
```

- [ ] **Étape 3 : En-tête et gabarit**

Dans `src/components/Header.astro` :
- ajouter `import SelecteurTheme from './SelecteurTheme.astro';` ;
- dans la navigation desktop, juste avant `<Bouton href="/contact/" taille="compact">`, insérer `<SelecteurTheme id="theme-desktop" />` ;
- dans le conteneur du bouton de menu mobile, remplacer le bouton seul par un groupe : entourer le `<button id="bouton-menu" …>` existant d'un `<div class="flex items-center gap-1 lg:hidden">` contenant d'abord `<SelecteurTheme id="theme-mobile" />` puis le bouton (retirer `lg:hidden` du bouton puisque le conteneur le porte).

Dans `src/pages/gabarits/application.astro` : importer `SelecteurTheme` et ajouter `<SelecteurTheme slot="actions" id="theme-application" />` en premier dans les actions de `EnTeteApplication`.

- [ ] **Étape 4 : Vérifier**

Run : `npm run check && npm test && npm run build && npm run verifier-liens && grep -c 'bk-theme' dist/index.html && grep -o 'role="menuitemradio"' dist/index.html | wc -l && grep -c 'bk-theme' dist/gabarits/application/index.html`

Expected : tout passe ; `bk-theme` présent (au moins 2 occurrences sur l'accueil : desktop et mobile) ; `6` éléments radio (3 × 2) ; gabarit avec sélecteur.

Test manuel si un navigateur est disponible : ouvrir l'accueil, choisir Sombre, recharger : pas de flash, thème conservé ; choisir Système : l'attribut disparaît. Sinon, le dire dans le rapport.

- [ ] **Étape 5 : Commit**

```bash
git add -A
git commit -m "feat(theme): sélecteur clair, sombre, système dans l'en-tête et le gabarit d'application

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4 : Charte, documentation et vérification finale

**Files:**
- Modify: `src/pages/charte.astro`, `docs/superpowers/specs/2026-09-03-design-site-vitrine-design.md`, `docs/backlog-composants.md`, `docs/deploiement.md`, `README.md`

- [ ] **Étape 1 : Charte**

Dans `src/pages/charte.astro` :

1. Importer `SelecteurTheme` et `{ PALETTES, GRAPHIQUES, USAGES, type NomToken }` de `../lib/palettes` ; supprimer le tableau `couleurs` codé en dur et le remplacer par :

```ts
const tokensCouleur = Object.keys(PALETTES.clair) as NomToken[];
const classeFond: Record<NomToken, string> = {
  papier: 'bg-papier', 'papier-2': 'bg-papier-2', blanc: 'bg-blanc', encre: 'bg-encre', 'encre-2': 'bg-encre-2', ligne: 'bg-ligne',
  cobalt: 'bg-cobalt', 'cobalt-fonce': 'bg-cobalt-fonce', 'cobalt-teinte': 'bg-cobalt-teinte', ambre: 'bg-ambre', 'ambre-teinte': 'bg-ambre-teinte',
  succes: 'bg-succes', 'succes-teinte': 'bg-succes-teinte', erreur: 'bg-erreur', 'erreur-teinte': 'bg-erreur-teinte',
  bande: 'bg-bande', 'bande-texte': 'bg-bande-texte', 'encre-claire': 'bg-encre-claire', voile: 'bg-voile',
};
const couples: [NomToken, NomToken][] = [
  ['encre', 'papier'], ['encre-2', 'papier'], ['cobalt', 'papier'], ['blanc', 'cobalt'], ['cobalt', 'cobalt-teinte'], ['ambre', 'ambre-teinte'],
  ['encre-claire', 'bande'], ['bande-texte', 'bande'], ['succes', 'succes-teinte'], ['erreur', 'erreur-teinte'], ['erreur', 'blanc'],
];
const contrastes = couples.map(([texte, fond]) => ({
  texte, fond,
  clair: ratioContraste(PALETTES.clair[texte], PALETTES.clair[fond]),
  sombre: ratioContraste(PALETTES.sombre[texte], PALETTES.sombre[fond]),
}));
```

et retirer `valeurCouleur` et `couplesContraste`. Les tokens de graphiques `LegendeGraphique` gardent leurs classes ; ajouter sous la légende un tableau à deux colonnes des valeurs `GRAPHIQUES.clair` et `GRAPHIQUES.sombre`.

2. Dans l'en-tête de la charte, après le sommaire, ajouter : `<div class="flex items-center gap-2 text-[15px] text-encre-2">Thème : <SelecteurTheme id="theme-charte" alignement="gauche" /></div>`.

3. Section Couleurs : chaque pastille affiche la classe de fond (elle change avec le thème) et, sous le nom, deux lignes `technique` : `clair <valeur>` et `sombre <valeur>` ; le tableau des contrastes gagne deux colonnes « Clair » et « Sombre » avec le ratio et la conformité de chacune. Retirer la phrase « Le site a un seul rendu, clair… » et la remplacer par « Deux rendus, clair et sombre, sur les mêmes tokens : un composant ne connaît que le rôle d'une couleur. »

- [ ] **Étape 2 : Documentation**

- `docs/superpowers/specs/2026-09-03-design-site-vitrine-design.md` : sous le tableau de §2.1, ajouter « Amendé le 2026-09-05 : palette sombre et tokens `bande`, `bande-texte`, `voile`, voir `2026-09-05-theme-sombre-design.md` » ; en §9, remplacer « Pas de mode sombre. » par « Mode sombre ajouté le 2026-09-05 (spécification dédiée). » ; en §3, ligne Pied de page inchangée, ajouter une ligne au tableau §3 bis : `| Sélecteur de thème | SelecteurTheme.astro | Bouton d'icône et menu à trois choix (Clair, Sombre, Système), mémorisation locale, dans l'en-tête et le gabarit d'application. |`.
- `docs/backlog-composants.md` : ligne « Mention explicite de l'absence de mode sombre » → note « Remplacée par le thème sombre (2026-09-05). ».
- `docs/deploiement.md`, section « Qualité avant fusion » : ajouter « Lighthouse se joue dans les deux thèmes : forcer le sombre en posant `localStorage.setItem('bresnik-theme','dark')` dans la console avant l'audit, ou utiliser l'émulation `prefers-color-scheme` des outils de développement. »
- `README.md` : une ligne dans « Charte vivante » : « Le thème sombre suit le système ; le sélecteur de l'en-tête force clair, sombre ou système. »

- [ ] **Étape 3 : Vérifier et Lighthouse**

Run : `npm run check && npm run check:worker && npm test && npm run build && npm run verifier-liens && grep -c 'theme-charte' dist/charte/index.html`

Lighthouse, manuel, si Chrome ou Edge est disponible (voir `docs/deploiement.md`) : accueil, fiche BankBridge et charte, en clair puis en sombre (`--preset=desktop`, forcer le sombre via l'émulation : `--emulated-form-factor=desktop` ne suffit pas ; utiliser `npx lighthouse <url> --preset=desktop --chrome-flags="--headless=new --force-dark-mode"` pour le sombre). Consigner les scores dans le rapport ; accessibilité ≥ 95 attendue dans les deux modes. Sans navigateur, le signaler.

- [ ] **Étape 4 : Commit**

```bash
git add -A
git commit -m "docs(theme): charte sur les deux palettes, spécifications et procédure Lighthouse

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Auto-revue du plan

**Couverture de la spécification thème sombre.** §2 palettes et tokens (T1, valeurs identiques à la spec, test anti-dérive) ; §3 mécanisme : attribut, blocs CSS doublés, `color-scheme`, script anti-flash, `theme-color`, sélecteur à trois états avec écoute du système, `lib/theme.ts` (T1, T3) ; bandes et voiles (T2) ; §4 charte et gabarits (T3, T4) ; §5 vérifications : tests (T1), ordre script/CSS (T1), reliquats (T2), Lighthouse (T4).

**Placeholders.** Aucun. Les valeurs hexadécimales sont celles validées par le calcul de contraste et l'outil de palette de graphiques.

**Cohérence des noms.** `CLE_STOCKAGE`, `resoudreTheme`, `ChoixTheme` (T1) utilisés en T3 ; `PALETTES`, `GRAPHIQUES`, `USAGES`, `NomToken` (T1) utilisés en T4 ; utilitaires `bg-bande`, `text-bande-texte`, `bg-voile` définis en T1 et utilisés en T2 ; `LienFleche` `ton="bande"` en T2 partout ; identifiants `theme-desktop`, `theme-mobile`, `theme-application`, `theme-charte` uniques par page.
