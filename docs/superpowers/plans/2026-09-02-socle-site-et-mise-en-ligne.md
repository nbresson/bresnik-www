# Socle du site vitrine et mise en ligne — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre en ligne sur Cloudflare Workers un site Astro statique contenant toutes les routes du plan du site, les 5 fiches produit en texte brut, et une chaîne CI, sans design ni formulaire actif.

**Architecture:** Astro 7 en sortie statique, contenu typé par Content Collections (Zod), pages rendues au build dans `dist/`, servies comme assets statiques par un Worker Cloudflare sans script. Tailwind est installé mais utilisé de façon minimale, le design venant dans une spécification ultérieure. Les fonctions pures (bouton d'action, tri des articles, dates) vivent dans `src/lib/` et sont testées avec Vitest.

**Tech Stack:** Node 24, npm, Astro 7.2, @astrojs/mdx, @astrojs/sitemap, @astrojs/rss, Tailwind CSS 4 via @tailwindcss/vite, TypeScript 5.9, Vitest 4, Wrangler 4, GitHub Actions, Cloudflare Workers Builds.

**Spec:** `docs/superpowers/specs/2026-09-02-bresnik-www-design.md`

Ce plan couvre les étapes 1 et 2 de la section 11 de la spécification, plus les
coquilles de l'étape 4 (pages conseil, légales, blog vides mais fonctionnelles).
Le formulaire de contact actif (étape 3) et le design (étape 5) font l'objet de
plans séparés.

## Global Constraints

- Langue du site : français uniquement. Tous les libellés, noms de champs de contenu et messages de commit sont en français.
- Node `>=22.12.0` ; version de développement et de build : `24` (fichier `.nvmrc`).
- Astro `output: 'static'` ; `trailingSlash: 'always'` ; toutes les URL internes se terminent par `/`.
- Aucune base de données, aucun CMS, aucun secret dans le dépôt.
- Le nom du Worker est `bresnik-www` dans `wrangler.jsonc` et doit être identique dans le tableau de bord Cloudflare.
- Le dépôt GitHub est privé, nommé `bresnik-www`, branche principale `main`.
- Champs de la collection `produits` : `nom`, `accroche`, `cible` (`consultant` | `entreprise`), `modulesSage`, `objetsMetiersSage`, `plateforme`, `fonctionnalites`, `captures`, `disponibilite` (`contact` | `telechargement` | `essai`), `ordre`, `publie`.
- Champs de la collection `blog` : `titre`, `description`, `date`, `miseAJour`, `tags`, `brouillon`, `image`.
- Bouton d'action : `contact` → « Demander une démo » vers `/contact/?produit=<slug>` ; `telechargement` → « Télécharger » désactivé avec la mention « Bientôt disponible » ; `essai` → « Essayer gratuitement » désactivé avec la même mention.
- Fin de chaque message de commit : `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Les commandes s'exécutent dans `C:\Users\nbres\source\repos\Bresnik` avec Git Bash ; chemins en `/`.

---

## Carte des fichiers

| Fichier | Responsabilité |
|---|---|
| `package.json`, `tsconfig.json`, `astro.config.mjs`, `.nvmrc`, `.gitattributes` | Configuration du projet. |
| `vitest.config.ts` | Configuration Vitest via `getViteConfig` d'Astro. |
| `src/content.config.ts` | Schémas Zod des collections `produits`, `blog`, `pages`. |
| `src/content/produits/*.md` | Les 5 fiches produit. |
| `src/content/blog/*.mdx` | Articles (un exemple en brouillon). |
| `src/content/pages/*.md` | Textes éditoriaux : conseil, mentions légales, confidentialité. |
| `src/lib/produits.ts` | `actionProduit()` : libellé et lien du bouton selon la disponibilité. |
| `src/lib/blog.ts` | `filtrerPublies()`, `trierParDate()`, `listerTags()`. |
| `src/lib/dates.ts` | `formaterDate()` en français. |
| `src/styles/tokens.css`, `src/styles/global.css` | Variables de marque et import Tailwind. |
| `src/layouts/Base.astro` | Squelette HTML, balises SEO et Open Graph, en-tête, pied de page, analytics. |
| `src/components/Header.astro`, `Footer.astro`, `CarteProduit.astro`, `CarteArticle.astro` | Composants réutilisables. |
| `src/pages/**` | Une route par ligne du plan du site (spec §4). |
| `wrangler.jsonc` | Worker `bresnik-www` servant `dist/` en assets statiques. |
| `.github/workflows/ci.yml` | `astro check`, tests, build. |
| `docs/deploiement.md` | Procédure Cloudflare Workers Builds et achat du domaine. |
| `README.md` | Démarrage rapide. |

---

### Task 1 : Projet Astro minimal qui compile

**Files:**
- Create: `package.json`, `tsconfig.json`, `astro.config.mjs`, `.nvmrc`, `.gitattributes`, `.vscode/extensions.json`, `src/styles/tokens.css`, `src/styles/global.css`, `src/pages/index.astro`, `README.md`
- Modify: `.gitignore` (vérifier seulement, déjà présent)

**Interfaces:**
- Produces: scripts npm `dev`, `build`, `preview`, `check`, `test`, `deploy`, `cf:dev` ; feuille `src/styles/global.css` importée par le layout de la tâche 4 ; `astro.config.mjs` avec `site`, `trailingSlash: 'always'`, intégrations `mdx()` et `sitemap()`, plugin Vite Tailwind.

- [ ] **Étape 1 : Fichiers de base du projet**

`package.json` :

```json
{
  "name": "bresnik-www",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "cf:dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "astro": "astro"
  }
}
```

`.nvmrc` :

```
24
```

`.gitattributes` :

```
* text=auto eol=lf
```

`.vscode/extensions.json` :

```json
{
  "recommendations": ["astro-build.astro-vscode", "bradlc.vscode-tailwindcss"]
}
```

`tsconfig.json` :

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Étape 2 : Installer les dépendances**

Run :

```bash
npm install astro@^7.2.10 @astrojs/rss@^4.0.19
npm install --save-dev @astrojs/check@^0.9.10 typescript@^5.9.3 vitest@^4.1.11 wrangler@^4.128.0
npx astro add mdx sitemap tailwind --yes
```

Expected : `astro add` ajoute `@astrojs/mdx`, `@astrojs/sitemap`, `tailwindcss`, `@tailwindcss/vite`, crée `src/styles/global.css` contenant `@import "tailwindcss";` et écrit un `astro.config.mjs`. Si `astro add` demande une confirmation malgré `--yes`, répondre `y`.

- [ ] **Étape 3 : Écrire la configuration Astro définitive**

Remplacer intégralement `astro.config.mjs` par :

```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // URL provisoire : remplacée par l'URL workers.dev réelle (tâche 12),
  // puis par https://bresnik.fr après l'achat du domaine.
  site: 'https://bresnik-www.workers.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Étape 4 : Feuilles de style de base**

`src/styles/tokens.css` :

```css
/* Tokens de la marque Bresnik. Valeurs provisoires : le design viendra plus tard.
   Ces variables sont prévues pour être réutilisées dans les applications. */
:root {
  --couleur-fond: #ffffff;
  --couleur-texte: #1f2933;
  --couleur-texte-secondaire: #52606d;
  --couleur-accent: #0f4c81;
  --couleur-accent-contraste: #ffffff;
  --couleur-bordure: #d9e2ec;
  --police-texte: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --largeur-contenu: 72rem;
}
```

`src/styles/global.css` (remplacer le contenu généré) :

```css
@import "tailwindcss";
@import "./tokens.css";

html {
  font-family: var(--police-texte);
  background: var(--couleur-fond);
  color: var(--couleur-texte);
}
```

- [ ] **Étape 5 : Page d'accueil provisoire**

`src/pages/index.astro` :

```astro
---
import '../styles/global.css';
---
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bresnik</title>
  </head>
  <body>
    <h1>Bresnik</h1>
    <p>Logiciels complémentaires pour l'écosystème Sage 100.</p>
  </body>
</html>
```

- [ ] **Étape 6 : README**

`README.md` :

```markdown
# bresnik-www

Site vitrine de la marque Bresnik (Astro, statique, Cloudflare Workers).

## Démarrer

    npm install
    npm run dev        # http://localhost:4321

## Vérifier

    npm run check      # types et schémas de contenu
    npm test           # tests unitaires
    npm run build      # génère dist/

## Déployer

Voir docs/deploiement.md. Le déploiement en production est automatique à
chaque push sur main (Cloudflare Workers Builds).

## Documentation

- Spécification : docs/superpowers/specs/
- Plans d'implémentation : docs/superpowers/plans/
```

- [ ] **Étape 7 : Vérifier que tout compile**

Run : `npm run check && npm run build`

Expected : `astro check` termine avec `0 errors`, `astro build` écrit `dist/index.html`. Vérifier : `grep -c "Bresnik" dist/index.html` affiche au moins `1`.

- [ ] **Étape 8 : Commit**

```bash
git add -A
git commit -m "chore: projet Astro 7 minimal avec Tailwind, MDX et sitemap

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2 : Collections de contenu et les 5 fiches produit

**Files:**
- Create: `src/content.config.ts`, `src/content/produits/bocs.md`, `src/content/produits/bankbridge.md`, `src/content/produits/fec-analyzer.md`, `src/content/produits/majtarifpq.md`, `src/content/produits/linkcsvsage.md`, `src/content/blog/.gitkeep`, `src/content/pages/.gitkeep`

**Interfaces:**
- Produces: collections `produits`, `blog`, `pages` interrogeables via `getCollection('produits')` etc. ; identifiant d'entrée = nom de fichier sans extension (`bocs`, `bankbridge`, `fec-analyzer`, `majtarifpq`, `linkcsvsage`). Type de `entry.data` conforme au tableau de la spec §5.

- [ ] **Étape 1 : Schémas des collections**

`src/content.config.ts` :

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const produits = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/produits' }),
  schema: ({ image }) =>
    z.object({
      nom: z.string().min(1),
      accroche: z.string().min(1),
      cible: z.enum(['consultant', 'entreprise']),
      modulesSage: z.array(z.string()),
      objetsMetiersSage: z.boolean(),
      plateforme: z.string().min(1),
      fonctionnalites: z.array(z.string()).min(1),
      captures: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      disponibilite: z.enum(['contact', 'telechargement', 'essai']),
      ordre: z.number().int(),
      publie: z.boolean(),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      titre: z.string().min(1),
      description: z.string().min(1),
      date: z.coerce.date(),
      miseAJour: z.coerce.date().optional(),
      tags: z.array(z.string()),
      brouillon: z.boolean(),
      image: image().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    titre: z.string().min(1),
    description: z.string().min(1),
  }),
});

