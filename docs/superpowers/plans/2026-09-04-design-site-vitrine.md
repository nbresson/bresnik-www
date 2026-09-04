# Design du site vitrine — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Appliquer la charte « Atelier technique » à toutes les pages du site Astro existant, avec polices auto-hébergées, composants réutilisables, accessibilité et vérifications de qualité, sans changer le contenu ni le comportement du formulaire.

**Architecture:** Les tokens de marque vivent dans `src/styles/tokens.css` (variables CSS) et sont exposés à Tailwind 4 par `@theme inline` dans `global.css`, ce qui donne des utilitaires `bg-papier`, `font-titres`, etc. Les polices passent par l'API Fonts d'Astro (fournisseur Fontsource, téléchargement au build, aucun appel tiers au chargement). Une dizaine de composants Astro sans état (`src/components/`) portent la charte ; les pages les assemblent. Les seules fonctions pures nouvelles (`libelleCible`, `libelleAcces`, `produitsMemeFamille`, extraction des liens) sont testées avec Vitest. Un script Node génère favicon et image Open Graph, un autre vérifie les liens internes après le build.

**Tech Stack:** Astro 7.2 (Fonts API, `astro:assets`), Tailwind CSS 4 + `@tailwindcss/typography`, Vitest 4, satori + @resvg/resvg-js (génération d'images), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-03-design-site-vitrine-design.md` (design) ; `docs/superpowers/specs/2026-09-02-bresnik-www-design.md` (structure et contenu, inchangée).

## Global Constraints

- Langue : français partout (libellés, noms de composants, props, commits).
- Couleurs autorisées, et aucune autre : `papier #faf8f4`, `papier-2 #f1ede4`, `encre #1c2331`, `encre-2 #4f5868`, `encre-claire #c9cfdb`, `ligne #e2ddd2`, `blanc #ffffff`, `cobalt #1f4fc7`, `cobalt-fonce #183f9f`, `cobalt-teinte #e6ecfa`, `ambre #8f620f`, `ambre-teinte #fbf1dd`.
- Polices : titres Bricolage Grotesque 500 à 700 ; texte Source Sans 3 400 et 600 ; technique JetBrains Mono 500. Variables CSS `--police-titres`, `--police-texte`, `--police-technique` fournies par l'API Fonts d'Astro. Aucun `<link>` vers Google Fonts.
- Aucun style en ligne (`style="..."`) dans les composants et pages ; classes Tailwind uniquement, plus `global.css` pour le focus, la typographie Markdown et l'utilitaire `conteneur`.
- Rayons : boutons et champs 6 px, cartes 8 px, cadres et fiche technique 10 px, bande d'appel 12 px, étiquettes 999 px. Ombre unique `0 24px 48px -32px rgb(28 35 49 / 0.35)` réservée aux cadres de capture.
- Gouttières : 20 px mobile, 80 px à partir de `lg` ; largeur max 1440 px (utilitaire `conteneur`).
- Points de rupture Tailwind par défaut ; grilles 3 colonnes → 2 sous `lg` → 1 sous `md`.
- Focus visible partout : `outline 2px cobalt, offset 2px`, jamais supprimé. Cibles tactiles ≥ 44 px.
- Un seul `<h1>` par page, puis `h2` et `h3` sans saut.
- `trailingSlash: 'always'` : tout lien interne se termine par `/`, sauf `/rss.xml`, `/sitemap-index.xml`, `/api/contact`.
- Le formulaire de contact garde son bouton désactivé et son message « L'envoi en ligne sera activé prochainement. » ; son `action` reste `/api/contact` ; le script de pré-remplissage reste.
- Interfaces existantes conservées : `Base.astro` props `titre`, `description`, `typeOg`, `sansSuffixe` (nouvelles props ajoutées : `image`, `noindex`) ; `actionProduit()`, `produitsPublies()`, `filtrerPublies()`, `trierParDate()`, `listerTags()`, `formaterDate()`, `dateIso()` inchangés.
- Année du pied de page : « 2026 » en dur.
- Fin de chaque message de commit : `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Commandes exécutées dans `C:\Users\nbres\source\repos\Bresnik` avec Git Bash ; `npm run check`, `npm test`, `npm run build` doivent passer à la fin de chaque tâche.

---

## Carte des fichiers

| Fichier | Responsabilité |
|---|---|
| `astro.config.mjs` | Ajoute la configuration `fonts`. |
| `src/styles/tokens.css` | Variables CSS de la marque (couleurs, ombre, rayons). |
| `src/styles/global.css` | Import Tailwind, plugin typographie, `@theme inline`, focus global, utilitaire `conteneur`, styles `.prose`. |
| `src/layouts/Base.astro` | Squelette : polices, SEO, lien d'évitement, `<main id="contenu">`, `noindex`, `og:image`. |
| `src/components/Icone.astro` | Trois icônes SVG (`fleche`, `coche`, `menu`). |
| `src/components/Marque.astro` | Mot-symbole Bresnik. |
| `src/components/Bouton.astro` | Bouton ou lien-bouton, trois variantes. |
| `src/components/Etiquette.astro` | Pastille (`cobalt`, `ambre`, `neutre`). |
| `src/components/EnTeteSection.astro` | Eyebrow + titre de section + lien facultatif. |
| `src/components/EnTetePage.astro` | Eyebrow + `h1` + sous-titre en tête de page. |
| `src/components/ListeCoches.astro` | Liste à coches, 1 ou 2 colonnes. |
| `src/components/BandeAppel.astro` | Bande d'appel à l'action sur fond encre. |
| `src/components/Header.astro`, `Footer.astro` | En-tête avec menu mobile ; pied de page. |
| `src/components/CarteProduit.astro`, `CarteAppel.astro`, `CadreCapture.astro`, `FicheTechnique.astro` | Composants produits. |
| `src/components/CarteArticle.astro` | Carte d'article avec niveau de titre paramétrable. |
| `src/components/Champ.astro` | Champ de formulaire (texte, email, zone, liste). |
| `src/components/PageEditoriale.astro` | Page Markdown habillée. |
| `src/lib/produits.ts` | + `libelleCible()`, `libelleAcces()`, `produitsMemeFamille()`. |
| `src/pages/**` | Toutes les pages réécrites avec les composants. |
| `scripts/generer-og.mjs` | Génère `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png`, `public/og-default.png`. |
| `scripts/liens.mjs`, `scripts/verifier-liens.mjs` | Extraction et vérification des liens internes de `dist/`. |
| `tests/lib/produits.test.ts`, `tests/scripts/liens.test.ts`, `tests/scripts/images.test.ts` | Tests Vitest. |
| `.github/workflows/ci.yml` | + étape de vérification des liens. |
| `docs/deploiement.md` | + section Lighthouse. |

---

### Task 1 : Fondations — tokens, polices, layout de base

**Files:**
- Modify: `astro.config.mjs`, `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `package.json` (dépendance)
- Create: `src/components/Icone.astro`

**Interfaces:**
- Produces: utilitaires Tailwind `bg-/text-/border-` pour chaque couleur (`papier`, `papier-2`, `encre`, `encre-2`, `encre-claire`, `ligne`, `blanc`, `cobalt`, `cobalt-fonce`, `cobalt-teinte`, `ambre`, `ambre-teinte`), `font-titres`, `font-texte`, `font-technique`, `shadow-capture`, classe `conteneur`, classes `eyebrow` et `technique` ; `Base.astro` props `{ titre, description, typeOg?, sansSuffixe?, image?: string, noindex?: boolean }` et `<main id="contenu">` sans marge interne (chaque section gère `conteneur`) ; `Icone.astro` props `{ nom: 'fleche' | 'coche' | 'menu'; taille?: number; class?: string }`.

- [ ] **Étape 1 : Installer le plugin typographie**

Run : `npm install --save-dev @tailwindcss/typography@^0.5.20`

- [ ] **Étape 2 : Configuration des polices**

Remplacer `astro.config.mjs` par :

```js
// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const replisSans = ['Segoe UI', 'system-ui', 'sans-serif'];

export default defineConfig({
  site: 'https://bresnik-www.nkobrs21.workers.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Bricolage Grotesque',
      cssVariable: '--police-titres',
      weights: ['500 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: replisSans,
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Source Sans 3',
      cssVariable: '--police-texte',
      weights: ['400 600'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: replisSans,
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--police-technique',
      weights: [500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Consolas', 'ui-monospace', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Si `astro check` refuse `weights: ['500 700']` pour une police variable, remplacer par `weights: [500, 600, 700]` (et `[400, 600]` pour Source Sans 3) et le noter dans le rapport.

- [ ] **Étape 3 : Tokens**

Remplacer `src/styles/tokens.css` par :

```css
/* Tokens de la marque Bresnik, direction « Atelier technique ».
   Réutilisables par les applications : ne rien ajouter ici sans l'inscrire
   dans la spécification design. */
:root {
  --couleur-papier: #faf8f4;
  --couleur-papier-2: #f1ede4;
  --couleur-encre: #1c2331;
  --couleur-encre-2: #4f5868;
  --couleur-encre-claire: #c9cfdb;
  --couleur-ligne: #e2ddd2;
  --couleur-blanc: #ffffff;
  --couleur-cobalt: #1f4fc7;
  --couleur-cobalt-fonce: #183f9f;
  --couleur-cobalt-teinte: #e6ecfa;
  --couleur-ambre: #8f620f;
  --couleur-ambre-teinte: #fbf1dd;

  --ombre-capture: 0 24px 48px -32px rgb(28 35 49 / 0.35);

  --rayon-bouton: 6px;
  --rayon-carte: 8px;
  --rayon-cadre: 10px;
  --rayon-bande: 12px;
}
```

- [ ] **Étape 4 : Feuille globale**

Remplacer `src/styles/global.css` par :

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@import "./tokens.css";

@theme inline {
  --color-papier: var(--couleur-papier);
  --color-papier-2: var(--couleur-papier-2);
  --color-encre: var(--couleur-encre);
  --color-encre-2: var(--couleur-encre-2);
  --color-encre-claire: var(--couleur-encre-claire);
  --color-ligne: var(--couleur-ligne);
  --color-blanc: var(--couleur-blanc);
  --color-cobalt: var(--couleur-cobalt);
  --color-cobalt-fonce: var(--couleur-cobalt-fonce);
  --color-cobalt-teinte: var(--couleur-cobalt-teinte);
  --color-ambre: var(--couleur-ambre);
  --color-ambre-teinte: var(--couleur-ambre-teinte);

  --font-titres: var(--police-titres);
  --font-texte: var(--police-texte);
  --font-technique: var(--police-technique);

  --shadow-capture: var(--ombre-capture);

  --radius-bouton: var(--rayon-bouton);
  --radius-carte: var(--rayon-carte);
  --radius-cadre: var(--rayon-cadre);
  --radius-bande: var(--rayon-bande);
}

@layer base {
  html {
    font-family: var(--police-texte);
    background: var(--couleur-papier);
    color: var(--couleur-encre);
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4 {
    font-family: var(--police-titres);
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  p {
    text-wrap: pretty;
  }
  a {
    color: var(--couleur-cobalt);
    transition: color 150ms;
  }
  a:hover {
    color: var(--couleur-cobalt-fonce);
  }
  :focus-visible {
    outline: 2px solid var(--couleur-cobalt);
    outline-offset: 2px;
  }
}

@utility conteneur {
  @apply mx-auto w-full max-w-[1440px] px-5 lg:px-20;
}

@utility eyebrow {
  @apply font-technique text-[13px] uppercase tracking-[0.08em] text-cobalt max-md:text-[12px];
}

@utility technique {
  @apply font-technique text-[13px] text-encre-2 max-md:text-[12px];
}

/* Markdown : pages éditoriales et articles. */
.prose {
  --tw-prose-body: var(--couleur-encre);
  --tw-prose-headings: var(--couleur-encre);
  --tw-prose-lead: var(--couleur-encre-2);
  --tw-prose-links: var(--couleur-cobalt);
  --tw-prose-bold: var(--couleur-encre);
  --tw-prose-counters: var(--couleur-cobalt);
  --tw-prose-bullets: var(--couleur-cobalt);
  --tw-prose-hr: var(--couleur-ligne);
  --tw-prose-quotes: var(--couleur-encre);
  --tw-prose-quote-borders: var(--couleur-cobalt);
  --tw-prose-captions: var(--couleur-encre-2);
  --tw-prose-code: var(--couleur-encre);
  --tw-prose-pre-code: var(--couleur-papier);
  --tw-prose-pre-bg: var(--couleur-encre);
  --tw-prose-th-borders: var(--couleur-ligne);
  --tw-prose-td-borders: var(--couleur-ligne);
}
.prose a {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.prose code {
  font-family: var(--police-technique);
  font-weight: 500;
}
```

- [ ] **Étape 5 : Icônes**

`src/components/Icone.astro` :

```astro
---
interface Props {
  nom: 'fleche' | 'coche' | 'menu';
  taille?: number;
  class?: string;
}

const { nom, taille = 18, class: classe = '' } = Astro.props;
---
<svg
  width={taille}
  height={taille}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  class={classe}
>
  {nom === 'fleche' && (
    <>
      <path d="M5 12h14"></path>
      <path d="M13 6l6 6-6 6"></path>
    </>
  )}
  {nom === 'coche' && <path d="M20 6L9 17l-5-5"></path>}
  {nom === 'menu' && (
    <>
      <path d="M4 7h16"></path>
      <path d="M4 12h16"></path>
      <path d="M4 17h16"></path>
    </>
  )}
</svg>
```

- [ ] **Étape 6 : Layout de base**

Remplacer `src/layouts/Base.astro` par :

```astro
---
import '../styles/global.css';
import { Font } from 'astro:assets';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  titre: string;
  description: string;
  typeOg?: 'website' | 'article';
  sansSuffixe?: boolean;
  image?: string;
  noindex?: boolean;
}

const {
  titre,
  description,
  typeOg = 'website',
  sansSuffixe = false,
  image = '/og-default.png',
  noindex = false,
} = Astro.props;
const titreComplet = sansSuffixe ? titre : `${titre} · Bresnik`;
const urlCanonique = new URL(Astro.url.pathname, Astro.site);
const urlImage = new URL(image, Astro.site);
const jetonAnalytics = import.meta.env.PUBLIC_CF_BEACON_TOKEN;
---
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{titreComplet}</title>
    <meta name="description" content={description} />
    {noindex && <meta name="robots" content="noindex" />}
    <meta name="theme-color" content="#faf8f4" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="canonical" href={urlCanonique} />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <link rel="alternate" type="application/rss+xml" title="Blog Bresnik" href={new URL('/rss.xml', Astro.site)} />
    <meta property="og:type" content={typeOg} />
    <meta property="og:title" content={titreComplet} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={urlCanonique} />
    <meta property="og:site_name" content="Bresnik" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:image" content={urlImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="generator" content={Astro.generator} />
    <Font cssVariable="--police-titres" preload />
    <Font cssVariable="--police-texte" preload />
    <Font cssVariable="--police-technique" />
  </head>
  <body class="min-h-screen bg-papier font-texte text-encre">
    <a
      href="#contenu"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-bouton focus:bg-cobalt focus:px-4 focus:py-2 focus:font-semibold focus:text-blanc"
    >
      Aller au contenu
    </a>
    <Header />
    <main id="contenu">
      <slot />
    </main>
    <Footer />
    {jetonAnalytics && (
      <script
        is:inline
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={JSON.stringify({ token: jetonAnalytics })}
      ></script>
    )}
  </body>
</html>
```

Le `Header.astro` et le `Footer.astro` existants continuent de fonctionner (ils sont réécrits en tâche 4). Les pages existantes perdent la marge interne que `<main>` leur donnait : c'est attendu, elles sont réécrites dans les tâches 5 à 7.

- [ ] **Étape 7 : Vérifier**

Run : `npm run check && npm run build && ls dist/_astro | grep -ci "woff2" && grep -c "fonts.googleapis" dist/index.html; grep -o 'href="#contenu"' dist/index.html && grep -o 'rel="preload"[^>]*' dist/index.html | head -3`

Expected : `0 errors` ; au moins `3` fichiers `woff2` dans `dist/_astro` (polices téléchargées et auto-hébergées) ; `0` occurrence de Google Fonts ; le lien d'évitement est présent ; au moins deux `rel="preload"` de polices. Le build a besoin du réseau une première fois pour télécharger les polices (cache ensuite dans `node_modules/.astro`).

Puis `npm test` : 11 tests passent toujours.

- [ ] **Étape 8 : Commit**

```bash
git add -A
git commit -m "feat(design): tokens de la charte, polices auto-hébergées, layout de base accessible

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2 : Favicon et image de partage générés par script

**Files:**
- Create: `scripts/generer-og.mjs`, `tests/scripts/images.test.ts`, `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png`, `public/og-default.png`
- Modify: `package.json` (dépendances et script `generer-images`)

**Interfaces:**
- Produces: les quatre fichiers de `public/` référencés par `Base.astro` (tâche 1) ; script `npm run generer-images` rejouable.

- [ ] **Étape 1 : Dépendances**

Run : `npm install --save-dev satori@^0.33.4 @resvg/resvg-js@^2.6.2 @fontsource/bricolage-grotesque@^5.3.0 @fontsource/source-sans-3@^5.3.0`

Ajouter dans `package.json`, section `scripts` : `"generer-images": "node scripts/generer-og.mjs"`.

- [ ] **Étape 2 : Test des dimensions (échec attendu)**

`tests/scripts/images.test.ts` :

```ts
import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function dimensionsPng(chemin: string) {
  const octets = readFileSync(chemin);
  return { largeur: octets.readUInt32BE(16), hauteur: octets.readUInt32BE(20) };
}

describe('images générées dans public/', () => {
  it('og-default.png fait 1200 × 630', () => {
    expect(dimensionsPng('public/og-default.png')).toEqual({ largeur: 1200, hauteur: 630 });
  });

  it('favicon-32.png fait 32 × 32 et apple-touch-icon.png 180 × 180', () => {
    expect(dimensionsPng('public/favicon-32.png')).toEqual({ largeur: 32, hauteur: 32 });
    expect(dimensionsPng('public/apple-touch-icon.png')).toEqual({ largeur: 180, hauteur: 180 });
  });

  it('favicon.svg est un SVG carré de 64', () => {
    expect(existsSync('public/favicon.svg')).toBe(true);
    const svg = readFileSync('public/favicon.svg', 'utf8');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 64 64"');
  });
});
```

Run : `npm test`

Expected : FAIL, fichiers absents (`ENOENT`).

- [ ] **Étape 3 : Script de génération**

`scripts/generer-og.mjs` :

```js
// Génère favicon et image Open Graph à partir des polices de la charte,
// sans navigateur. Rejouer avec `npm run generer-images` après un changement
// de charte. Les fichiers produits sont commités.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const racine = new URL('../', import.meta.url);
const chemin = (relatif) => fileURLToPath(new URL(relatif, racine));

const COULEURS = {
  papier: '#faf8f4',
  encre: '#1c2331',
  encre2: '#4f5868',
  cobalt: '#1f4fc7',
  blanc: '#ffffff',
};

const polices = [
  {
    name: 'Bricolage Grotesque',
    data: await readFile(chemin('node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff')),
    weight: 700,
    style: 'normal',
  },
  {
    name: 'Source Sans 3',
    data: await readFile(chemin('node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff')),
    weight: 400,
    style: 'normal',
  },
];

const el = (type, style, children) => ({ type, props: { style, children } });

function motSymbole(taille) {
  return el('div', { display: 'flex', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: taille, letterSpacing: -taille * 0.025, color: COULEURS.encre, lineHeight: 1 }, [
    el('span', {}, 'Bresni'),
    el('span', { color: COULEURS.cobalt }, 'k'),
  ]);
}

const arbreOg = el(
  'div',
  {
    width: 1200,
    height: 630,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 28,
    padding: '0 96px',
    background: COULEURS.papier,
    fontFamily: 'Source Sans 3',
  },
  [
    el('div', { display: 'flex', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', color: COULEURS.cobalt }, 'Logiciels pour l\u2019\u00e9cosyst\u00e8me Sage 100'),
    motSymbole(148),
    el('div', { display: 'flex', fontSize: 40, color: COULEURS.encre2, lineHeight: 1.3 }, 'Des logiciels qui compl\u00e8tent Sage 100, con\u00e7us par un consultant Sage.'),
    el('div', { display: 'flex', width: 120, height: 8, background: COULEURS.cobalt, borderRadius: 4, marginTop: 12 }, ''),
  ],
);

const arbreFavicon = el(
  'div',
  {
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: COULEURS.cobalt,
    borderRadius: 12,
    fontFamily: 'Bricolage Grotesque',
    fontWeight: 700,
    fontSize: 44,
    color: COULEURS.blanc,
  },
  'B',
);

async function svgDepuis(arbre, largeur, hauteur) {
  return satori(arbre, { width: largeur, height: hauteur, fonts: polices });
}

function pngDepuis(svg, largeur) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: largeur } }).render().asPng();
}

