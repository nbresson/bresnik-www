# Bresnik — Site vitrine statique (bresnik-www)

Date : 2026-09-02
Statut : validé par Nicolas Bresson le 2026-09-02. Amendé le 2026-09-02 :
Cloudflare Pages remplacé par Cloudflare Workers (assets statiques), sur
recommandation Cloudflare pour les nouveaux projets.

## 1. Contexte et objectif

Bresnik est la marque de Nicolas Bresson, consultant sur les logiciels Sage
français (Sage 100 Comptabilité, Gestion commerciale, Moyens de paiement,
Immobilisations, Reporting, Batigest), tous fonctionnant avec SQL Server.
La marque commercialise des logiciels complémentaires à cet écosystème.

Ce document décrit le **site vitrine** `bresnik.fr`. Il présente les produits,
l'activité de conseil et un blog technique. Il ne contient ni authentification,
ni paiement, ni espace client.

Le domaine `bresnik.fr` sera acheté plus tard. D'autres sites viendront se
greffer sur des sous-domaines (`app.bresnik.fr`, `<produit>.bresnik.fr`) et
seront des projets indépendants avec leur propre dépôt. Le site vitrine ne
doit jamais dépendre techniquement de ces futurs sites.

Langue : français uniquement.

## 2. Périmètre

### Inclus

- Page d'accueil.
- Catalogue de produits et une fiche par produit (5 produits au lancement).
- Page présentant l'activité de conseil Sage.
- Blog technique (articles Markdown/MDX, tags, flux RSS).
- Page de contact avec formulaire, pré-remplie avec le produit d'origine.
- Mentions légales et politique de confidentialité.
- Page 404, sitemap, robots.txt, balises Open Graph.
- Déploiement automatique sur Cloudflare Workers (assets statiques, Workers Builds).
- Analytics sans cookie (Cloudflare Web Analytics).

### Exclus (volontairement, pour plus tard)

- Téléchargement d'installeurs, licences, période d'essai. Le modèle de
  contenu prévoit le champ `disponibilite` pour l'accueillir sans refonte.
- Paiement en ligne.
- Authentification, espace client (futur `app.bresnik.fr`).
- CMS ou base de données : le contenu vit dans Git.
- Version multilingue.
- Le design graphique : il est traité après la mise en ligne de la structure.

## 3. Produits au lancement

| Slug | Nom | Cible | Objets métiers Sage | Résumé |
|---|---|---|---|---|
| `bocs` | BOCS | Consultant Sage | Non | Boîte à Outils du Consultant Sage : fonctions facilitant le travail sur les logiciels Sage, Windows et SQL Server. |
| `bankbridge` | BankBridge | Entreprise | Oui | Intégration semi-automatique d'extraits bancaires vers Sage 100 Comptabilité ; gestion budgétaire et prévisions de trésorerie. |
| `fec-analyzer` | FEC Analyzer | Entreprise | Non | Analyse du Fichier des Écritures Comptables : synthèse, anomalies, Balance, Grand-livre, comparatif N/N-1, recherche, exports. |
| `majtarifpq` | MajTarifPQ | Entreprise | Oui | Politique tarifaire Fournisseur → Article → Catégorie tarifaire → Client pour Sage 100 Gestion commerciale. |
| `linkcsvsage` | LinkCsvSage | Entreprise | Oui | Automatisation de l'export CSV des documents Sage 100 Gestion commerciale, avec rattachement au document Sage. |

Tous sont des applications WPF pour Windows. Tous sont en `disponibilite: contact`
au lancement.

## 4. Plan du site

| URL | Page | Contenu principal |
|---|---|---|
| `/` | Accueil | Promesse de la marque, les 5 produits, le conseil, derniers articles, appel au contact. |
| `/produits/` | Catalogue | Liste des produits, filtre par cible (consultant / entreprise). |
| `/produits/<slug>/` | Fiche produit | Accroche, description, fonctionnalités, captures, modules Sage, plateforme, bouton d'action piloté par `disponibilite`. |
| `/conseil/` | Conseil | Activité de consultant Sage, domaines d'intervention, appel au contact. |
| `/blog/` | Blog | Liste des articles publiés, tags. |
| `/blog/<slug>/` | Article | Contenu MDX. |
| `/blog/tags/<tag>/` | Tag | Articles portant le tag. |
| `/contact/` | Contact | Formulaire ; paramètre `?produit=<slug>` pré-remplit le sujet. |
| `/mentions-legales/` | Légal | SIRET, adresse, hébergeur (Cloudflare). |
| `/confidentialite/` | Légal | Traitement des données du formulaire, absence de cookies traceurs. |
| `/404` | Erreur | Retour vers l'accueil et les produits. |
| `/sitemap-index.xml`, `/rss.xml`, `/robots.txt` | Techniques | Générés au build. |

Toutes les URL se terminent par `/` (mode `trailingSlash: 'always'`).

## 5. Modèle de contenu (Astro Content Collections)

Les collections sont typées avec Zod. Un champ manquant ou invalide fait
échouer le build.