export const collections = { produits, blog, pages };
```

- [ ] **Étape 2 : Les 5 fiches produit**

`src/content/produits/bocs.md` :

```markdown
---
nom: BOCS
accroche: La Boîte à Outils du Consultant Sage.
cible: consultant
modulesSage: []
objetsMetiersSage: false
plateforme: Windows (WPF)
fonctionnalites:
  - Fonctions d'aide au diagnostic et à la maintenance des logiciels Sage
  - Outils pour l'environnement Windows des postes et serveurs Sage
  - Outils pour SQL Server : bases Sage, requêtes, maintenance
disponibilite: contact
ordre: 1
publie: true
---

BOCS est un anagramme de « Boîte à Outils du Consultant Sage ». C'est une
application Windows qui regroupe les fonctions dont un consultant Sage a
besoin au quotidien pour intervenir sur les logiciels Sage, sur les
environnements Windows et sur SQL Server.
```

`src/content/produits/bankbridge.md` :

```markdown
---
nom: BankBridge
accroche: Intégrez vos extraits bancaires dans Sage 100 Comptabilité.
cible: entreprise
modulesSage:
  - Sage 100 Comptabilité
objetsMetiersSage: true
plateforme: Windows (WPF)
fonctionnalites:
  - Intégration semi-automatique des extraits bancaires
  - Amélioration de la gestion budgétaire
  - Prévisions de trésorerie
disponibilite: contact
ordre: 2
publie: true
---

BankBridge facilite l'intégration semi-automatique des extraits bancaires
dans Sage 100 Comptabilité. Il améliore la gestion budgétaire et les
prévisions de trésorerie. Il s'appuie sur les Objets métiers Sage.
```

`src/content/produits/fec-analyzer.md` :

```markdown
---
nom: FEC Analyzer
accroche: Analysez votre Fichier des Écritures Comptables.
cible: entreprise
modulesSage:
  - Sage 100 Comptabilité
objetsMetiersSage: false
plateforme: Windows (WPF)
fonctionnalites:
  - Synthèse comptable du fichier
  - Détection des anomalies
  - Reconstitution de la Balance, du Grand-livre et du comparatif N/N-1
  - Recherche dans les écritures
  - Export selon plusieurs formats
disponibilite: contact
ordre: 3
publie: true
---

FEC Analyzer analyse un Fichier des Écritures Comptables : il en fait la
synthèse, détecte les anomalies, reconstitue les états comptables (Balance,
Grand-livre, comparatif N/N-1), facilite la recherche et l'export selon
plusieurs formats.
```

`src/content/produits/majtarifpq.md` :

```markdown
---
nom: MajTarifPQ
accroche: Gérez votre politique tarifaire Fournisseur, Article, Catégorie, Client.
cible: entreprise
modulesSage:
  - Sage 100 Gestion commerciale
objetsMetiersSage: true
plateforme: Windows (WPF)
fonctionnalites:
  - Relation Fournisseur / Article / Catégorie tarifaire absente de Sage
  - Gestion facilitée des catégories tarifaires de Sage 100 Gestion commerciale
  - Mise à jour des tarifs en masse
disponibilite: contact
ordre: 4
publie: true
---

MajTarifPQ gère la politique tarifaire Fournisseur → Article → Catégorie
tarifaire → Client. Il facilite la gestion des catégories tarifaires de
Sage 100 Gestion commerciale en permettant une relation Fournisseur / Article
/ Catégorie tarifaire que Sage ne propose pas. Il s'appuie sur les Objets
métiers Sage.
```

`src/content/produits/linkcsvsage.md` :

```markdown
---
nom: LinkCsvSage
accroche: Automatisez l'export CSV de vos documents Sage 100.
cible: entreprise
modulesSage:
  - Sage 100 Gestion commerciale
objetsMetiersSage: true
plateforme: Windows (WPF)
fonctionnalites:
  - Export CSV automatisé des documents de Gestion commerciale
  - Rattachement du fichier CSV au document Sage
  - Envoi facilité des documents au format CSV
disponibilite: contact
ordre: 5
publie: true
---