await mkdir(chemin('public'), { recursive: true });

const svgOg = await svgDepuis(arbreOg, 1200, 630);
await writeFile(chemin('public/og-default.png'), pngDepuis(svgOg, 1200));

const svgFavicon = await svgDepuis(arbreFavicon, 64, 64);
await writeFile(chemin('public/favicon.svg'), svgFavicon);
await writeFile(chemin('public/favicon-32.png'), pngDepuis(svgFavicon, 32));
await writeFile(chemin('public/apple-touch-icon.png'), pngDepuis(svgFavicon, 180));

console.log('Images générées : og-default.png, favicon.svg, favicon-32.png, apple-touch-icon.png');
```

Run : `npm run generer-images && ls -la public/`

Expected : les quatre fichiers existent ; `og-default.png` pèse entre 30 et 200 Ko. Si `satori` refuse une propriété CSS, la retirer (par exemple `letterSpacing` négatif) et le noter dans le rapport. Ouvrir `public/og-default.png` avec l'outil Read pour vérifier visuellement : mot-symbole avec le « k » en cobalt, sous-titre lisible, rien de tronqué.

- [ ] **Étape 4 : Tests et build**

Run : `npm test && npm run build && ls dist/og-default.png dist/favicon.svg && grep -o 'og:image" content="[^"]*"' dist/index.html`

Expected : 14 tests PASS ; les fichiers sont copiés dans `dist/` ; `og:image` vaut `https://bresnik-www.nkobrs21.workers.dev/og-default.png`.