### Collection `produits` (`src/content/produits/<slug>.md`)

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `nom` | string | oui | Nom commercial. |
| `accroche` | string | oui | Une phrase, affichée en titre secondaire et dans les listes. |
| `cible` | `'consultant'` ou `'entreprise'` | oui | Pilote le filtre du catalogue. |
| `modulesSage` | string[] | oui | Ex. `["Sage 100 Comptabilité"]`. Peut être vide pour BOCS. |
| `objetsMetiersSage` | boolean | oui | Mention « s'appuie sur les Objets métiers Sage ». |
| `plateforme` | string | oui | `"Windows (WPF)"` au lancement. |
| `fonctionnalites` | string[] | oui | Puces de la fiche. |
| `logo` | image | non | Logo du produit (`./logos/<slug>.png` ou `.svg`), ajouté le 2026-09-04. |
| `captures` | `{ fichier: string, alt: string, titre?: string }[]` | non | Descriptions facultatives. Les fichiers eux-mêmes sont découverts dans `src/content/produits/captures/<slug>/` (convention adoptée le 2026-09-05) : toute image du dossier appartient au produit ; les captures décrites viennent en premier dans l'ordre des descriptions, les autres suivent par nom de fichier avec un titre déduit du nom et un `alt` par défaut. |
| `sousTitre` | `string` (48 max) | oui | Ajouté le 2026-09-05. Complète le nom dans le titre de la page : « Nom — Sous-titre », sans suffixe « · Bresnik ». |
| `description` | `string` (100 à 160) | oui | Ajouté le 2026-09-05. Description pour les moteurs et le partage ; l'accroche reste le texte affiché sous le titre. |
| `vedette` | `string` | non | Ajouté le 2026-09-05. Nom du fichier de la capture affichée dans le carrousel de l'accueil ; sans ce champ, ou si le fichier n'existe pas dans le dossier du produit (avertissement au build), la première capture est retenue. |
| `disponibilite` | `'contact'`, `'telechargement'` ou `'essai'` | oui | Pilote le bouton d'action. |
| `ordre` | number | oui | Ordre d'affichage. |
| `publie` | boolean | oui | `false` masque le produit partout. |

Le corps Markdown est la description longue.

Comportement du bouton d'action selon `disponibilite` :

- `contact` : « Demander une démo » → `/contact/?produit=<slug>`.
- `telechargement` : « Télécharger » → réservé, non implémenté ; affiche
  « Bientôt disponible » tant qu'aucune URL de téléchargement n'existe.
- `essai` : « Essayer gratuitement » → même réserve que ci-dessus.

Les deux valeurs réservées sont acceptées par le schéma dès maintenant pour
que le contenu n'ait pas à changer de forme plus tard.

### Collection `blog` (`src/content/blog/<slug>.mdx`)

| Champ | Type | Obligatoire |
|---|---|---|
| `titre` | string | oui |
| `description` | string | oui |
| `date` | date | oui |
| `miseAJour` | date | non |
| `tags` | string[] | oui |
| `brouillon` | boolean | oui (`true` = exclu du build en production) |
| `image` | image | non |

### Page conseil

Page Astro simple, contenu en Markdown dans `src/content/pages/conseil.md`
pour pouvoir l'éditer sans toucher au code.

## 6. Pile technique

| Élément | Choix | Raison |
|---|---|---|
| Générateur | Astro, `output: 'static'` | Site statique, SEO, rapidité, contenu en Markdown. |
| Styles | Tailwind CSS, tokens de marque en variables CSS dans `src/styles/tokens.css` | Rapidité de mise en page ; les tokens seront réutilisables dans les applications futures. |
| Contenu | Content Collections + MDX | Typage, validation au build. |
| Intégrations | `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/mdx` | Sitemap, RSS, articles riches. |
| Formulaire | Script Worker `worker/index.ts`, qui reçoit toutes les requêtes (`assets.run_worker_first: true` depuis le 2026-09-05) : il traite `/api/*`, pose `X-Robots-Tag: noindex, nofollow` sur les hôtes `*.workers.dev` et délègue le reste aux ressources statiques | Voir §7. |
| Anti-spam | Cloudflare Turnstile | Gratuit, sans cookie, invisible. |
| Envoi d'email | Brevo (API transactionnelle) | Service français, gratuit jusqu'à 300/jour, expéditeur Gmail vérifié possible avant l'achat du domaine. |
| Analytics | Cloudflare Web Analytics | Sans cookie, aucun bandeau de consentement. |
| Hébergement | Cloudflare Workers avec assets statiques, déployé par Workers Builds (intégration Git) | Gratuit, CDN, prévisualisations par branche. Cloudflare recommande Workers plutôt que Pages pour les nouveaux projets. |
| Gestionnaire de paquets | npm | Déjà installé. |
| Node | 24 (fichier `.nvmrc` et `engines`) | Version installée localement ; l'image de build Cloudflare respecte `.nvmrc`. |

Décision écartée : Astro en mode serveur avec l'adaptateur Cloudflare. Un
seul formulaire ne justifie pas de renoncer au statique.