LinkCsvSage automatise l'export CSV des documents de Sage 100 Gestion
commerciale et rattache le fichier produit au document Sage, afin de
faciliter l'envoi des documents au format CSV. Il s'appuie sur les Objets
métiers Sage.
```

Créer aussi deux fichiers vides `src/content/blog/.gitkeep` et `src/content/pages/.gitkeep` pour que les dossiers existent.

- [ ] **Étape 3 : Vérifier que le schéma rejette une valeur invalide**

Modifier temporairement `src/content/produits/bocs.md` : remplacer `cible: consultant` par `cible: partenaire`.

Run : `npm run build`

Expected : le build échoue avec une erreur mentionnant `bocs` et `cible`. Remettre ensuite `cible: consultant`.

- [ ] **Étape 4 : Vérifier que le schéma accepte les 5 fiches**

Run : `npm run check && npm run build`

Expected : `0 errors`, build réussi.

- [ ] **Étape 5 : Commit**

```bash
git add -A
git commit -m "feat(contenu): collections produits, blog, pages et les 5 fiches produit

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3 : Fonctions pures testées (bouton d'action, articles, dates)

**Files:**
- Create: `vitest.config.ts`, `src/lib/produits.ts`, `src/lib/blog.ts`, `src/lib/dates.ts`, `tests/lib/produits.test.ts`, `tests/lib/blog.test.ts`, `tests/lib/dates.test.ts`

**Interfaces:**
- Produces:
  - `actionProduit(disponibilite: Disponibilite, slug: string): ActionProduit` avec `ActionProduit = { libelle: string; href: string | null; actif: boolean; mention: string | null }`.
  - `filtrerPublies<T extends { data: { brouillon: boolean } }>(articles: T[], inclureBrouillons: boolean): T[]`.
  - `trierParDate<T extends { data: { date: Date } }>(articles: T[]): T[]` (plus récent en premier, ne modifie pas le tableau d'entrée).
  - `listerTags<T extends { data: { tags: string[] } }>(articles: T[]): string[]` (uniques, triés par ordre alphabétique français).
  - `formaterDate(date: Date): string` (ex. `2 septembre 2026`).

- [ ] **Étape 1 : Configuration Vitest**

`vitest.config.ts` :

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Étape 2 : Tests du bouton d'action (échec attendu)**

`tests/lib/produits.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { actionProduit } from '../../src/lib/produits';

describe('actionProduit', () => {
  it('propose une demande de démo pré-remplie pour la disponibilité contact', () => {
    expect(actionProduit('contact', 'bankbridge')).toEqual({
      libelle: 'Demander une démo',
      href: '/contact/?produit=bankbridge',
      actif: true,
      mention: null,
    });
  });

  it('désactive le téléchargement tant qu\'il n\'est pas disponible', () => {
    expect(actionProduit('telechargement', 'bocs')).toEqual({
      libelle: 'Télécharger',
      href: null,
      actif: false,
      mention: 'Bientôt disponible',
    });
  });

  it('désactive l\'essai tant qu\'il n\'est pas disponible', () => {
    expect(actionProduit('essai', 'fec-analyzer')).toEqual({
      libelle: 'Essayer gratuitement',
      href: null,
      actif: false,
      mention: 'Bientôt disponible',
    });
  });
});
```

Run : `npm test`

Expected : FAIL, le module `../../src/lib/produits` est introuvable.

- [ ] **Étape 3 : Implémentation du bouton d'action**

`src/lib/produits.ts` :

```ts
export type Disponibilite = 'contact' | 'telechargement' | 'essai';

export interface ActionProduit {
  libelle: string;
  href: string | null;
  actif: boolean;
  mention: string | null;
}

const MENTION_A_VENIR = 'Bientôt disponible';

export function actionProduit(disponibilite: Disponibilite, slug: string): ActionProduit {
  switch (disponibilite) {
    case 'contact':
      return {
        libelle: 'Demander une démo',
        href: `/contact/?produit=${encodeURIComponent(slug)}`,
        actif: true,
        mention: null,
      };
    case 'telechargement':
      return { libelle: 'Télécharger', href: null, actif: false, mention: MENTION_A_VENIR };
    case 'essai':
      return { libelle: 'Essayer gratuitement', href: null, actif: false, mention: MENTION_A_VENIR };
  }
}
```

Run : `npm test`

Expected : 3 tests PASS.

- [ ] **Étape 4 : Tests des articles (échec attendu)**

`tests/lib/blog.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { filtrerPublies, listerTags, trierParDate } from '../../src/lib/blog';

const article = (id: string, date: string, brouillon: boolean, tags: string[] = []) => ({
  id,
  data: { date: new Date(date), brouillon, tags },
});

describe('filtrerPublies', () => {
  const articles = [article('a', '2026-01-01', false), article('b', '2026-01-02', true)];

  it('exclut les brouillons par défaut', () => {
    expect(filtrerPublies(articles, false).map((a) => a.id)).toEqual(['a']);
  });

  it('inclut les brouillons quand demandé', () => {
    expect(filtrerPublies(articles, true).map((a) => a.id)).toEqual(['a', 'b']);
  });
});

describe('trierParDate', () => {
  it('classe le plus récent en premier sans modifier le tableau source', () => {
    const articles = [article('ancien', '2025-06-01', false), article('recent', '2026-03-15', false)];
    const tries = trierParDate(articles);
    expect(tries.map((a) => a.id)).toEqual(['recent', 'ancien']);
    expect(articles.map((a) => a.id)).toEqual(['ancien', 'recent']);
  });
});

describe('listerTags', () => {
  it('renvoie les tags uniques triés en français', () => {
    const articles = [
      article('a', '2026-01-01', false, ['sql-server', 'sage-100']),
      article('b', '2026-01-02', false, ['sage-100', 'écritures']),
    ];
    expect(listerTags(articles)).toEqual(['écritures', 'sage-100', 'sql-server']);
  });
});
```

Run : `npm test`

Expected : FAIL, le module `../../src/lib/blog` est introuvable.

- [ ] **Étape 5 : Implémentation des fonctions d'articles**

`src/lib/blog.ts` :

```ts
export function filtrerPublies<T extends { data: { brouillon: boolean } }>(
  articles: T[],
  inclureBrouillons: boolean,
): T[] {
  return inclureBrouillons ? articles : articles.filter((a) => !a.data.brouillon);
}

export function trierParDate<T extends { data: { date: Date } }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function listerTags<T extends { data: { tags: string[] } }>(articles: T[]): string[] {
  const uniques = new Set(articles.flatMap((a) => a.data.tags));
  return [...uniques].sort((a, b) => a.localeCompare(b, 'fr'));
}
```

Run : `npm test`

Expected : tous les tests PASS.

- [ ] **Étape 6 : Test de format de date (échec attendu)**

`tests/lib/dates.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { formaterDate } from '../../src/lib/dates';

describe('formaterDate', () => {
  it('formate une date en français long', () => {
    expect(formaterDate(new Date('2026-09-02T12:00:00Z'))).toBe('2 septembre 2026');
  });

  it('formate le premier jour du mois avec le chiffre 1', () => {
    expect(formaterDate(new Date('2026-01-01T12:00:00Z'))).toBe('1 janvier 2026');
  });
});
```

Run : `npm test`

Expected : FAIL, le module `../../src/lib/dates` est introuvable.

- [ ] **Étape 7 : Implémentation du format de date**

`src/lib/dates.ts` :

```ts
const formateur = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' });

export function formaterDate(date: Date): string {
  return formateur.format(date);
}

export function dateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
```

Run : `npm test`

Expected : tous les tests PASS. Si le test du 1er janvier renvoie `1er janvier 2026`, adapter l'attendu du test à ce que renvoie Node 24 pour `fr-FR` et le noter dans le message de commit.

- [ ] **Étape 8 : Commit**

```bash
git add -A
git commit -m "feat(lib): bouton d'action produit, tri des articles, format de date, avec tests

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4 : Layout de base, en-tête, pied de page et SEO

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `Base.astro` avec props `{ titre: string; description: string; typeOg?: 'website' | 'article'; sansSuffixe?: boolean }`. Le `<title>` vaut `titre` si `sansSuffixe`, sinon `${titre} · Bresnik`. Slot par défaut = contenu principal dans `<main>`.

- [ ] **Étape 1 : En-tête**

`src/components/Header.astro` :

```astro
---
const liens = [
  { href: '/', libelle: 'Accueil' },
  { href: '/produits/', libelle: 'Produits' },
  { href: '/conseil/', libelle: 'Conseil' },
  { href: '/blog/', libelle: 'Blog' },
  { href: '/contact/', libelle: 'Contact' },
];
const cheminCourant = Astro.url.pathname;
const estActif = (href: string) => (href === '/' ? cheminCourant === '/' : cheminCourant.startsWith(href));
---
<header class="border-b" style="border-color: var(--couleur-bordure)">
  <div class="mx-auto flex max-w-(--largeur-contenu) items-center justify-between px-4 py-4">
    <a href="/" class="text-xl font-bold" aria-label="Bresnik, accueil">Bresnik</a>
    <nav aria-label="Navigation principale">
      <ul class="flex gap-4">
        {liens.map((lien) => (
          <li>
            <a href={lien.href} aria-current={estActif(lien.href) ? 'page' : undefined} class="hover:underline">
              {lien.libelle}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </div>
</header>
```

- [ ] **Étape 2 : Pied de page**

`src/components/Footer.astro` :

```astro
---
const annee = new Date().getFullYear();
---
<footer class="mt-16 border-t" style="border-color: var(--couleur-bordure)">
  <div class="mx-auto flex max-w-(--largeur-contenu) flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm">
    <p>© {annee} Bresnik. Logiciels complémentaires pour l'écosystème Sage 100.</p>
    <ul class="flex gap-4">
      <li><a href="/mentions-legales/" class="hover:underline">Mentions légales</a></li>
      <li><a href="/confidentialite/" class="hover:underline">Confidentialité</a></li>
      <li><a href="/rss.xml" class="hover:underline">Flux RSS</a></li>
    </ul>
  </div>
</footer>
```

- [ ] **Étape 3 : Layout de base**

`src/layouts/Base.astro` :

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  titre: string;
  description: string;
  typeOg?: 'website' | 'article';
  sansSuffixe?: boolean;
}

const { titre, description, typeOg = 'website', sansSuffixe = false } = Astro.props;
const titreComplet = sansSuffixe ? titre : `${titre} · Bresnik`;
const urlCanonique = new URL(Astro.url.pathname, Astro.site);
const jetonAnalytics = import.meta.env.PUBLIC_CF_BEACON_TOKEN;
---
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{titreComplet}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={urlCanonique} />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <link rel="alternate" type="application/rss+xml" title="Blog Bresnik" href={new URL('/rss.xml', Astro.site)} />
    <meta property="og:type" content={typeOg} />
    <meta property="og:title" content={titreComplet} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={urlCanonique} />
    <meta property="og:site_name" content="Bresnik" />
    <meta property="og:locale" content="fr_FR" />
    <meta name="generator" content={Astro.generator} />
  </head>
  <body class="min-h-screen">
    <Header />
    <main class="mx-auto max-w-(--largeur-contenu) px-4 py-8">
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

- [ ] **Étape 4 : Accueil sur le layout**

Remplacer `src/pages/index.astro` par :

```astro
---
import Base from '../layouts/Base.astro';
---
<Base titre="Bresnik" description="Logiciels complémentaires pour l'écosystème Sage 100 et conseil Sage." sansSuffixe>
  <h1 class="text-3xl font-bold">Bresnik</h1>
  <p class="mt-4">Logiciels complémentaires pour l'écosystème Sage 100.</p>
</Base>
```

- [ ] **Étape 5 : Vérifier le rendu**

Run : `npm run check && npm run build && grep -o '<link rel="canonical" href="[^"]*"' dist/index.html && grep -c 'aria-current="page"' dist/index.html`

Expected : `0 errors` ; la balise canonique vaut `https://bresnik-www.workers.dev/` ; le compteur affiche `1` (le lien Accueil est actif). Aucune balise `beacon.min.js` ne doit apparaître car la variable `PUBLIC_CF_BEACON_TOKEN` n'est pas définie.

- [ ] **Étape 6 : Commit**

```bash
git add -A
git commit -m "feat(layout): squelette HTML, navigation, pied de page et balises SEO

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5 : Accueil, catalogue et fiches produit

**Files:**
- Create: `src/components/CarteProduit.astro`, `src/pages/produits/index.astro`, `src/pages/produits/[id].astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getCollection('produits')`, `render()` d'`astro:content` ; `actionProduit()` de `src/lib/produits.ts` ; `Base.astro`.
- Produces: `CarteProduit.astro` avec prop `produit: CollectionEntry<'produits'>` ; routes `/produits/` et `/produits/<id>/`.

- [ ] **Étape 1 : Carte produit**

`src/components/CarteProduit.astro` :

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  produit: CollectionEntry<'produits'>;
}

const { produit } = Astro.props;
const cibleLibelle = produit.data.cible === 'consultant' ? 'Pour les consultants Sage' : 'Pour les entreprises';
---
<article class="rounded border p-4" style="border-color: var(--couleur-bordure)">
  <p class="text-xs uppercase" style="color: var(--couleur-texte-secondaire)">{cibleLibelle}</p>
  <h3 class="mt-1 text-xl font-semibold">
    <a href={`/produits/${produit.id}/`} class="hover:underline">{produit.data.nom}</a>
  </h3>
  <p class="mt-2">{produit.data.accroche}</p>
  {produit.data.modulesSage.length > 0 && (
    <p class="mt-2 text-sm" style="color: var(--couleur-texte-secondaire)">
      {produit.data.modulesSage.join(', ')}
    </p>
  )}
</article>
```

- [ ] **Étape 2 : Catalogue**

`src/pages/produits/index.astro` :

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import CarteProduit from '../../components/CarteProduit.astro';

const produits = (await getCollection('produits', ({ data }) => data.publie)).sort(
  (a, b) => a.data.ordre - b.data.ordre,
);
const pourEntreprises = produits.filter((p) => p.data.cible === 'entreprise');
const pourConsultants = produits.filter((p) => p.data.cible === 'consultant');
---
<Base titre="Produits" description="Logiciels Bresnik complémentaires à Sage 100 : comptabilité, gestion commerciale, outils pour consultants.">
  <h1 class="text-3xl font-bold">Produits</h1>
  <p class="mt-4">Des logiciels Windows qui complètent Sage 100, conçus par un consultant Sage.</p>

  <section class="mt-10" aria-labelledby="entreprises">
    <h2 id="entreprises" class="text-2xl font-semibold">Pour les entreprises utilisatrices de Sage 100</h2>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      {pourEntreprises.map((produit) => <CarteProduit produit={produit} />)}
    </div>
  </section>

  <section class="mt-10" aria-labelledby="consultants">
    <h2 id="consultants" class="text-2xl font-semibold">Pour les consultants Sage</h2>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      {pourConsultants.map((produit) => <CarteProduit produit={produit} />)}
    </div>
  </section>
</Base>
```

- [ ] **Étape 3 : Fiche produit**

`src/pages/produits/[id].astro` :

```astro
---
import { getCollection, render } from 'astro:content';
import { Image } from 'astro:assets';
import Base from '../../layouts/Base.astro';
import { actionProduit } from '../../lib/produits';

export async function getStaticPaths() {
  const produits = await getCollection('produits', ({ data }) => data.publie);
  return produits.map((produit) => ({ params: { id: produit.id }, props: { produit } }));
}

const { produit } = Astro.props;
const { Content } = await render(produit);
const action = actionProduit(produit.data.disponibilite, produit.id);
const cibleLibelle = produit.data.cible === 'consultant' ? 'Pour les consultants Sage' : 'Pour les entreprises';
---
<Base titre={produit.data.nom} description={produit.data.accroche}>
  <p class="text-xs uppercase" style="color: var(--couleur-texte-secondaire)">{cibleLibelle}</p>
  <h1 class="mt-1 text-3xl font-bold">{produit.data.nom}</h1>
  <p class="mt-2 text-xl">{produit.data.accroche}</p>

  <p class="mt-6">
    {action.actif && action.href ? (
      <a
        href={action.href}
        class="inline-block rounded px-4 py-2 font-semibold"
        style="background: var(--couleur-accent); color: var(--couleur-accent-contraste)"
      >
        {action.libelle}
      </a>
    ) : (
      <span class="inline-flex items-center gap-2">
        <button type="button" disabled class="rounded border px-4 py-2 font-semibold opacity-60" style="border-color: var(--couleur-bordure)">
          {action.libelle}
        </button>
        <span class="text-sm" style="color: var(--couleur-texte-secondaire)">{action.mention}</span>
      </span>
    )}
  </p>

  <section class="prose mt-8 max-w-none">
    <Content />
  </section>

  <section class="mt-8" aria-labelledby="fonctionnalites">
    <h2 id="fonctionnalites" class="text-2xl font-semibold">Fonctionnalités</h2>
    <ul class="mt-3 list-disc pl-6">
      {produit.data.fonctionnalites.map((f) => <li>{f}</li>)}
    </ul>
  </section>

  {produit.data.captures.length > 0 && (
    <section class="mt-8" aria-labelledby="captures">
      <h2 id="captures" class="text-2xl font-semibold">Captures d'écran</h2>
      <div class="mt-3 grid gap-4 md:grid-cols-2">
        {produit.data.captures.map((c) => <Image src={c.src} alt={c.alt} width={800} />)}
      </div>
    </section>
  )}

  <section class="mt-8" aria-labelledby="fiche">
    <h2 id="fiche" class="text-2xl font-semibold">Fiche technique</h2>
    <dl class="mt-3 grid gap-2 sm:grid-cols-[max-content_1fr]">
      <dt class="font-semibold">Plateforme</dt>
      <dd>{produit.data.plateforme}</dd>
      <dt class="font-semibold">Modules Sage</dt>
      <dd>{produit.data.modulesSage.length > 0 ? produit.data.modulesSage.join(', ') : 'Indépendant des modules'}</dd>
      <dt class="font-semibold">Objets métiers Sage</dt>
      <dd>{produit.data.objetsMetiersSage ? 'Oui, s\'appuie sur les Objets métiers Sage' : 'Non'}</dd>
    </dl>
  </section>
</Base>
```

- [ ] **Étape 4 : Accueil avec les produits**

Remplacer `src/pages/index.astro` par :

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import CarteProduit from '../components/CarteProduit.astro';

const produits = (await getCollection('produits', ({ data }) => data.publie)).sort(
  (a, b) => a.data.ordre - b.data.ordre,
);
---
<Base titre="Bresnik" description="Logiciels complémentaires pour l'écosystème Sage 100 et conseil Sage, par Nicolas Bresson." sansSuffixe>
  <section>
    <h1 class="text-4xl font-bold">Des logiciels qui complètent Sage 100</h1>
    <p class="mt-4 max-w-2xl text-lg">
      Bresnik conçoit des applications Windows pour Sage 100 Comptabilité et Gestion commerciale,
      et des outils pour les consultants Sage. Elles s'appuient sur SQL Server et sur les Objets métiers Sage.
    </p>
    <p class="mt-6 flex gap-4">
      <a href="/produits/" class="rounded px-4 py-2 font-semibold" style="background: var(--couleur-accent); color: var(--couleur-accent-contraste)">Voir les produits</a>
      <a href="/contact/" class="rounded border px-4 py-2 font-semibold" style="border-color: var(--couleur-bordure)">Nous contacter</a>
    </p>
  </section>

  <section class="mt-12" aria-labelledby="produits">
    <h2 id="produits" class="text-2xl font-semibold">Produits</h2>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      {produits.map((produit) => <CarteProduit produit={produit} />)}
    </div>
  </section>

  <section class="mt-12" aria-labelledby="conseil">
    <h2 id="conseil" class="text-2xl font-semibold">Conseil Sage</h2>
    <p class="mt-3 max-w-2xl">
      Nicolas Bresson est consultant sur Sage 100 Comptabilité, Gestion commerciale, Moyens de paiement,
      Immobilisations, Reporting et Batigest.
    </p>
    <p class="mt-3"><a href="/conseil/" class="underline">En savoir plus sur l'activité de conseil</a></p>
  </section>
</Base>
```

- [ ] **Étape 5 : Vérifier**

Run : `npm run check && npm run build && ls dist/produits && grep -o 'href="/contact/?produit=bocs"' dist/produits/bocs/index.html`

Expected : `0 errors` ; `dist/produits/` contient `index.html` et les dossiers `bocs`, `bankbridge`, `fec-analyzer`, `majtarifpq`, `linkcsvsage` ; le lien de démo pré-rempli est présent dans la fiche BOCS.

- [ ] **Étape 6 : Commit**

```bash
git add -A
git commit -m "feat(produits): accueil, catalogue par cible et fiches produit

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6 : Pages éditoriales : conseil, mentions légales, confidentialité

**Files:**
- Create: `src/content/pages/conseil.md`, `src/content/pages/mentions-legales.md`, `src/content/pages/confidentialite.md`, `src/components/PageEditoriale.astro`, `src/pages/conseil.astro`, `src/pages/mentions-legales.astro`, `src/pages/confidentialite.astro`
- Delete: `src/content/pages/.gitkeep`

**Interfaces:**
- Consumes: collection `pages` (champs `titre`, `description`), `getEntry`, `render`, `Base.astro`.
- Produces: `PageEditoriale.astro` avec prop `id: string` (identifiant d'une entrée de `pages`) ; routes `/conseil/`, `/mentions-legales/`, `/confidentialite/`.

- [ ] **Étape 1 : Textes**

`src/content/pages/conseil.md` :

```markdown
---
titre: Conseil Sage
description: Consultant Sage 100 : Comptabilité, Gestion commerciale, Moyens de paiement, Immobilisations, Reporting, Batigest.
---

## Un consultant Sage qui développe ses propres outils

Nicolas Bresson accompagne les entreprises et les cabinets sur les logiciels
Sage français : Sage 100 Comptabilité, Gestion commerciale, Moyens de
paiement, Immobilisations, Reporting et Batigest. Tous ces logiciels
fonctionnent avec SQL Server.

## Domaines d'intervention

- Paramétrage, migration et reprise de données Sage 100.
- Administration et optimisation des bases SQL Server des logiciels Sage.
- Automatisation et interfaces autour des Objets métiers Sage.
- Reporting et analyse comptable.

## Pourquoi Bresnik

Les produits Bresnik sont nés de missions de conseil : chaque logiciel
répond à un besoin rencontré sur le terrain que Sage ne couvre pas.

[Nous contacter](/contact/)
```

`src/content/pages/mentions-legales.md` :

```markdown
---
titre: Mentions légales
description: Mentions légales du site Bresnik.
---

## Éditeur du site

Bresnik, marque de Nicolas Bresson.

Forme juridique, SIRET et adresse : **À compléter avant la mise en ligne sur
bresnik.fr.**

Contact : voir la [page de contact](/contact/).

## Hébergement

Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis.

## Propriété intellectuelle

Les noms Bresnik, BOCS, BankBridge, FEC Analyzer, MajTarifPQ et LinkCsvSage,
ainsi que les contenus de ce site, sont la propriété de leur éditeur. Sage et
Sage 100 sont des marques de Sage Group plc ; Bresnik est un éditeur
indépendant.
```

`src/content/pages/confidentialite.md` :

```markdown
---
titre: Politique de confidentialité
description: Données collectées par le site Bresnik et leur utilisation.
---

## Données collectées

Ce site ne dépose aucun cookie et n'utilise aucun traceur publicitaire. La
mesure d'audience, lorsqu'elle est activée, repose sur Cloudflare Web
Analytics, qui n'utilise ni cookie ni identifiant individuel.

## Formulaire de contact

Les informations saisies dans le formulaire de contact (nom, email, société,
message) servent uniquement à répondre à votre demande. Elles sont
transmises par email à l'éditeur du site et ne sont ni stockées sur le site,
ni transmises à des tiers à d'autres fins.

## Vos droits

Vous pouvez demander l'accès, la rectification ou la suppression des données
vous concernant en écrivant via la [page de contact](/contact/).
```

Supprimer `src/content/pages/.gitkeep`.

- [ ] **Étape 2 : Composant de page éditoriale**

`src/components/PageEditoriale.astro` :

```astro
---
import { getEntry, render } from 'astro:content';
import Base from '../layouts/Base.astro';

interface Props {
  id: string;
}

const { id } = Astro.props;
const page = await getEntry('pages', id);
if (!page) {
  throw new Error(`Page éditoriale introuvable : ${id}`);
}
const { Content } = await render(page);
---
<Base titre={page.data.titre} description={page.data.description}>
  <h1 class="text-3xl font-bold">{page.data.titre}</h1>
  <div class="prose mt-6 max-w-none">
    <Content />
  </div>
</Base>
```

- [ ] **Étape 3 : Les trois routes**

`src/pages/conseil.astro` :

```astro
---
import PageEditoriale from '../components/PageEditoriale.astro';
---
<PageEditoriale id="conseil" />
```

`src/pages/mentions-legales.astro` :

```astro
---
import PageEditoriale from '../components/PageEditoriale.astro';
---
<PageEditoriale id="mentions-legales" />
```

`src/pages/confidentialite.astro` :

```astro
---
import PageEditoriale from '../components/PageEditoriale.astro';
---
<PageEditoriale id="confidentialite" />
```

- [ ] **Étape 4 : Vérifier**

Run : `npm run check && npm run build && ls dist/conseil dist/mentions-legales dist/confidentialite && grep -c "À compléter" dist/mentions-legales/index.html`

Expected : `0 errors` ; chaque dossier contient `index.html` ; le compteur affiche `1`.

- [ ] **Étape 5 : Commit**

```bash
git add -A
git commit -m "feat(pages): conseil, mentions légales et confidentialité depuis le contenu Markdown

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7 : Blog, tags et flux RSS

**Files:**
- Create: `src/components/CarteArticle.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[id].astro`, `src/pages/blog/tags/[tag].astro`, `src/pages/rss.xml.ts`, `src/content/blog/bienvenue.mdx`
- Delete: `src/content/blog/.gitkeep`

**Interfaces:**
- Consumes: collection `blog`, `filtrerPublies`, `trierParDate`, `listerTags` de `src/lib/blog.ts`, `formaterDate` et `dateIso` de `src/lib/dates.ts`, `Base.astro`.
- Produces: routes `/blog/`, `/blog/<id>/`, `/blog/tags/<tag>/`, `/rss.xml`. Les brouillons sont visibles en `npm run dev` et exclus du build.

- [ ] **Étape 1 : Article d'exemple en brouillon**

`src/content/blog/bienvenue.mdx` :

```mdx
---
titre: Bienvenue sur le blog Bresnik
description: Ce que vous trouverez ici : retours d'expérience Sage 100, SQL Server et Objets métiers Sage.
date: 2026-09-02
tags:
  - bresnik
brouillon: true
---

Ce blog partagera des retours d'expérience de terrain sur Sage 100, SQL Server
et les Objets métiers Sage. Cet article est un brouillon : il n'apparaît pas
sur le site publié tant que `brouillon` vaut `true`.
```

Supprimer `src/content/blog/.gitkeep`.

- [ ] **Étape 2 : Carte d'article**

`src/components/CarteArticle.astro` :

```astro
---
import type { CollectionEntry } from 'astro:content';
import { dateIso, formaterDate } from '../lib/dates';

interface Props {
  article: CollectionEntry<'blog'>;
}

const { article } = Astro.props;
---
<article class="border-b py-4" style="border-color: var(--couleur-bordure)">
  <p class="text-sm" style="color: var(--couleur-texte-secondaire)">
    <time datetime={dateIso(article.data.date)}>{formaterDate(article.data.date)}</time>
    {article.data.brouillon && <span class="ml-2 rounded border px-1 text-xs">Brouillon</span>}
  </p>
  <h3 class="mt-1 text-xl font-semibold">
    <a href={`/blog/${article.id}/`} class="hover:underline">{article.data.titre}</a>
  </h3>
  <p class="mt-2">{article.data.description}</p>
  {article.data.tags.length > 0 && (
    <ul class="mt-2 flex flex-wrap gap-2 text-sm">
      {article.data.tags.map((tag) => (
        <li><a href={`/blog/tags/${tag}/`} class="underline">#{tag}</a></li>
      ))}
    </ul>
  )}
</article>
```

- [ ] **Étape 3 : Liste des articles**

`src/pages/blog/index.astro` :

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import CarteArticle from '../../components/CarteArticle.astro';
import { filtrerPublies, listerTags, trierParDate } from '../../lib/blog';

const tous = await getCollection('blog');
const articles = trierParDate(filtrerPublies(tous, import.meta.env.DEV));
const tags = listerTags(articles);
---
<Base titre="Blog" description="Retours d'expérience sur Sage 100, SQL Server et les Objets métiers Sage.">
  <h1 class="text-3xl font-bold">Blog</h1>
  <p class="mt-4">Retours d'expérience sur Sage 100, SQL Server et les Objets métiers Sage.</p>

  {tags.length > 0 && (
    <ul class="mt-6 flex flex-wrap gap-2 text-sm" aria-label="Tags">
      {tags.map((tag) => (
        <li><a href={`/blog/tags/${tag}/`} class="rounded border px-2 py-1" style="border-color: var(--couleur-bordure)">#{tag}</a></li>
      ))}
    </ul>
  )}

  {articles.length === 0 ? (
    <p class="mt-8">Aucun article pour le moment. Abonnez-vous au <a href="/rss.xml" class="underline">flux RSS</a>.</p>
  ) : (
    <div class="mt-8">
      {articles.map((article) => <CarteArticle article={article} />)}
    </div>
  )}
</Base>
```

- [ ] **Étape 4 : Page d'article**

`src/pages/blog/[id].astro` :

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import { filtrerPublies } from '../../lib/blog';
import { dateIso, formaterDate } from '../../lib/dates';

export async function getStaticPaths() {
  const articles = filtrerPublies(await getCollection('blog'), import.meta.env.DEV);
  return articles.map((article) => ({ params: { id: article.id }, props: { article } }));
}

const { article } = Astro.props;
const { Content } = await render(article);
---
<Base titre={article.data.titre} description={article.data.description} typeOg="article">
  <article>
    <p class="text-sm" style="color: var(--couleur-texte-secondaire)">
      Publié le <time datetime={dateIso(article.data.date)}>{formaterDate(article.data.date)}</time>
      {article.data.miseAJour && (
        <span>, mis à jour le <time datetime={dateIso(article.data.miseAJour)}>{formaterDate(article.data.miseAJour)}</time></span>
      )}
    </p>
    <h1 class="mt-1 text-3xl font-bold">{article.data.titre}</h1>
    <p class="mt-2 text-lg">{article.data.description}</p>
    <div class="prose mt-8 max-w-none">
      <Content />
    </div>
    {article.data.tags.length > 0 && (
      <ul class="mt-8 flex flex-wrap gap-2 text-sm" aria-label="Tags">
        {article.data.tags.map((tag) => (
          <li><a href={`/blog/tags/${tag}/`} class="underline">#{tag}</a></li>
        ))}
      </ul>
    )}
  </article>
  <p class="mt-8"><a href="/blog/" class="underline">← Tous les articles</a></p>
</Base>
```

- [ ] **Étape 5 : Page de tag**

`src/pages/blog/tags/[tag].astro` :

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../../layouts/Base.astro';
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
  <h1 class="text-3xl font-bold">Tag : {tag}</h1>
  <div class="mt-8">
    {articles.map((article) => <CarteArticle article={article} />)}
  </div>
  <p class="mt-8"><a href="/blog/" class="underline">← Tous les articles</a></p>
</Base>
```

- [ ] **Étape 6 : Flux RSS**

`src/pages/rss.xml.ts` :

```ts
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { filtrerPublies, trierParDate } from '../lib/blog';

export async function GET(context: APIContext) {
  const articles = trierParDate(filtrerPublies(await getCollection('blog'), false));
  return rss({
    title: 'Blog Bresnik',
    description: "Retours d'expérience sur Sage 100, SQL Server et les Objets métiers Sage.",
    site: context.site!,
    items: articles.map((article) => ({
      title: article.data.titre,
      description: article.data.description,
      pubDate: article.data.date,
      link: `/blog/${article.id}/`,
    })),
    customData: '<language>fr-fr</language>',
  });
}
```

- [ ] **Étape 7 : Vérifier**

Run : `npm run check && npm run build && ls dist/blog && cat dist/rss.xml | head -5`

Expected : `0 errors` ; `dist/blog/` contient `index.html` mais **pas** de dossier `bienvenue` ni `tags` (l'article est un brouillon, donc aucun tag publié) ; `dist/rss.xml` commence par `<?xml` et contient `<language>fr-fr</language>`.

Puis passer temporairement `brouillon: false` dans `bienvenue.mdx`, relancer `npm run build`, vérifier que `dist/blog/bienvenue/index.html` et `dist/blog/tags/bresnik/index.html` existent, puis remettre `brouillon: true`.

- [ ] **Étape 8 : Commit**

```bash
git add -A
git commit -m "feat(blog): liste, articles, tags et flux RSS avec exclusion des brouillons

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8 : Contact (coquille), 404 et robots.txt

**Files:**
- Create: `src/pages/contact.astro`, `src/pages/404.astro`, `src/pages/robots.txt.ts`

**Interfaces:**
- Consumes: collection `produits`, `Base.astro`.
- Produces: route `/contact/` avec formulaire complet mais bouton d'envoi désactivé (activé par le plan « formulaire de contact ») ; le `<select name="produit">` est pré-sélectionné depuis `?produit=<slug>` ; `/404.html` ; `/robots.txt`.

- [ ] **Étape 1 : Page de contact**

`src/pages/contact.astro` :

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';

const produits = (await getCollection('produits', ({ data }) => data.publie)).sort(
  (a, b) => a.data.ordre - b.data.ordre,
);
---
<Base titre="Contact" description="Demandez une démonstration d'un produit Bresnik ou un échange sur votre projet Sage 100.">
  <h1 class="text-3xl font-bold">Contact</h1>
  <p class="mt-4">Demandez une démonstration ou décrivez votre besoin. Réponse sous deux jours ouvrés.</p>

  <form id="formulaire-contact" method="post" action="/api/contact" class="mt-8 grid max-w-xl gap-4">
    <label class="grid gap-1">
      <span>Nom <span aria-hidden="true">*</span></span>
      <input name="nom" type="text" required minlength="2" maxlength="100" autocomplete="name" class="rounded border px-3 py-2" style="border-color: var(--couleur-bordure)" />
    </label>
    <label class="grid gap-1">
      <span>Email <span aria-hidden="true">*</span></span>
      <input name="email" type="email" required autocomplete="email" class="rounded border px-3 py-2" style="border-color: var(--couleur-bordure)" />
    </label>
    <label class="grid gap-1">
      <span>Société</span>
      <input name="societe" type="text" maxlength="100" autocomplete="organization" class="rounded border px-3 py-2" style="border-color: var(--couleur-bordure)" />
    </label>
    <label class="grid gap-1">
      <span>Produit concerné</span>
      <select name="produit" class="rounded border px-3 py-2" style="border-color: var(--couleur-bordure)">
        <option value="">Aucun produit en particulier</option>
        {produits.map((p) => <option value={p.id}>{p.data.nom}</option>)}
      </select>
    </label>
    <label class="grid gap-1">
      <span>Message <span aria-hidden="true">*</span></span>
      <textarea name="message" required minlength="10" maxlength="5000" rows="6" class="rounded border px-3 py-2" style="border-color: var(--couleur-bordure)"></textarea>
    </label>
    <div class="hidden" aria-hidden="true">
      <label>Ne pas remplir <input name="site_web" type="text" tabindex="-1" autocomplete="off" /></label>
    </div>
    <p>
      <button type="submit" disabled class="rounded px-4 py-2 font-semibold opacity-60" style="background: var(--couleur-accent); color: var(--couleur-accent-contraste)">
        Envoyer
      </button>
    </p>
    <p id="etat-formulaire" class="text-sm" style="color: var(--couleur-texte-secondaire)" role="status">
      L'envoi en ligne sera activé prochainement.
    </p>
  </form>

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

- [ ] **Étape 2 : Page 404**

`src/pages/404.astro` :

```astro
---
import Base from '../layouts/Base.astro';
---
<Base titre="Page introuvable" description="La page demandée n'existe pas.">
  <h1 class="text-3xl font-bold">Page introuvable</h1>
  <p class="mt-4">La page demandée n'existe pas ou a été déplacée.</p>
  <ul class="mt-6 list-disc pl-6">
    <li><a href="/" class="underline">Retour à l'accueil</a></li>
    <li><a href="/produits/" class="underline">Voir les produits</a></li>
  </ul>
</Base>
```

- [ ] **Étape 3 : robots.txt**

`src/pages/robots.txt.ts` :

```ts
import type { APIContext } from 'astro';

export function GET(context: APIContext) {
  const sitemap = new URL('/sitemap-index.xml', context.site);
  const contenu = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap.href}`, ''].join('\n');
  return new Response(contenu, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
```

- [ ] **Étape 4 : Vérifier**

Run : `npm run check && npm run build && ls dist/404.html dist/robots.txt dist/contact/index.html dist/sitemap-index.xml && cat dist/robots.txt && grep -c '<option value="bankbridge">' dist/contact/index.html`

Expected : `0 errors` ; les quatre fichiers existent ; `robots.txt` contient `Sitemap: https://bresnik-www.workers.dev/sitemap-index.xml` ; le compteur affiche `1`.

- [ ] **Étape 5 : Commit**

```bash
git add -A
git commit -m "feat(pages): contact (formulaire inactif), page 404 et robots.txt

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9 : Configuration Cloudflare Workers et test local

**Files:**
- Create: `wrangler.jsonc`, `.dev.vars.example`

**Interfaces:**
- Produces: Worker `bresnik-www` servant `dist/` ; `npm run cf:dev` sert le site localement comme en production ; `npm run deploy` déploie (utilisé par Workers Builds, pas manuellement).

- [ ] **Étape 1 : Configuration Wrangler**

`wrangler.jsonc` :

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "bresnik-www",
  "compatibility_date": "2026-09-02",
  "workers_dev": true,
  "preview_urls": true,
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

Le champ `main` et `run_worker_first` seront ajoutés par le plan « formulaire de contact ». `html_handling` garde sa valeur par défaut `auto-trailing-slash`, cohérente avec `trailingSlash: 'always'` d'Astro.

`.dev.vars.example` :

```
# Copier en .dev.vars (ignoré par Git) pour le développement local avec wrangler dev.
# Aucun secret n'est nécessaire tant que le formulaire de contact n'est pas actif.
```

- [ ] **Étape 2 : Vérifier localement**

Run, dans un premier terminal : `npm run build && npx wrangler dev --port 8788`

Puis dans un second terminal :

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:8788/produits
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/produits/bocs/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/page-inexistante/
```

Expected : `200` ; `307 http://localhost:8788/produits/` ; `200` ; `404`. Arrêter `wrangler dev` (Ctrl+C).

Si `wrangler dev` demande une connexion Cloudflare, répondre non : le mode local n'en a pas besoin.

- [ ] **Étape 3 : Commit**

```bash
git add -A
git commit -m "chore(cloudflare): configuration Wrangler du Worker bresnik-www (assets statiques)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10 : Intégration continue GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: workflow `CI` exécuté sur chaque push et pull request ; échoue si `astro check`, les tests ou le build échouent.

- [ ] **Étape 1 : Workflow**

`.github/workflows/ci.yml` :

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  verifier:
    name: Vérifier, tester, construire
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm test
      - run: npm run build
```

- [ ] **Étape 2 : Vérifier localement la même séquence**

Run : `rm -rf node_modules && npm ci && npm run check && npm test && npm run build`

Expected : chaque commande réussit. Cette étape garantit que `package-lock.json` est cohérent avant que GitHub ne l'exécute.

- [ ] **Étape 3 : Commit**

```bash
git add -A
git commit -m "ci: vérification, tests et build sur chaque push

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11 : Dépôt GitHub privé et premier push

**Files:** aucun fichier ; opérations Git et GitHub.

**Interfaces:**
- Produces: dépôt `bresnik-www` privé sur le compte GitHub personnel, remote `origin`, branche `main` poussée, workflow CI vert.

- [ ] **Étape 1 : Vérifier l'authentification GitHub**

Run : `gh auth status`

Expected : `Logged in to github.com as <compte>`. Sinon, exécuter `gh auth login` dans un terminal interactif (choisir GitHub.com, HTTPS, connexion par navigateur) puis relancer.

- [ ] **Étape 2 : Créer le dépôt et pousser**

Run :

```bash
gh repo create bresnik-www --private --source=. --remote=origin --push
git remote -v
```

Expected : le dépôt `https://github.com/<compte>/bresnik-www` est créé, `origin` pointe dessus, `main` est poussée.

- [ ] **Étape 3 : Attendre le résultat du CI**

Run : `gh run watch --exit-status` (sélectionner l'exécution en cours si demandé) puis `gh run list --limit 1`

Expected : conclusion `success`. En cas d'échec, lire `gh run view --log-failed`, corriger, commiter, pousser, et relancer.

---

### Task 12 : Connexion à Cloudflare Workers Builds et mise en ligne

**Files:**
- Create: `docs/deploiement.md`
- Modify: `astro.config.mjs` (valeur de `site`)

**Interfaces:**
- Produces: site accessible sur `https://bresnik-www.<sous-domaine>.workers.dev`, déploiement automatique à chaque push sur `main`, URL de prévisualisation pour les autres branches ; `site` dans Astro égal à l'URL réelle.

- [ ] **Étape 1 : Documenter la procédure**

`docs/deploiement.md` :

```markdown
# Déploiement du site vitrine

## Production : Cloudflare Workers Builds

Le site est un Worker Cloudflare nommé `bresnik-www` qui sert le dossier
`dist/` en assets statiques. Le déploiement est automatique depuis GitHub.

### Connexion initiale (une seule fois, dans le tableau de bord Cloudflare)

1. Ouvrir https://dash.cloudflare.com → **Workers & Pages** → **Create** →
   **Import a repository**.
2. Autoriser Cloudflare à accéder au compte GitHub, puis choisir le dépôt
   `bresnik-www`.
3. Renseigner :
   - **Worker name** : `bresnik-www` (doit être identique au champ `name`
     de `wrangler.jsonc`, sinon le build échoue) ;
   - **Production branch** : `main` ;
   - **Build command** : `npm run build` ;
   - **Deploy command** : `npx wrangler deploy` (valeur par défaut) ;
   - **Non-production branch deploy command** : `npx wrangler versions upload`
     (valeur par défaut) ;
   - **Root directory** : laisser vide.
4. **Save and Deploy**. Le premier build dure une à deux minutes.
5. Noter l'URL affichée, de la forme
   `https://bresnik-www.<sous-domaine>.workers.dev`, et la reporter dans
   `site` de `astro.config.mjs`.

L'image de build utilise Node 24 par défaut ; le fichier `.nvmrc` du dépôt
fixe cette version. Si nécessaire, ajouter une variable de build
`NODE_VERSION=24` dans **Settings → Builds → Build variables**.

### Fonctionnement au quotidien

- Push sur `main` → build → déploiement en production.
- Push sur une autre branche → build → version de prévisualisation avec une
  URL `<version>-bresnik-www.<sous-domaine>.workers.dev`, visible dans
  **Deployments**.
- Les logs de build sont dans **Settings → Builds** et **Deployments**.

### Variables et secrets d'exécution

Aucun secret n'est requis pour le site statique. Le formulaire de contact
(plan séparé) ajoutera `BREVO_API_KEY`, `TURNSTILE_SECRET_KEY`,
`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` dans **Settings → Variables and
Secrets**, et `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_CF_BEACON_TOKEN` en
variables de build.

## Mesure d'audience

1. **Web Analytics** → **Add a site** → saisir le nom d'hôte du site.
2. Dans **Manage site**, copier le jeton du script (`token`).
3. L'ajouter en variable de build `PUBLIC_CF_BEACON_TOKEN` dans Workers
   Builds, puis relancer un déploiement. Le layout n'insère le script que si
   cette variable existe.

## Quand le domaine bresnik.fr sera acheté

1. Ajouter le domaine à Cloudflare (DNS chez Cloudflare) et faire pointer les
   serveurs de noms du registrar vers ceux fournis par Cloudflare.
2. Dans le Worker `bresnik-www` : **Settings → Domains & Routes → Add →
   Custom domain** : `bresnik.fr`, puis `www.bresnik.fr`.
3. Créer une règle de redirection `www.bresnik.fr/*` → `https://bresnik.fr/$1`
   (301) dans **Rules → Redirect Rules**.
4. Remplacer `site` dans `astro.config.mjs` par `https://bresnik.fr`,
   commiter, pousser.
5. Compléter les mentions légales (SIRET, forme juridique, adresse) avant
   cette bascule.

## Déploiement manuel de secours

    npm run build
    npx wrangler login
    npm run deploy
```

- [ ] **Étape 2 : Connecter le dépôt dans Cloudflare**

Action manuelle de Nicolas dans le tableau de bord, en suivant la section « Connexion initiale » ci-dessus. Résultat attendu : un premier déploiement réussi et une URL `workers.dev`.

- [ ] **Étape 3 : Reporter l'URL réelle**

Dans `astro.config.mjs`, remplacer `https://bresnik-www.workers.dev` par l'URL réelle notée à l'étape précédente (sans barre oblique finale).

Run : `npm run build && cat dist/robots.txt`

Expected : la ligne `Sitemap:` contient la nouvelle URL.

- [ ] **Étape 4 : Commit, push et vérification en ligne**

```bash
git add -A
git commit -m "docs(deploiement): procédure Workers Builds et URL de production

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push
```

Attendre la fin du build Cloudflare (onglet **Deployments**), puis :

```bash
URL="https://bresnik-www.<sous-domaine>.workers.dev"
curl -s -o /dev/null -w "%{http_code}\n" "$URL/"
curl -s -o /dev/null -w "%{http_code}\n" "$URL/produits/bocs/"
curl -s -o /dev/null -w "%{http_code}\n" "$URL/page-inexistante/"
curl -s "$URL/robots.txt"
```

Expected : `200`, `200`, `404`, et un `robots.txt` dont la ligne `Sitemap:` porte l'URL réelle.

---

## Auto-revue du plan

**Couverture de la spécification.** §2 inclus : accueil (T5), catalogue et fiches (T5), conseil (T6), blog avec tags et RSS (T7), contact pré-rempli (T8, envoi actif dans le plan suivant), légales (T6), 404, sitemap, robots, Open Graph (T4, T8), déploiement automatique (T9 à T12), analytics conditionnel (T4, T12). §5 modèle de contenu (T2). §6 pile (T1). §8 dépôt et déploiement (T11, T12). §9 CI et tests unitaires des fonctions pures (T3, T10) ; les tests de la fonction de contact appartiennent au plan suivant. §12 points ouverts : mentions légales marquées « À compléter » (T6).

**Placeholders.** Aucun « TBD » ; les seuls textes « À compléter » sont dans le contenu des mentions légales, conformément à la spec §12. L'URL `workers.dev` provisoire est remplacée en T12.

**Cohérence des noms.** `actionProduit`, `filtrerPublies`, `trierParDate`, `listerTags`, `formaterDate`, `dateIso` sont définis en T3 et utilisés à l'identique en T5, T7. Les props `titre`, `description`, `typeOg`, `sansSuffixe` de `Base.astro` (T4) sont utilisées à l'identique en T5 à T8. Les identifiants de collection (`produits`, `blog`, `pages`) et les champs de frontmatter correspondent entre T2 et les pages.