- [ ] **Étape 5 : Commit**

```bash
git add -A
git commit -m "feat(design): favicon et image de partage générés depuis les polices de la charte

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3 : Composants de base

**Files:**
- Create: `src/components/Marque.astro`, `src/components/Bouton.astro`, `src/components/Etiquette.astro`, `src/components/EnTeteSection.astro`, `src/components/EnTetePage.astro`, `src/components/ListeCoches.astro`, `src/components/BandeAppel.astro`
- Modify: `src/lib/produits.ts`, `tests/lib/produits.test.ts`

**Interfaces:**
- Produces:
  - `Marque.astro` props `{ taille?: 'en-tete' | 'pied' }`.
  - `Bouton.astro` props `{ variante?: 'primaire' | 'secondaire' | 'inverse'; taille?: 'normal' | 'compact'; href?: string; type?: 'button' | 'submit'; fleche?: boolean; desactive?: boolean; plein?: boolean; class?: string; id?: string; 'aria-describedby'?: string }`, slot = libellé.
  - `Etiquette.astro` props `{ ton: 'cobalt' | 'ambre' | 'neutre'; class?: string }`, slot = texte.
  - `EnTeteSection.astro` props `{ id: string; eyebrow: string; titre: string; lienHref?: string; lienLibelle?: string }` ; rend `<h2 id={id}>`.
  - `EnTetePage.astro` props `{ eyebrow?: string; titre: string; sousTitre?: string; taille?: 'grand' | 'normal' }` ; rend `<h1>`.
  - `ListeCoches.astro` props `{ elements: string[]; colonnes?: 1 | 2; class?: string }`.
  - `BandeAppel.astro` props `{ titre?: string; texte?: string }`.
  - `libelleCible(cible): string` (« Entreprises » / « Consultants Sage ») ; `tonCible(cible): 'cobalt' | 'ambre'` ; `libelleAcces(disponibilite): string` (« Sur démonstration », « Téléchargement », « Essai gratuit ») ; `produitsMemeFamille<T extends { id: string; data: { cible: string; ordre: number } }>(produits: T[], courant: T, max?: number): T[]`.

- [ ] **Étape 1 : Tests des helpers (échec attendu)**

Ajouter à la fin de `tests/lib/produits.test.ts` :

```ts
import { libelleAcces, libelleCible, produitsMemeFamille, tonCible } from '../../src/lib/produits';

describe('libelleCible et tonCible', () => {
  it('nomme et colore chaque cible', () => {
    expect(libelleCible('entreprise')).toBe('Entreprises');
    expect(libelleCible('consultant')).toBe('Consultants Sage');
    expect(tonCible('entreprise')).toBe('cobalt');
    expect(tonCible('consultant')).toBe('ambre');
  });
});

describe('libelleAcces', () => {
  it('décrit l\'accès selon la disponibilité', () => {
    expect(libelleAcces('contact')).toBe('Sur démonstration');
    expect(libelleAcces('telechargement')).toBe('Téléchargement');
    expect(libelleAcces('essai')).toBe('Essai gratuit');
  });
});

describe('produitsMemeFamille', () => {
  const p = (id: string, cible: string, ordre: number) => ({ id, data: { cible, ordre } });
  const tous = [p('a', 'entreprise', 3), p('b', 'consultant', 1), p('c', 'entreprise', 1), p('d', 'entreprise', 2), p('e', 'entreprise', 4)];

  it('renvoie les autres produits de la même cible, triés par ordre, limités à trois', () => {
    expect(produitsMemeFamille(tous, tous[0]).map((x) => x.id)).toEqual(['c', 'd', 'e']);
  });

  it('exclut le produit courant et respecte la limite demandée', () => {
    expect(produitsMemeFamille(tous, tous[2], 1).map((x) => x.id)).toEqual(['d']);
  });

  it('renvoie une liste vide quand le produit est seul de sa cible', () => {
    expect(produitsMemeFamille(tous, tous[1])).toEqual([]);
  });
});
```

Placer l'`import` en tête de fichier avec les autres imports (un fichier de test n'a qu'un bloc d'imports). Run : `npm test` → FAIL, exports introuvables.

- [ ] **Étape 2 : Helpers**

Ajouter à la fin de `src/lib/produits.ts` :

```ts
export type Cible = 'consultant' | 'entreprise';

export function libelleCible(cible: Cible): string {
  return cible === 'consultant' ? 'Consultants Sage' : 'Entreprises';
}

export function tonCible(cible: Cible): 'cobalt' | 'ambre' {
  return cible === 'consultant' ? 'ambre' : 'cobalt';
}

export function libelleAcces(disponibilite: Disponibilite): string {
  switch (disponibilite) {
    case 'contact':
      return 'Sur démonstration';
    case 'telechargement':
      return 'Téléchargement';
    case 'essai':
      return 'Essai gratuit';
  }
}

export function produitsMemeFamille<T extends { id: string; data: { cible: string; ordre: number } }>(
  produits: T[],
  courant: T,
  max = 3,
): T[] {
  return produits
    .filter((p) => p.id !== courant.id && p.data.cible === courant.data.cible)
    .sort((a, b) => a.data.ordre - b.data.ordre)
    .slice(0, max);
}
```

Run : `npm test` → tous PASS.

- [ ] **Étape 3 : Marque**

`src/components/Marque.astro` :

```astro
---
interface Props {
  taille?: 'en-tete' | 'pied';
}

const { taille = 'en-tete' } = Astro.props;
const classeTaille = taille === 'en-tete' ? 'text-[24px] lg:text-[26px]' : 'text-[22px]';
---
<a href="/" class={`font-titres font-bold tracking-[-0.02em] text-encre hover:text-encre ${classeTaille}`} aria-label="Bresnik, accueil">
  Bresni<span class="text-cobalt">k</span>
</a>
```

- [ ] **Étape 4 : Bouton**

`src/components/Bouton.astro` :

```astro
---
import Icone from './Icone.astro';

interface Props {
  variante?: 'primaire' | 'secondaire' | 'inverse';
  taille?: 'normal' | 'compact';
  href?: string;
  type?: 'button' | 'submit';
  fleche?: boolean;
  desactive?: boolean;
  plein?: boolean;
  class?: string;
  id?: string;
  'aria-describedby'?: string;
}

const {
  variante = 'primaire',
  taille = 'normal',
  href,
  type = 'button',
  fleche = false,
  desactive = false,
  plein = false,
  class: classe = '',
  id,
  'aria-describedby': decritPar,
} = Astro.props;

const base = 'inline-flex items-center justify-center gap-2 rounded-bouton font-semibold transition-colors duration-150';
const variantes = {
  primaire: 'bg-cobalt text-blanc hover:bg-cobalt-fonce hover:text-blanc',
  secondaire: 'border-[1.5px] border-encre text-encre hover:bg-papier-2 hover:text-encre',
  inverse: 'bg-blanc text-encre hover:bg-papier-2 hover:text-encre',
};
const tailles = {
  normal: 'h-[52px] px-6 text-[17px]',
  compact: 'h-11 px-[18px] text-[15px]',
};
const classes = [
  base,
  variantes[variante],
  tailles[taille],
  plein ? 'w-full' : '',
  desactive ? 'cursor-not-allowed opacity-60' : '',
  classe,
].join(' ');
---
{href && !desactive ? (
  <a href={href} class={classes} id={id}>
    <slot />
    {fleche && <Icone nom="fleche" />}
  </a>
) : (
  <button type={type} class={classes} id={id} disabled={desactive} aria-describedby={decritPar}>
    <slot />
    {fleche && <Icone nom="fleche" />}
  </button>
)}
```

- [ ] **Étape 5 : Étiquette**

`src/components/Etiquette.astro` :

```astro
---
interface Props {
  ton: 'cobalt' | 'ambre' | 'neutre';
  class?: string;
}

const { ton, class: classe = '' } = Astro.props;
const tons = {
  cobalt: 'bg-cobalt-teinte text-cobalt',
  ambre: 'bg-ambre-teinte text-ambre',
  neutre: 'bg-papier-2 text-encre-2',
};
---
<span class={`inline-flex h-[26px] items-center rounded-full px-2.5 font-technique text-[12px] uppercase tracking-[0.04em] max-md:h-6 max-md:text-[11px] ${tons[ton]} ${classe}`}>
  <slot />
</span>
```

- [ ] **Étape 6 : En-têtes de section et de page**

`src/components/EnTeteSection.astro` :

```astro
---
import Icone from './Icone.astro';

interface Props {
  id: string;
  eyebrow: string;
  titre: string;
  lienHref?: string;
  lienLibelle?: string;
}

const { id, eyebrow, titre, lienHref, lienLibelle } = Astro.props;
---
<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
  <div class="flex flex-col gap-2.5">
    <p class="eyebrow">{eyebrow}</p>
    <h2 id={id} class="text-[28px] font-bold leading-[1.12] md:text-[40px] md:leading-[1.1]">{titre}</h2>
  </div>
  {lienHref && lienLibelle && (
    <a href={lienHref} class="inline-flex items-center gap-1.5 text-[16px] font-semibold">
      {lienLibelle}
      <Icone nom="fleche" taille={16} />
    </a>
  )}
</div>
```

`src/components/EnTetePage.astro` :

```astro
---
interface Props {
  eyebrow?: string;
  titre: string;
  sousTitre?: string;
  taille?: 'grand' | 'normal';
}

const { eyebrow, titre, sousTitre, taille = 'normal' } = Astro.props;
const classeTitre =
  taille === 'grand'
    ? 'text-[38px] leading-[1.06] tracking-[-0.02em] md:text-[64px] md:leading-[1.04] md:tracking-[-0.025em]'
    : 'text-[34px] leading-[1.08] tracking-[-0.02em] md:text-[48px] md:leading-[1.06]';