Décision écartée : service tiers de formulaire (Formspree). Dépendance
externe, quota, données hors UE.

## 7. Formulaire de contact

### Côté client (`/contact/`)

Champs : nom, email, société (facultatif), produit (liste déroulante
alimentée par la collection, pré-sélectionnée via `?produit=`), message,
case de consentement obligatoire (ajoutée le 2026-09-04), widget Turnstile.
Envoi en `POST` vers `/api/contact` via `fetch`, avec repli sur un envoi de
formulaire classique si JavaScript est désactivé.

### Côté serveur (`worker/index.ts`)

1. N'accepte que `POST`, JSON ou `form-data`.
2. Valide : nom (2 à 100 caractères), email (format), message (10 à 5000
   caractères), produit (slug connu ou vide), champ pot-de-miel vide.
3. Vérifie le jeton Turnstile auprès de Cloudflare.
4. Envoie un email à l'adresse de Nicolas via l'API Brevo avec `reply-to`
   égal à l'email du visiteur, sans accusé de réception au visiteur pour
   l'instant (à ajouter quand `bresnik.fr` permettra un expéditeur au nom
   du domaine).
5. Répond `200` avec `{ ok: true }` ou `4xx/5xx` avec un message d'erreur
   générique. Aucune donnée n'est stockée.

Secrets, définis sur le Worker dans Cloudflare (jamais dans le dépôt) :
`BREVO_API_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_TO_EMAIL`,
`CONTACT_FROM_EMAIL`. La clé publique Turnstile est une variable publique
`PUBLIC_TURNSTILE_SITE_KEY`.

Le Worker ne traite que `/api/*` ; toute autre requête est servie depuis les
assets statiques (`dist/`). En développement local, `wrangler dev` sert le
site et le Worker avec un fichier `.dev.vars` ignoré par Git.

## 8. Dépôt et déploiement

- Dépôt Git privé `bresnik-www` sur le compte GitHub personnel de Nicolas.
  Ce dossier (`C:\Users\nbres\source\repos\Bresnik`) en est la racine.
- Branche principale : `main`. Travail sur des branches courtes, fusion
  par pull request.
- Worker `bresnik-www` (le nom dans `wrangler.jsonc` doit être identique à
  celui du tableau de bord) connecté au dépôt via Workers Builds :
  - build : `npm run build`, assets : `dist/` ;
  - déploiement : `npx wrangler deploy` sur `main` → production sur
    `bresnik-www.<sous-domaine>.workers.dev` ;
  - toute autre branche : `npx wrangler versions upload` → URL de
    prévisualisation.
- Quand `bresnik.fr` sera acheté : DNS chez Cloudflare, domaine personnalisé
  ajouté au Worker, `www` redirigé vers l'apex, `site` dans la
  configuration Astro passé de l'URL `workers.dev` à `https://bresnik.fr`.
  Aucun autre changement de code.

## 9. Qualité et tests

- Action GitHub sur chaque push et pull request : `npm ci`, `astro check`
  (types et schémas de contenu), `npm run build`.
- Tests unitaires (Vitest) sur la fonction de contact : validation des
  entrées, rejet sans jeton Turnstile, rejet du pot-de-miel, appel Brevo
  simulé. Les appels réseau sont mockés.
- Vérification des liens internes au build (intégration ou script).
- Accessibilité et performance (Lighthouse) : ajoutées avec le design.

## 10. Structure du dépôt

```
bresnik-www/
├── .github/workflows/ci.yml
├── docs/superpowers/specs/          # ce document
├── worker/index.ts                  # Worker : /api/contact
├── wrangler.jsonc                   # config Cloudflare (assets + worker)
├── public/                          # robots.txt, favicon, images statiques
├── src/
│   ├── components/                  # composants Astro réutilisables
│   ├── content.config.ts            # schémas Zod des collections
│   ├── content/
│   │   ├── produits/*.md
│   │   ├── blog/*.mdx
│   │   └── pages/conseil.md
│   ├── layouts/                     # Base, Page, Article
│   ├── pages/                       # routes (voir §4)
│   ├── styles/tokens.css            # variables CSS de la marque
│   └── lib/                         # helpers (SEO, dates, contact)
├── tests/                           # Vitest
├── astro.config.mjs
├── package.json
├── .nvmrc
└── .dev.vars.example
```

## 11. Ordre de réalisation

1. Dépôt Git, projet Astro, collections et schémas, les 5 produits en texte
   brut, layouts minimaux, toutes les routes existantes.
2. Dépôt GitHub, action CI, connexion Workers Builds : site en ligne.
3. Formulaire de contact : Turnstile, fonction, Brevo, tests.
4. Contenu des pages conseil, légales, premier article de blog, RSS.
5. Design graphique (spécification séparée).

## 12. Points ouverts

- Mentions légales : SIRET, forme juridique et adresse à fournir par Nicolas
  avant la mise en ligne publique. Des textes provisoires marqués
  « À compléter » sont acceptés sur `workers.dev`, pas sur `bresnik.fr`.
- Adresse email destinataire du formulaire, à définir lors de l'étape 3.