---
<header class="conteneur flex flex-col gap-4 pb-10 pt-10 md:gap-5 md:pb-14 md:pt-14">
  {eyebrow && <p class="eyebrow">{eyebrow}</p>}
  <h1 class={`font-bold ${classeTitre}`}>{titre}</h1>
  {sousTitre && <p class="max-w-[760px] text-[18px] leading-[1.5] text-encre-2 md:text-[22px] md:leading-[1.45]">{sousTitre}</p>}
</header>
```

- [ ] **Étape 7 : Liste à coches et bande d'appel**

`src/components/ListeCoches.astro` :

```astro
---
import Icone from './Icone.astro';

interface Props {
  elements: string[];
  colonnes?: 1 | 2;
  class?: string;
}

const { elements, colonnes = 1, class: classe = '' } = Astro.props;
const disposition = colonnes === 2 ? 'grid gap-3.5 md:grid-cols-2' : 'flex flex-col gap-3.5';
---
<ul class={`${disposition} ${classe}`}>
  {elements.map((element) => (
    <li class="flex items-start gap-3.5 rounded-carte border border-ligne bg-blanc px-5 py-4">
      <Icone nom="coche" taille={22} class="mt-0.5 shrink-0 text-cobalt" />
      <span class="text-[17px] leading-[1.45]">{element}</span>
    </li>
  ))}
</ul>
```

`src/components/BandeAppel.astro` :

```astro
---
import Bouton from './Bouton.astro';

interface Props {
  titre?: string;
  texte?: string;
}

const {
  titre = 'Voyons ce que vos données Sage peuvent faire de plus.',
  texte = 'Une démonstration de 30 minutes sur votre cas, sans engagement.',
} = Astro.props;
---
<div class="conteneur">
  <section
    aria-labelledby="bande-appel"
    class="flex flex-col gap-5 rounded-bande bg-encre px-6 py-7 text-blanc md:flex-row md:items-center md:justify-between md:gap-12 md:px-16 md:py-14"
  >
    <div class="flex max-w-[720px] flex-col gap-2.5">
      <h2 id="bande-appel" class="text-[26px] font-bold leading-[1.15] text-blanc md:text-[34px]">{titre}</h2>
      <p class="text-[16px] leading-[1.5] text-encre-claire md:text-[18px]">{texte}</p>
    </div>
    <Bouton href="/contact/" variante="inverse" fleche class="shrink-0 max-md:w-full">Demander une démo</Bouton>
  </section>
</div>
```

- [ ] **Étape 8 : Vérifier**

Run : `npm run check && npm test && npm run build`

Expected : `0 errors`, tous les tests PASS, build réussi (les composants ne sont pas encore utilisés par les pages, `astro check` valide leur syntaxe et leurs types).

- [ ] **Étape 9 : Commit**

```bash
git add -A
git commit -m "feat(design): composants de base (marque, bouton, étiquette, en-têtes, liste à coches, bande d'appel)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4 : En-tête avec menu mobile et pied de page

**Files:**
- Modify: `src/components/Header.astro`, `src/components/Footer.astro`

**Interfaces:**
- Consumes: `Marque`, `Bouton`, `Icone`.
- Produces: en-tête et pied de page conformes à la maquette, menu mobile accessible.

- [ ] **Étape 1 : En-tête**

Remplacer `src/components/Header.astro` par :

```astro
---
import Marque from './Marque.astro';
import Bouton from './Bouton.astro';
import Icone from './Icone.astro';

const liens = [
  { href: '/produits/', libelle: 'Produits' },
  { href: '/conseil/', libelle: 'Conseil' },
  { href: '/blog/', libelle: 'Blog' },
  { href: '/contact/', libelle: 'Contact' },
];
const cheminCourant = Astro.url.pathname;
const estActif = (href: string) => cheminCourant.startsWith(href);
const classeLien = (href: string) =>
  estActif(href)
    ? 'border-b-2 border-cobalt pb-0.5 font-semibold text-cobalt'
    : 'font-semibold text-encre hover:text-cobalt';
---
<header class="border-b border-ligne bg-papier">
  <div class="conteneur flex h-16 items-center justify-between lg:h-20">
    <Marque />
    <nav aria-label="Navigation principale" class="hidden items-center gap-8 lg:flex">
      {liens.map((lien) => (
        <a href={lien.href} aria-current={estActif(lien.href) ? 'page' : undefined} class={`text-[16px] ${classeLien(lien.href)}`}>
          {lien.libelle}
        </a>
      ))}
      <Bouton href="/contact/" taille="compact">Demander une démo</Bouton>
    </nav>
    <button
      id="bouton-menu"
      type="button"
      class="inline-flex h-11 w-11 items-center justify-center rounded-bouton border border-ligne bg-blanc text-encre lg:hidden"
      aria-expanded="false"
      aria-controls="menu-mobile"
      aria-label="Menu"
    >
      <Icone nom="menu" taille={22} />
    </button>
  </div>
  <nav id="menu-mobile" aria-label="Navigation mobile" hidden class="border-t border-ligne lg:hidden">
    <ul class="conteneur flex flex-col gap-1 py-3">
      {liens.map((lien) => (
        <li>
          <a href={lien.href} aria-current={estActif(lien.href) ? 'page' : undefined} class={`block py-3 text-[17px] ${classeLien(lien.href)}`}>
            {lien.libelle}
          </a>
        </li>
      ))}
      <li class="pt-2">
        <Bouton href="/contact/" plein>Demander une démo</Bouton>
      </li>
    </ul>
  </nav>
</header>

<script>
  const bouton = document.getElementById('bouton-menu');
  const menu = document.getElementById('menu-mobile');
  if (bouton && menu) {
    const basculer = (ouvert: boolean) => {
      bouton.setAttribute('aria-expanded', String(ouvert));
      menu.hidden = !ouvert;
    };
    bouton.addEventListener('click', () => basculer(bouton.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && bouton.getAttribute('aria-expanded') === 'true') {
        basculer(false);
        bouton.focus();
      }
    });
  }
</script>
```

Note : sur la page d'accueil aucun lien n'est actif (comportement voulu, la marque y mène).

- [ ] **Étape 2 : Pied de page**

Remplacer `src/components/Footer.astro` par :

```astro
---
import Marque from './Marque.astro';
---
<footer class="mt-16 border-t border-ligne md:mt-24">
  <div class="conteneur flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between md:gap-6 md:py-8">
    <div class="flex flex-col gap-1.5">
      <Marque taille="pied" />
      <p class="text-[13px] leading-[1.5] text-encre-2 md:text-[14px]">
        © 2026 Bresnik. Logiciels complémentaires pour l'écosystème Sage 100. Éditeur indépendant, sans lien avec Sage Group plc.
      </p>
    </div>
    <nav aria-label="Liens secondaires">
      <ul class="flex flex-wrap gap-4 md:gap-6">
        <li><a href="/mentions-legales/" class="text-[14px] text-encre-2 hover:text-cobalt">Mentions légales</a></li>
        <li><a href="/confidentialite/" class="text-[14px] text-encre-2 hover:text-cobalt">Confidentialité</a></li>
        <li><a href="/rss.xml" class="text-[14px] text-encre-2 hover:text-cobalt">Flux RSS</a></li>
      </ul>
    </nav>
  </div>
</footer>
```

- [ ] **Étape 3 : Vérifier**

Run : `npm run check && npm run build && grep -c 'aria-expanded="false"' dist/index.html && grep -c 'id="menu-mobile"' dist/index.html && grep -o 'aria-current="page"' dist/produits/index.html | wc -l && grep -c "2026 Bresnik" dist/index.html`

Expected : `0 errors` ; `1` ; `1` ; `2` (lien Produits actif dans les deux navigations) ; `1`.

Puis test manuel : `npm run dev`, ouvrir `http://localhost:4321/` avec une fenêtre de moins de 1024 px de large, cliquer sur le bouton Menu : le panneau apparaît, `aria-expanded` passe à `true`, la touche Échap le referme et rend le focus au bouton. Arrêter le serveur. Décrire le résultat dans le rapport.

- [ ] **Étape 4 : Commit**

```bash
git add -A
git commit -m "feat(design): en-tête avec menu mobile accessible et pied de page

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5 : Composants produits, fiche produit et catalogue

**Files:**
- Modify: `src/components/CarteProduit.astro`, `src/pages/produits/[id].astro`, `src/pages/produits/index.astro`
- Create: `src/components/CarteAppel.astro`, `src/components/CadreCapture.astro`, `src/components/FicheTechnique.astro`

**Interfaces:**
- Consumes: `Etiquette`, `Bouton`, `Icone`, `EnTetePage`, `BandeAppel`, `ListeCoches`, `libelleCible`, `tonCible`, `libelleAcces`, `produitsMemeFamille`, `actionProduit`, `produitsPublies`.
- Produces: `CarteProduit.astro` props `{ produit: CollectionEntry<'produits'>; niveauTitre?: 'h2' | 'h3' }` ; `CarteAppel.astro` sans props ; `CadreCapture.astro` props `{ titre: string; image?: ImageMetadata; alt?: string }` ; `FicheTechnique.astro` props `{ produit: CollectionEntry<'produits'> }`.

- [ ] **Étape 1 : Carte produit**

Remplacer `src/components/CarteProduit.astro` par :

```astro
---
import type { CollectionEntry } from 'astro:content';
import Etiquette from './Etiquette.astro';
import { libelleCible, tonCible } from '../lib/produits';

interface Props {
  produit: CollectionEntry<'produits'>;
  niveauTitre?: 'h2' | 'h3';
}

const { produit, niveauTitre = 'h3' } = Astro.props;
const Titre = niveauTitre;
const modules = produit.data.modulesSage.length > 0 ? produit.data.modulesSage.join(', ') : 'Sage · Windows · SQL Server';
---
<article class="relative flex flex-col gap-2.5 rounded-carte border border-ligne bg-blanc p-5 transition-colors duration-150 hover:border-cobalt md:p-7">
  <Etiquette ton={tonCible(produit.data.cible)} class="self-start">{libelleCible(produit.data.cible)}</Etiquette>
  <Titre class="mt-1.5 text-[22px] font-semibold leading-[1.25] md:text-[24px]">
    <a href={`/produits/${produit.id}/`} class="text-encre after:absolute after:inset-0 after:content-[''] hover:text-encre">{produit.data.nom}</a>
  </Titre>
  <p class="text-[16px] leading-[1.45] md:text-[17px] md:leading-[1.5]">{produit.data.accroche}</p>
  <p class="technique">{modules}</p>
</article>
```

- [ ] **Étape 2 : Carte d'appel, cadre de capture, fiche technique**

`src/components/CarteAppel.astro` :

```astro
---
import Icone from './Icone.astro';
---
<div class="flex flex-col justify-between gap-4 rounded-carte bg-encre p-5 text-blanc md:p-7">
  <p class="font-titres text-[22px] font-semibold leading-[1.25] md:text-[24px]">Un besoin qui n'est pas dans la liste ?</p>
  <p class="text-[16px] leading-[1.5] text-encre-claire md:text-[17px]">
    Chaque outil est né d'une mission. Décrivez le vôtre, on regarde ensemble si un logiciel peut y répondre.
  </p>
  <a href="/contact/" class="inline-flex items-center gap-1.5 text-[16px] font-semibold text-blanc hover:text-encre-claire">
    Nous écrire
    <Icone nom="fleche" taille={16} />
  </a>
</div>
```

`src/components/CadreCapture.astro` :

```astro
---
import type { ImageMetadata } from 'astro';
import { Image } from 'astro:assets';

interface Props {
  titre: string;
  image?: ImageMetadata;
  alt?: string;
}

const { titre, image, alt = '' } = Astro.props;
const lignes = [
  ['fonce', 'fonce', 'fonce', 'fonce'],
  ['clair', 'clair', 'teinte', 'clair'],
  ['clair', 'clair', 'cobalt', 'clair'],
  ['clair', 'clair', 'teinte', 'clair'],
  ['clair', 'clair', 'cobalt', 'clair'],
  ['clair', 'clair', 'teinte', 'clair'],
];
const teintes: Record<string, string> = {
  fonce: 'bg-encre opacity-60',
  clair: 'bg-ligne',
  teinte: 'bg-cobalt-teinte',
  cobalt: 'bg-cobalt',
};
---
<figure class="flex flex-col gap-3">
  <div class="overflow-hidden rounded-cadre border border-ligne bg-blanc shadow-capture">
    <div class="flex h-10 items-center gap-2 border-b border-ligne bg-papier-2 px-3.5">
      <span class="h-2.5 w-2.5 rounded-full bg-[#d9d2c4]"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-[#d9d2c4]"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-[#d9d2c4]"></span>
      <span class="ml-2 technique text-[12px]">{titre}</span>
    </div>
    {image ? (
      <Image src={image} alt={alt} width={800} class="block h-auto w-full" />
    ) : (
      <div class="flex flex-col gap-2.5 p-4" aria-hidden="true">
        {lignes.map((ligne) => (
          <div class="grid grid-cols-4 gap-2.5">
            {ligne.map((teinte) => <span class={`h-2.5 rounded-[3px] ${teintes[teinte]}`}></span>)}
          </div>
        ))}
        <div class="mt-1.5 flex justify-end gap-2">
          <span class="h-8 w-[110px] rounded-[5px] border-[1.5px] border-ligne"></span>
          <span class="h-8 w-[140px] rounded-[5px] bg-cobalt"></span>
        </div>
      </div>
    )}
  </div>
  {!image && <figcaption class="technique text-center text-[12px]">Capture d'écran à venir</figcaption>}
</figure>
```

`src/components/FicheTechnique.astro` :

```astro
---
import type { CollectionEntry } from 'astro:content';
import Bouton from './Bouton.astro';
import { actionProduit, libelleAcces } from '../lib/produits';

interface Props {
  produit: CollectionEntry<'produits'>;
}

const { produit } = Astro.props;
const action = actionProduit(produit.data.disponibilite, produit.id);
const modules = produit.data.modulesSage.length > 0 ? produit.data.modulesSage.join(', ') : 'Indépendant des modules';
const lignes = [
  ['Plateforme', produit.data.plateforme],
  ['Modules Sage', modules],
  ['Objets métiers', produit.data.objetsMetiersSage ? 'Oui' : 'Non'],
  ['Accès', libelleAcces(produit.data.disponibilite)],
];
---
<aside aria-labelledby="fiche-technique" class="flex flex-col gap-5 rounded-cadre border border-ligne bg-blanc p-6 md:p-7 lg:sticky lg:top-6">
  <h2 id="fiche-technique" class="text-[20px] font-bold">Fiche technique</h2>
  <dl class="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-[18px] gap-y-3 text-[15px]">
    {lignes.map(([libelle, valeur]) => (
      <>
        <dt class="pt-[3px] font-technique text-[12px] uppercase tracking-[0.04em] text-encre-2">{libelle}</dt>
        <dd class="font-semibold">{valeur}</dd>
      </>
    ))}
  </dl>
  <div class="h-px bg-ligne"></div>
  {action.actif && action.href ? (
    <Bouton href={action.href} taille="compact" plein>{action.libelle}</Bouton>
  ) : (
    <div class="flex flex-col gap-2">
      <Bouton desactive taille="compact" plein aria-describedby="mention-acces">{action.libelle}</Bouton>
      <p id="mention-acces" class="technique text-center">{action.mention}</p>
    </div>
  )}
  <p class="text-[14px] leading-[1.5] text-encre-2">
    Une question technique avant ? <a href={`/contact/?produit=${produit.id}`}>Écrivez-nous</a>, le formulaire arrive pré-rempli.
  </p>
</aside>
```

- [ ] **Étape 3 : Fiche produit**

Remplacer `src/pages/produits/[id].astro` par :

```astro
---
import { render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import Etiquette from '../../components/Etiquette.astro';
import Bouton from '../../components/Bouton.astro';
import ListeCoches from '../../components/ListeCoches.astro';
import CadreCapture from '../../components/CadreCapture.astro';
import FicheTechnique from '../../components/FicheTechnique.astro';
import { actionProduit, libelleCible, produitsMemeFamille, tonCible } from '../../lib/produits';
import { produitsPublies } from '../../lib/catalogue';

export async function getStaticPaths() {
  const produits = await produitsPublies();
  return produits.map((produit) => ({
    params: { id: produit.id },
    props: { produit, famille: produitsMemeFamille(produits, produit) },
  }));
}

const { produit, famille } = Astro.props;
const { Content } = await render(produit);
const action = actionProduit(produit.data.disponibilite, produit.id);
---
<Base titre={produit.data.nom} description={produit.data.accroche}>
  <header class="border-b border-ligne">
    <div class="conteneur flex flex-col gap-4 pb-10 pt-10 md:gap-5 md:pb-12 md:pt-14">
      <nav aria-label="Fil d'Ariane" class="technique">
        <a href="/produits/" class="text-encre-2 hover:text-cobalt">Produits</a> / {produit.data.nom}
      </nav>
      <Etiquette ton={tonCible(produit.data.cible)} class="self-start">{libelleCible(produit.data.cible)}</Etiquette>
      <h1 class="text-[40px] font-bold leading-[1.06] tracking-[-0.02em] md:text-[60px] md:leading-[1.05] md:tracking-[-0.025em]">{produit.data.nom}</h1>
      <p class="max-w-[760px] text-[18px] leading-[1.5] text-encre-2 md:text-[24px] md:leading-[1.4]">{produit.data.accroche}</p>
      <div class="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
        {action.actif && action.href ? (
          <Bouton href={action.href} fleche class="max-md:w-full">{action.libelle}</Bouton>
        ) : (
          <>
            <Bouton desactive aria-describedby="mention-action" class="max-md:w-full">{action.libelle}</Bouton>
            <p id="mention-action" class="technique">{action.mention}</p>
          </>
        )}
        {action.actif && <p class="technique">Réponse sous deux jours ouvrés</p>}
      </div>
    </div>
  </header>

  <div class="conteneur grid gap-10 pb-16 pt-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)] lg:gap-16 lg:pb-20 lg:pt-16">
    <div class="flex flex-col gap-10 md:gap-12">
      <section class="prose prose-lg max-w-none" aria-label="Description">
        <Content />
      </section>

      <section aria-labelledby="fonctionnalites" class="flex flex-col gap-4">
        <h2 id="fonctionnalites" class="text-[24px] font-bold leading-[1.15] md:text-[30px]">Fonctionnalités</h2>
        <ListeCoches elements={produit.data.fonctionnalites} colonnes={2} />
      </section>

      <section aria-labelledby="captures" class="flex flex-col gap-4">
        <h2 id="captures" class="text-[24px] font-bold leading-[1.15] md:text-[30px]">Captures d'écran</h2>
        <div class="grid gap-4 md:grid-cols-2">
          {produit.data.captures.length > 0 ? (
            produit.data.captures.map((capture) => <CadreCapture titre={produit.data.nom} image={capture.src} alt={capture.alt} />)
          ) : (
            <CadreCapture titre={produit.data.nom} />
          )}
        </div>
      </section>
    </div>

    <FicheTechnique produit={produit} />
  </div>

  {famille.length > 0 && (
    <section aria-labelledby="famille" class="conteneur flex flex-col gap-5 pb-16 lg:pb-20">
      <h2 id="famille" class="text-[24px] font-bold">Dans la même famille</h2>
      <div class="grid gap-4 md:grid-cols-3">
        {famille.map((autre) => (
          <a href={`/produits/${autre.id}/`} class="flex flex-col gap-1.5 rounded-carte border border-ligne bg-blanc px-5 py-5 text-encre transition-colors duration-150 hover:border-cobalt hover:text-encre">
            <span class="font-titres text-[20px] font-semibold">{autre.data.nom}</span>
            <span class="text-[15px] text-encre-2">{autre.data.accroche}</span>
          </a>
        ))}
      </div>
    </section>
  )}
</Base>
```

- [ ] **Étape 4 : Catalogue**

Remplacer `src/pages/produits/index.astro` par :

```astro
---
import Base from '../../layouts/Base.astro';
import EnTetePage from '../../components/EnTetePage.astro';
import CarteProduit from '../../components/CarteProduit.astro';
import BandeAppel from '../../components/BandeAppel.astro';
import { produitsPublies } from '../../lib/catalogue';

const produits = await produitsPublies();
const pourEntreprises = produits.filter((p) => p.data.cible === 'entreprise');
const pourConsultants = produits.filter((p) => p.data.cible === 'consultant');
---
<Base titre="Produits" description="Logiciels Bresnik complémentaires à Sage 100 : comptabilité, gestion commerciale, outils pour consultants.">
  <EnTetePage
    eyebrow="Produits"
    titre="Cinq outils, cinq besoins rencontrés sur le terrain."
    sousTitre="Des logiciels Windows qui complètent Sage 100, conçus par un consultant Sage."
    taille="grand"
  />

  <section aria-labelledby="entreprises" class="conteneur flex flex-col gap-5 pb-12 md:pb-16">
    <h2 id="entreprises" class="text-[24px] font-bold leading-[1.15] md:text-[30px]">Pour les entreprises utilisatrices de Sage 100</h2>
    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {pourEntreprises.map((produit) => <CarteProduit produit={produit} />)}
    </div>
  </section>

  <section aria-labelledby="consultants" class="conteneur flex flex-col gap-5 pb-16 md:pb-24">
    <h2 id="consultants" class="text-[24px] font-bold leading-[1.15] md:text-[30px]">Pour les consultants Sage</h2>
    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {pourConsultants.map((produit) => <CarteProduit produit={produit} />)}
    </div>
  </section>

  <BandeAppel />
</Base>
```

- [ ] **Étape 5 : Vérifier**

Run : `npm run check && npm test && npm run build && grep -c "Dans la même famille" dist/produits/bankbridge/index.html && grep -c "Dans la même famille" dist/produits/bocs/index.html && grep -o 'href="/produits/[a-z-]*/"' dist/produits/bankbridge/index.html | sort -u && grep -c "Capture d'écran à venir" dist/produits/bocs/index.html && grep -c 'href="/contact/?produit=bocs"' dist/produits/bocs/index.html`

Expected : `0 errors`, tests PASS, build réussi ; BankBridge a une section « Dans la même famille » (`1`) et BOCS non (`0`, seul consultant) ; la fiche BankBridge lie vers `fec-analyzer`, `majtarifpq`, `linkcsvsage` ; BOCS affiche le cadre vide (`1`) ; le lien de démo pré-rempli apparaît au moins deux fois (`2` ou plus : en-tête et fiche technique).

- [ ] **Étape 6 : Commit**

```bash
git add -A
git commit -m "feat(design): fiche produit, catalogue et composants produits

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6 : Page d'accueil

**Files:**
- Modify: `src/pages/index.astro`, `src/components/CarteArticle.astro`

**Interfaces:**
- Consumes: `Bouton`, `EnTeteSection`, `CarteProduit`, `CarteAppel`, `CadreCapture`, `ListeCoches`, `BandeAppel`, `Icone`, `produitsPublies`, `filtrerPublies`, `trierParDate`.
- Produces: `CarteArticle.astro` props `{ article: CollectionEntry<'blog'>; niveauTitre?: 'h2' | 'h3' }` (utilisée ici en `h3`, en tâche 7 en `h2`).

- [ ] **Étape 1 : Carte d'article**

Remplacer `src/components/CarteArticle.astro` par :

```astro
---
import type { CollectionEntry } from 'astro:content';
import { dateIso, formaterDate } from '../lib/dates';

interface Props {
  article: CollectionEntry<'blog'>;
  niveauTitre?: 'h2' | 'h3';
}

const { article, niveauTitre = 'h3' } = Astro.props;
const Titre = niveauTitre;
const premierTag = article.data.tags[0];
---
<article class="flex flex-col gap-2.5 border-t-2 border-encre py-6">
  <p class="technique">
    <time datetime={dateIso(article.data.date)}>{formaterDate(article.data.date)}</time>
    {premierTag && <span> · #{premierTag}</span>}
    {article.data.brouillon && <span class="ml-2 rounded-full border border-ligne px-2 text-[11px] uppercase">Brouillon</span>}
  </p>
  <Titre class="text-[22px] font-semibold leading-[1.25]">
    <a href={`/blog/${article.id}/`} class="text-encre hover:text-cobalt">{article.data.titre}</a>
  </Titre>
  <p class="text-[16px] leading-[1.5] text-encre-2">{article.data.description}</p>
  {article.data.tags.length > 0 && (
    <ul class="flex flex-wrap gap-2 text-[14px]" aria-label="Tags">
      {article.data.tags.map((tag) => (
        <li><a href={`/blog/tags/${tag}/`} class="underline underline-offset-[3px]">#{tag}</a></li>
      ))}
    </ul>
  )}
</article>
```

- [ ] **Étape 2 : Accueil**

Remplacer `src/pages/index.astro` par :

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import Bouton from '../components/Bouton.astro';
import Icone from '../components/Icone.astro';
import EnTeteSection from '../components/EnTeteSection.astro';
import CarteProduit from '../components/CarteProduit.astro';
import CarteAppel from '../components/CarteAppel.astro';
import CarteArticle from '../components/CarteArticle.astro';
import CadreCapture from '../components/CadreCapture.astro';
import ListeCoches from '../components/ListeCoches.astro';
import BandeAppel from '../components/BandeAppel.astro';
import { produitsPublies } from '../lib/catalogue';
import { filtrerPublies, trierParDate } from '../lib/blog';

const produits = await produitsPublies();
const articles = trierParDate(filtrerPublies(await getCollection('blog'), import.meta.env.DEV)).slice(0, 3);
const domaines = [
  'Paramétrage, migration et reprise de données Sage 100',
  'Administration et optimisation des bases SQL Server des logiciels Sage',
  'Automatisation et interfaces autour des Objets métiers Sage',
  'Reporting et analyse comptable',
];
---
<Base titre="Bresnik" description="Logiciels complémentaires pour l'écosystème Sage 100 et conseil Sage, par Nicolas Bresson." sansSuffixe>
  <section aria-labelledby="promesse" class="conteneur grid items-center gap-10 pb-8 pt-10 lg:grid-cols-2 lg:gap-16 lg:pb-22 lg:pt-24">
    <div class="flex flex-col gap-5 lg:gap-6">
      <p class="eyebrow">Logiciels pour l'écosystème Sage 100</p>
      <h1 id="promesse" class="text-[38px] font-bold leading-[1.06] tracking-[-0.02em] md:text-[64px] md:leading-[1.04] md:tracking-[-0.025em]">
        Des logiciels qui complètent Sage 100.
      </h1>
      <p class="max-w-[560px] text-[18px] leading-[1.5] text-encre-2 md:text-[21px]">
        Intégration bancaire, analyse de FEC, politique tarifaire, exports automatisés : des applications Windows nées de missions de conseil, construites sur SQL Server et les Objets métiers Sage.
      </p>
      <div class="mt-1.5 flex flex-col gap-2.5 md:flex-row md:items-center md:gap-3">
        <Bouton href="/produits/" fleche class="max-md:w-full">Voir les produits</Bouton>
        <Bouton href="/contact/" variante="secondaire" class="max-md:w-full">Demander une démo</Bouton>
      </div>
      <p class="technique">Conçus par un consultant Sage 100 · Windows · SQL Server</p>
    </div>
    <div class="hidden md:block">
      <CadreCapture titre="BankBridge — Extraits à intégrer" />
    </div>
  </section>

  <section aria-labelledby="produits" class="conteneur flex flex-col gap-6 pb-16 pt-6 md:gap-8 md:pb-24 md:pt-8">
    <EnTeteSection id="produits" eyebrow="Produits" titre="Cinq outils, cinq besoins rencontrés sur le terrain." lienHref="/produits/" lienLibelle="Tous les produits" />
    <div class="grid gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {produits.map((produit) => <CarteProduit produit={produit} />)}
      <CarteAppel />
    </div>
  </section>

  <section aria-labelledby="conseil" class="bg-papier-2">
    <div class="conteneur grid gap-8 py-10 lg:grid-cols-2 lg:gap-16 lg:py-22">
      <div class="flex flex-col gap-4 md:gap-[18px]">
        <p class="eyebrow">Conseil Sage</p>
        <h2 id="conseil" class="text-[28px] font-bold leading-[1.12] md:text-[40px] md:leading-[1.1]">Né du conseil, pas de la théorie.</h2>
        <p class="text-[17px] leading-[1.5] md:text-[19px] md:leading-[1.55]">
          Nicolas Bresson accompagne les entreprises et les cabinets sur Sage 100 Comptabilité, Gestion commerciale, Moyens de paiement, Immobilisations, Reporting et Batigest. Les produits Bresnik répondent à des besoins rencontrés en mission que Sage ne couvre pas.
        </p>
        <a href="/conseil/" class="inline-flex items-center gap-1.5 text-[16px] font-semibold">
          L'activité de conseil
          <Icone nom="fleche" taille={16} />
        </a>
      </div>
      <ListeCoches elements={domaines} class="self-center" />
    </div>
  </section>

  {articles.length > 0 && (
    <section aria-labelledby="articles" class="conteneur flex flex-col gap-6 py-10 md:gap-7 md:py-22">
      <EnTeteSection id="articles" eyebrow="Blog" titre="Retours de terrain sur Sage 100 et SQL Server." lienHref="/blog/" lienLibelle="Tous les articles" />
      <div class="grid gap-5 md:grid-cols-3">
        {articles.map((article) => <CarteArticle article={article} />)}
      </div>
    </section>
  )}

  <div class="pt-10 md:pt-22">
    <BandeAppel />
  </div>
</Base>
```

- [ ] **Étape 3 : Vérifier**

Run : `npm run check && npm run build && grep -c "Cinq outils" dist/index.html && grep -c "Un besoin qui n'est pas dans la liste" dist/index.html && grep -c "Derniers articles\|Retours de terrain" dist/index.html && grep -o "<h[1-3]" dist/index.html | sort | uniq -c`

Expected : `0 errors` ; `1` ; `1` ; `0` (aucun article publié, section absente) ; un seul `<h1`, plusieurs `<h2` et `<h3` (cartes produit).

Puis basculer `brouillon: false` dans `src/content/blog/bienvenue.mdx`, rebâtir, vérifier que « Retours de terrain » apparaît (`1`), puis remettre `brouillon: true`.

- [ ] **Étape 4 : Commit**

```bash
git add -A
git commit -m "feat(design): page d'accueil selon la maquette et carte d'article à niveau de titre paramétrable

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7 : Pages éditoriales, blog, contact et 404

**Files:**
- Modify: `src/components/PageEditoriale.astro`, `src/pages/conseil.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[id].astro`, `src/pages/blog/tags/[tag].astro`, `src/pages/contact.astro`, `src/pages/404.astro`
- Create: `src/components/Champ.astro`

**Interfaces:**
- Consumes: `EnTetePage`, `Etiquette`, `Bouton`, `BandeAppel`, `CarteArticle` (`niveauTitre="h2"`), `Base` (`noindex`).
- Produces: `PageEditoriale.astro` props `{ id: string; eyebrow: string; avecBandeAppel?: boolean }` ; `Champ.astro` props `{ type?: 'text' | 'email' | 'zone' | 'liste'; nom: string; libelle: string; requis?: boolean; aide?: string; options?: { valeur: string; libelle: string }[]; ...attributs }`.

- [ ] **Étape 1 : Page éditoriale**

Remplacer `src/components/PageEditoriale.astro` par :

```astro
---
import { getEntry, render } from 'astro:content';
import Base from '../layouts/Base.astro';
import EnTetePage from './EnTetePage.astro';
import BandeAppel from './BandeAppel.astro';

interface Props {
  id: string;
  eyebrow: string;
  avecBandeAppel?: boolean;
}

const { id, eyebrow, avecBandeAppel = false } = Astro.props;
const page = await getEntry('pages', id);
if (!page) {
  throw new Error(`Page éditoriale introuvable : ${id}`);
}
const { Content } = await render(page);
---
<Base titre={page.data.titre} description={page.data.description}>
  <EnTetePage eyebrow={eyebrow} titre={page.data.titre} sousTitre={page.data.description} />
  <div class="conteneur pb-16 md:pb-20">
    <div class="prose prose-lg max-w-[720px]">
      <Content />
    </div>
  </div>
  {avecBandeAppel && <BandeAppel />}
</Base>
```

Remplacer `src/pages/conseil.astro` par :

```astro
---
import PageEditoriale from '../components/PageEditoriale.astro';
---
<PageEditoriale id="conseil" eyebrow="Conseil Sage" avecBandeAppel />
```

Remplacer `src/pages/mentions-legales.astro` par :

```astro
---
import PageEditoriale from '../components/PageEditoriale.astro';
---
<PageEditoriale id="mentions-legales" eyebrow="Légal" />
```

Remplacer `src/pages/confidentialite.astro` par :

```astro
---
import PageEditoriale from '../components/PageEditoriale.astro';
---
<PageEditoriale id="confidentialite" eyebrow="Légal" />
```

- [ ] **Étape 2 : Blog**

Remplacer `src/pages/blog/index.astro` par :

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import EnTetePage from '../../components/EnTetePage.astro';
import Etiquette from '../../components/Etiquette.astro';
import CarteArticle from '../../components/CarteArticle.astro';
import { filtrerPublies, listerTags, trierParDate } from '../../lib/blog';

const tous = await getCollection('blog');
const articles = trierParDate(filtrerPublies(tous, import.meta.env.DEV));
const tags = listerTags(articles);
---
<Base titre="Blog" description="Retours d'expérience sur Sage 100, SQL Server et les Objets métiers Sage.">
  <EnTetePage eyebrow="Blog" titre="Retours de terrain sur Sage 100 et SQL Server." sousTitre="Retours d'expérience sur Sage 100, SQL Server et les Objets métiers Sage." />
  <div class="conteneur flex flex-col gap-8 pb-16 md:pb-20">
    {tags.length > 0 && (
      <ul class="flex flex-wrap gap-2" aria-label="Tags">
        {tags.map((tag) => (
          <li><a href={`/blog/tags/${tag}/`} class="hover:text-cobalt"><Etiquette ton="neutre">#{tag}</Etiquette></a></li>
        ))}
      </ul>
    )}
    {articles.length === 0 ? (
      <p class="text-[17px]">Aucun article pour le moment. Abonnez-vous au <a href="/rss.xml" class="underline underline-offset-[3px]">flux RSS</a>.</p>
    ) : (
      <div class="flex max-w-[760px] flex-col">
        {articles.map((article) => <CarteArticle article={article} niveauTitre="h2" />)}
      </div>
    )}
  </div>
</Base>
```

Remplacer `src/pages/blog/[id].astro` par :

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import Icone from '../../components/Icone.astro';
import { filtrerPublies } from '../../lib/blog';
import { dateIso, formaterDate } from '../../lib/dates';

export async function getStaticPaths() {
  const articles = filtrerPublies(await getCollection('blog'), import.meta.env.DEV);
  return articles.map((article) => ({ params: { id: article.id }, props: { article } }));
}

const { article } = Astro.props;
const { Content } = await render(article);
---
<Base titre={article.data.titre} description={article.data.description} typeOg="article" image={article.data.image?.src}>
  <article>
    <header class="conteneur flex flex-col gap-4 pb-10 pt-10 md:gap-5 md:pb-12 md:pt-14">
      <p class="technique">
        Publié le <time datetime={dateIso(article.data.date)}>{formaterDate(article.data.date)}</time>
        {article.data.miseAJour && (
          <span>, mis à jour le <time datetime={dateIso(article.data.miseAJour)}>{formaterDate(article.data.miseAJour)}</time></span>
        )}
      </p>
      <h1 class="max-w-[900px] text-[34px] font-bold leading-[1.08] tracking-[-0.02em] md:text-[48px] md:leading-[1.06]">{article.data.titre}</h1>
      <p class="max-w-[760px] text-[18px] leading-[1.5] text-encre-2 md:text-[22px] md:leading-[1.45]">{article.data.description}</p>
    </header>
    <div class="conteneur flex flex-col gap-8 pb-16 md:pb-20">
      <div class="prose prose-lg max-w-[720px]">
        <Content />
      </div>
      {article.data.tags.length > 0 && (
        <ul class="flex flex-wrap gap-2 text-[14px]" aria-label="Tags">
          {article.data.tags.map((tag) => (
            <li><a href={`/blog/tags/${tag}/`} class="underline underline-offset-[3px]">#{tag}</a></li>
          ))}
        </ul>
      )}
      <a href="/blog/" class="inline-flex items-center gap-1.5 text-[16px] font-semibold">
        <Icone nom="fleche" taille={16} class="rotate-180" />
        Tous les articles
      </a>
    </div>
  </article>
</Base>
```

Remplacer `src/pages/blog/tags/[tag].astro` par :

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../../layouts/Base.astro';
import EnTetePage from '../../../components/EnTetePage.astro';
import Icone from '../../../components/Icone.astro';
import CarteArticle from '../../../components/CarteArticle.astro';
import { filtrerPublies, listerTags, trierParDate } from '../../../lib/blog';

export async function getStaticPaths() {
  const articles = trierParDate(filtrerPublies(await getCollection('blog'), import.meta.env.DEV));
  return listerTags(articles).map((tag) => ({
    params: { tag },
    props: { tag, articles: articles.filter((a) => a.data.tags.includes(tag)) },
  }));
}

const { tag, articles } = Astro.props;
---
<Base titre={`Articles « ${tag} »`} description={`Articles du blog Bresnik portant le tag ${tag}.`}>
  <EnTetePage eyebrow="Blog" titre={`Tag : ${tag}`} />
  <div class="conteneur flex flex-col gap-8 pb-16 md:pb-20">
    <div class="flex max-w-[760px] flex-col">
      {articles.map((article) => <CarteArticle article={article} niveauTitre="h2" />)}
    </div>
    <a href="/blog/" class="inline-flex items-center gap-1.5 text-[16px] font-semibold">
      <Icone nom="fleche" taille={16} class="rotate-180" />
      Tous les articles
    </a>
  </div>
</Base>
```

- [ ] **Étape 3 : Champ et contact**

`src/components/Champ.astro` :

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'input'> {
  type?: 'text' | 'email' | 'zone' | 'liste';
  nom: string;
  libelle: string;
  requis?: boolean;
  aide?: string;
  options?: { valeur: string; libelle: string }[];
  lignes?: number;
}

const { type = 'text', nom, libelle, requis = false, aide, options = [], lignes = 6, ...attributs } = Astro.props;
const identifiant = `champ-${nom}`;
const identifiantAide = aide ? `${identifiant}-aide` : undefined;
const classeControle = 'w-full rounded-bouton border-[1.5px] border-ligne bg-blanc px-3.5 text-[16px] text-encre transition-colors duration-150 focus:border-cobalt';
---
<div class="flex flex-col gap-1.5">
  <label for={identifiant} class="text-[14px] font-semibold">
    {libelle}{requis && <span aria-hidden="true"> *</span>}
  </label>
  {type === 'zone' ? (
    <textarea id={identifiant} name={nom} required={requis} rows={lignes} aria-describedby={identifiantAide} class={`${classeControle} py-3`} {...attributs}></textarea>
  ) : type === 'liste' ? (
    <select id={identifiant} name={nom} required={requis} aria-describedby={identifiantAide} class={`${classeControle} h-12`} {...attributs}>
      {options.map((option) => <option value={option.valeur}>{option.libelle}</option>)}
    </select>
  ) : (
    <input id={identifiant} name={nom} type={type} required={requis} aria-describedby={identifiantAide} class={`${classeControle} h-12`} {...attributs} />
  )}
  {aide && <p id={identifiantAide} class="text-[14px] text-encre-2">{aide}</p>}
</div>
```

Remplacer `src/pages/contact.astro` par :

```astro
---
import Base from '../layouts/Base.astro';
import EnTetePage from '../components/EnTetePage.astro';
import Champ from '../components/Champ.astro';
import Bouton from '../components/Bouton.astro';
import { produitsPublies } from '../lib/catalogue';

const produits = await produitsPublies();
const optionsProduits = [
  { valeur: '', libelle: 'Aucun produit en particulier' },
  ...produits.map((p) => ({ valeur: p.id, libelle: p.data.nom })),
];
---
<Base titre="Contact" description="Demandez une démonstration d'un produit Bresnik ou un échange sur votre projet Sage 100.">
  <EnTetePage eyebrow="Contact" titre="Parlons de votre projet Sage 100." sousTitre="Demandez une démonstration ou décrivez votre besoin. Réponse sous deux jours ouvrés." />
  <div class="conteneur pb-16 md:pb-20">
    <form id="formulaire-contact" method="post" action="/api/contact" class="flex max-w-[640px] flex-col gap-5">
      <Champ nom="nom" libelle="Nom" requis minlength="2" maxlength="100" autocomplete="name" />
      <Champ nom="email" libelle="Email" type="email" requis autocomplete="email" />
      <Champ nom="societe" libelle="Société" maxlength="100" autocomplete="organization" />
      <Champ nom="produit" libelle="Produit concerné" type="liste" options={optionsProduits} />
      <Champ nom="message" libelle="Message" type="zone" requis minlength="10" maxlength="5000" />
      <div class="hidden" aria-hidden="true">
        <label>Ne pas remplir <input name="site_web" type="text" tabindex="-1" autocomplete="off" /></label>
      </div>
      <div class="flex flex-col gap-3">
        <Bouton type="submit" desactive class="self-start max-md:w-full">Envoyer</Bouton>
        <p id="etat-formulaire" class="text-[14px] text-encre-2" role="status">L'envoi en ligne sera activé prochainement.</p>
      </div>
    </form>
  </div>

  <script>
    const produitDemande = new URLSearchParams(window.location.search).get('produit');
    const selecteur = document.querySelector<HTMLSelectElement>('select[name="produit"]');
    if (produitDemande && selecteur) {
      const existe = Array.from(selecteur.options).some((o) => o.value === produitDemande);
      if (existe) selecteur.value = produitDemande;
    }
  </script>
</Base>
```

- [ ] **Étape 4 : Page 404**

Remplacer `src/pages/404.astro` par :

```astro
---
import Base from '../layouts/Base.astro';
import EnTetePage from '../components/EnTetePage.astro';
import Bouton from '../components/Bouton.astro';
---
<Base titre="Page introuvable" description="La page demandée n'existe pas." noindex>
  <EnTetePage eyebrow="Erreur 404" titre="Page introuvable" sousTitre="La page demandée n'existe pas ou a été déplacée." />
  <div class="conteneur flex flex-col gap-3 pb-16 md:flex-row md:pb-20">
    <Bouton href="/" variante="secondaire" class="max-md:w-full">Retour à l'accueil</Bouton>
    <Bouton href="/produits/" variante="secondaire" class="max-md:w-full">Voir les produits</Bouton>
  </div>
</Base>
```

- [ ] **Étape 5 : Vérifier**

Run : `npm run check && npm test && npm run build && grep -c 'name="robots" content="noindex"' dist/404.html && grep -c 'name="robots"' dist/index.html && grep -c 'id="champ-produit"' dist/contact/index.html && grep -c "L'envoi en ligne sera activé prochainement" dist/contact/index.html && grep -c "bande-appel" dist/conseil/index.html && grep -c "bande-appel" dist/mentions-legales/index.html && grep -o "<h[1-3]" dist/blog/index.html | sort | uniq -c`

Expected : `0 errors`, tests PASS, build réussi ; 404 a `noindex` (`1`) et l'accueil non (`0`) ; le sélecteur de produit est présent ; le message d'état est présent ; la bande d'appel est sur conseil (`1`) et absente des mentions légales (`0`) ; le blog a un seul `<h1` (et, si un brouillon est publié en dev seulement, aucun `<h3`).

Puis passer `brouillon: false` dans `bienvenue.mdx`, rebâtir, vérifier `grep -o "<h[1-3]" dist/blog/index.html | sort | uniq -c` : un `<h1` et un `<h2`, aucun `<h3` ; vérifier que `dist/blog/bienvenue/index.html` contient `og:type" content="article"` ; remettre `brouillon: true`.

- [ ] **Étape 6 : Commit**

```bash
git add -A
git commit -m "feat(design): pages éditoriales, blog, contact et 404 habillés

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8 : Vérification des liens, CI, Lighthouse et documentation

**Files:**
- Create: `scripts/liens.mjs`, `scripts/verifier-liens.mjs`, `tests/scripts/liens.test.ts`
- Modify: `package.json` (script), `.github/workflows/ci.yml`, `docs/deploiement.md`, `README.md`

**Interfaces:**
- Produces: `extraireLiens(html: string): string[]` (valeurs brutes des `href` et `src`), `estInterne(lien: string): boolean`, `cheminsCandidats(lien: string): string[]` (chemins relatifs à `dist/` qui satisferaient le lien), `verifierDist(dossier: string): Promise<{ fichier: string; lien: string }[]>` (liens cassés) ; script `npm run verifier-liens` qui échoue avec la liste des liens cassés.

- [ ] **Étape 1 : Tests (échec attendu)**

`tests/scripts/liens.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { cheminsCandidats, estInterne, extraireLiens } from '../../scripts/liens.mjs';

describe('extraireLiens', () => {
  it('extrait les href et src, sans doublon', () => {
    const html = '<a href="/produits/">x</a><img src="/og.png"><a href="/produits/">y</a><link href="/rss.xml">';
    expect(extraireLiens(html)).toEqual(['/produits/', '/og.png', '/rss.xml']);
  });
});

describe('estInterne', () => {
  it('ne garde que les chemins absolus du site', () => {
    expect(estInterne('/blog/')).toBe(true);
    expect(estInterne('https://exemple.fr/')).toBe(false);
    expect(estInterne('//cdn.exemple.fr/x.js')).toBe(false);
    expect(estInterne('mailto:contact@exemple.fr')).toBe(false);
    expect(estInterne('#contenu')).toBe(false);
    expect(estInterne('/api/contact')).toBe(false);
  });
});

describe('cheminsCandidats', () => {
  it('résout un dossier vers son index', () => {
    expect(cheminsCandidats('/produits/')).toEqual(['produits/index.html']);
  });

  it('résout un fichier directement, en ignorant requête et ancre', () => {
    expect(cheminsCandidats('/contact/?produit=bocs#formulaire')).toEqual(['contact/index.html']);
    expect(cheminsCandidats('/rss.xml')).toEqual(['rss.xml']);
  });

  it('accepte une page sans barre finale sous ses deux formes', () => {
    expect(cheminsCandidats('/produits')).toEqual(['produits', 'produits/index.html', 'produits.html']);
  });
});
```

Run : `npm test` → FAIL, module `scripts/liens.mjs` introuvable.

- [ ] **Étape 2 : Module et script**

`scripts/liens.mjs` :

```js
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
  const sansSuffixe = lien.split('#')[0].split('?')[0];
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
    await stat(chemin);
    return true;
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
```

`scripts/verifier-liens.mjs` :

```js
// Échoue si une page de dist/ pointe vers une cible interne absente.
import { fileURLToPath } from 'node:url';
import { verifierDist } from './liens.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const casses = await verifierDist(dist);

if (casses.length > 0) {
  console.error(`${casses.length} lien(s) interne(s) cassé(s) :`);
  for (const { fichier, lien } of casses) console.error(`  ${fichier} → ${lien}`);
  process.exit(1);
}
console.log('Liens internes : aucun lien cassé.');
```

Ajouter dans `package.json`, `scripts` : `"verifier-liens": "node scripts/verifier-liens.mjs"`.

Run : `npm test && npm run build && npm run verifier-liens`

Expected : tests PASS ; « Liens internes : aucun lien cassé. » Si un lien cassé apparaît, c'est un vrai défaut des pages : le corriger dans la page concernée (pas dans le script) et le noter dans le rapport.

- [ ] **Étape 3 : Test négatif du script**

Créer temporairement `dist/test-casse.html` contenant `<a href="/nulle-part/">x</a>`, lancer `npm run verifier-liens`.

Expected : sortie `1 lien(s) interne(s) cassé(s)` avec `test-casse.html → /nulle-part/`, code de sortie 1 (`echo $?`). Supprimer le fichier.

- [ ] **Étape 4 : CI**

Dans `.github/workflows/ci.yml`, ajouter après `- run: npm run build` :

```yaml
      - run: npm run verifier-liens
```

- [ ] **Étape 5 : Lighthouse**

Run, dans un premier terminal : `npm run build && npx astro preview --port 4321`. Dans un second :

```bash
for page in "" "produits/bankbridge/" "conseil/"; do
  npx --yes lighthouse "http://localhost:4321/$page" --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path="./.lighthouse-$(echo "$page" | tr '/' '_' | sed 's/_$//;s/^$/accueil/').json" --chrome-flags="--headless=new" --quiet
done
for f in .lighthouse-*.json; do node -e "const r=require('./$f');console.log('$f',Object.values(r.categories).map(c=>c.id+'='+Math.round(c.score*100)).join(' '))"; done
```

Expected : quatre scores ≥ 95 sur chaque page. Consigner les scores dans le rapport. Si un score est inférieur, lister les audits en échec (`r.audits` avec `score < 1`) dans le rapport ; corriger dans cette tâche si la correction tient en quelques lignes (par exemple un contraste, un attribut manquant), sinon le signaler comme point ouvert. Si Chrome n'est pas trouvé, le signaler et passer, sans bloquer. Supprimer les fichiers `.lighthouse-*.json` (ne pas les commiter) et arrêter le serveur.

- [ ] **Étape 6 : Documentation**

Ajouter à la fin de `docs/deploiement.md` :

```markdown
## Qualité avant fusion

- `npm run check`, `npm test`, `npm run build` puis `npm run verifier-liens`
  (exécuté aussi par le CI) : aucun lien interne cassé.
- Lighthouse, manuel : `npm run build && npx astro preview`, puis
  `npx lighthouse http://localhost:4321/ --preset=desktop` sur l'accueil, une
  fiche produit et une page éditoriale. Objectif : 95 ou plus dans les quatre
  catégories.
- Après un changement de charte (couleurs, polices), relancer
  `npm run generer-images` et commiter les fichiers de `public/`.
```

Dans `README.md`, section « Vérifier », ajouter les lignes :

```
    npm run verifier-liens   # liens internes de dist/ (après build)
    npm run generer-images   # favicon et image de partage (après un changement de charte)
```

- [ ] **Étape 7 : Commit**

```bash
git add -A
git commit -m "chore(qualite): vérification des liens internes au build, CI et procédure Lighthouse

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Auto-revue du plan

**Couverture de la spécification design.** §2.1 couleurs et §2.2 polices (T1) ; §2.3 espaces, rayons, ombre (T1 tokens, utilisés T3 à T7) ; §2.4 interactions et focus (T1 global.css, T3 Bouton) ; §3 composants : Marque, Bouton, Etiquette, EnTeteSection, ListeCoches, BandeAppel (T3), Header avec menu mobile, lien d'évitement, Footer (T1, T4), CarteProduit, CarteAppel, CadreCapture, FicheTechnique (T5), CarteArticle avec `niveauTitre` (T6), Champ (T7), Icone (T1) ; §4 pages : accueil (T6), catalogue et fiche (T5), conseil, légales, blog, contact, 404 (T7) ; §5 favicon et Open Graph (T2, câblés dans Base en T1) ; §6 accessibilité : lien d'évitement et `noindex` (T1, T7), `aria-expanded` (T4), `aria-describedby` (T5, T7), `aria-label` des tags (T6), niveaux de titres (T6, T7) ; §7 polices auto-hébergées et préchargées (T1), vérification des liens et CI (T8), Lighthouse (T8) ; §9 décisions (année 2026 en T4, typographie en T1, script menu en T4).

**Placeholders.** Aucun « TBD ». Les textes entre crochets ont disparu : le cadre vide affiche « Capture d'écran à venir », la section articles est conditionnelle.

**Cohérence des noms.** `libelleCible`, `tonCible`, `libelleAcces`, `produitsMemeFamille` définis en T3 et utilisés en T5 ; props de `Bouton` (`variante`, `taille`, `fleche`, `desactive`, `plein`, `aria-describedby`) identiques en T3 à T7 ; `Etiquette` prop `ton` en T3, T5, T7 ; `EnTetePage` props `eyebrow`, `titre`, `sousTitre`, `taille` en T3, T5, T7 ; `CadreCapture` props `titre`, `image`, `alt` en T5 et T6 ; `Base` props `image`, `noindex` en T1 et T7 ; utilitaires `conteneur`, `eyebrow`, `technique` définis en T1 et utilisés partout ; classes de rayon `rounded-bouton`, `rounded-carte`, `rounded-cadre`, `rounded-bande` issues de `--radius-*` en T1.

**Écart assumé avec la spécification.** §5 prévoyait un `favicon.ico` ; le plan livre `favicon.svg` plus `favicon-32.png` et `apple-touch-icon.png`, plus simples à générer et suffisants pour les navigateurs actuels. La spécification est amendée en ce sens.
