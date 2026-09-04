# Bresnik — Design du site vitrine

Date : 2026-09-03
Statut : validé par Nicolas Bresson le 2026-09-04 (amendements du même jour : API Fonts d'Astro, favicons PNG)
Référence visuelle : maquette « Site vitrine Bresnik », direction « Atelier
technique », validée par Nicolas Bresson le 2026-09-03
(https://claude.ai/code/artifact/a9b86a44-16af-4072-ac18-ea8082fce24f).
Spécification amont : `2026-09-02-bresnik-www-design.md` (structure, contenu,
hébergement). Ce document ne la modifie pas ; il habille les pages qu'elle
définit.

## 1. Objectif et périmètre

Appliquer au site existant (Astro 7, Tailwind 4) la charte et les mises en
page de la maquette, sur toutes les pages, et livrer en même temps les points
d'accessibilité, de SEO et de qualité reportés par le plan précédent.

### Inclus

- Fondations : couleurs, typographie auto-hébergée, échelle, espacements,
  rayons, ombres, largeur de contenu, points de rupture.
- Composants : en-tête avec menu mobile, pied de page, boutons, étiquette de
  cible, carte produit, carte article, liste à coches, bande d'appel à
  l'action, en-tête de section, cadre de capture, fiche technique, champs de
  formulaire, lien d'évitement.
- Toutes les pages : accueil, catalogue, fiche produit, conseil, blog (liste,
  article, tag), contact, mentions légales, confidentialité, 404.
- Favicon et image Open Graph par défaut.
- Accessibilité : lien d'évitement, états de focus visibles, niveaux de
  titres corrects, associations ARIA manquantes, `noindex` sur la 404.
- Qualité : vérification des liens internes au build, mesure Lighthouse
  documentée avant fusion.

### Exclus

- Activation du formulaire de contact (plan séparé) ; la page reçoit son
  habillage, le bouton reste désactivé.
- Mode sombre : le site a un seul rendu, clair.
- Animations autres que les transitions d'état des liens et boutons.
- Captures d'écran réelles et articles : fournis par Nicolas ; les composants
  affichent un emplacement tant qu'ils sont absents.

## 2. Fondations

### 2.1 Couleurs

Déclarées en variables CSS dans `src/styles/tokens.css` et exposées à
Tailwind 4 par `@theme` dans `src/styles/global.css`, afin d'écrire
`bg-papier`, `text-encre`, `border-ligne`, etc.

| Nom | Valeur | Usage |
|---|---|---|
| `papier` | `#faf8f4` | Fond de page. |
| `papier-2` | `#f1ede4` | Bandes de section, barre de fenêtre. |
| `encre` | `#1c2331` | Texte principal, bandes sombres, bordure de bouton secondaire. |
| `encre-2` | `#4f5868` | Texte secondaire, fils d'Ariane, légendes. |
| `encre-claire` | `#c9cfdb` | Texte secondaire sur fond `encre`. |
| `ligne` | `#e2ddd2` | Bordures, séparateurs. |
| `blanc` | `#ffffff` | Fond des cartes. |
| `cobalt` | `#1f4fc7` | Accent : liens, bouton primaire, étiquette entreprises, eyebrows. |
| `cobalt-fonce` | `#183f9f` | Survol des liens et du bouton primaire. |
| `cobalt-teinte` | `#e6ecfa` | Fond de l'étiquette entreprises, lignes surlignées. |
| `ambre` | `#8f620f` | Texte de l'étiquette consultants. |
| `ambre-teinte` | `#fbf1dd` | Fond de l'étiquette consultants. |
| `succes` | `#1e6b45` | Alertes de succès (ajouté le 2026-09-04). |
| `succes-teinte` | `#e4f3ea` | Fond des alertes de succès. |
| `erreur` | `#b42318` | Erreurs de formulaire et alertes d'erreur (ajouté le 2026-09-04). |
| `erreur-teinte` | `#fbe9e7` | Fond des alertes d'erreur. |

Contrastes vérifiés (WCAG AA texte normal, ratio minimal 4,5) : `encre` sur
`papier` 14,8 ; `encre-2` sur `papier` 6,8 ; `cobalt` sur `papier` 6,6 ;
`blanc` sur `cobalt` 7,0 ; `ambre` sur `ambre-teinte` 4,8 ; `encre-claire`
sur `encre` 10,1. Aucune couleur n'est utilisée hors de ce tableau.

### 2.2 Typographie

Trois familles, auto-hébergées par l'API Fonts d'Astro avec le fournisseur
Fontsource : les fichiers sont téléchargés au build et servis depuis le site
(pas d'appel à Google Fonts au chargement : conformité RGPD et performance),
sous-ensemble latin, `font-display: swap`. Amendé le 2026-09-04 : cette API
remplace l'installation des paquets Fontsource prévue initialement.

| Rôle | Famille | Variable CSS | Graisses |
|---|---|---|---|
| Titres | Bricolage Grotesque | `--police-titres` | variable, 500 à 700 |
| Texte | Source Sans 3 | `--police-texte` | variable, 400 et 600 |
| Technique | JetBrains Mono | `--police-technique` | 500 |

Piles de repli : titres et texte `'Segoe UI', system-ui, sans-serif` ;
technique `Consolas, ui-monospace, monospace`.

Échelle (taille / interlignage / espacement de lettres). Desktop d'abord,
mobile entre parenthèses quand différent.

| Style | Famille, graisse | Desktop | Mobile |
|---|---|---|---|
| `titre-1` | Bricolage 700 | 64 px / 1,04 / −0,025 em | 38 px / 1,06 / −0,02 em |
| `titre-1-produit` | Bricolage 700 | 60 px / 1,05 / −0,025 em | 40 px / 1,06 |
| `titre-2` | Bricolage 700 | 40 px / 1,10 / −0,01 em | 28 px / 1,12 |
| `titre-2-petit` | Bricolage 700 | 30 px / 1,15 | 24 px / 1,2 |
| `titre-3` | Bricolage 600 | 24 px / 1,25 | 22 px / 1,25 |
| `sous-titre` | Source Sans 400 | 21 à 24 px / 1,4 à 1,5, couleur `encre-2` | 18 px / 1,5 |
| `texte` | Source Sans 400 | 17 à 19 px / 1,5 à 1,6 | 16 à 17 px / 1,45 à 1,5 |
| `texte-petit` | Source Sans 400 | 14 à 15 px / 1,5 | idem |
| `eyebrow` | JetBrains 500 | 13 px, majuscules, +0,08 em, `cobalt` | 12 px |
| `technique` | JetBrains 500 | 13 px, `encre-2` | 12 px |
| `etiquette` | JetBrains 500 | 12 px, majuscules, +0,04 em | 11 px |

Les titres de page utilisent `text-wrap: balance` ; les paragraphes
`text-wrap: pretty`. Largeur de lecture maximale des paragraphes : 65 à 70
caractères (`max-w-prose` ou 560 à 760 px selon la maquette).

### 2.3 Espace, formes, ombres

- Largeur de page de référence : 1440 px ; gouttières 80 px en desktop
  (contenu utile 1280 px), 20 px en mobile. Conteneur `max-w-[1440px]
  mx-auto px-5 lg:px-20`.
- Points de rupture Tailwind par défaut : `md` 768 px, `lg` 1024 px. Les
  grilles à 3 colonnes passent à 2 sous `lg` et à 1 sous `md`.
- Rythme vertical des sections : 88 à 96 px en desktop, 40 px en mobile.
- Espacement interne des cartes : 28 px (desktop), 20 px (mobile).
- Rayons : boutons et champs 6 px ; cartes 8 px ; fenêtres de capture et
  fiche technique 10 px ; bande d'appel à l'action 12 px ; étiquettes
  999 px.
- Ombre unique, réservée aux fenêtres de capture : `0 24px 48px -32px
  rgb(28 35 49 / 0.35)`.
- Bordures : 1 px `ligne` ; boutons secondaires 1,5 px `encre`.

### 2.4 Interactions

- Liens de texte : `cobalt`, `cobalt-fonce` au survol. Un lien placé dans un
  bloc de texte (paragraphe, fil d'Ariane, corps Markdown) est souligné,
  pour ne pas reposer sur la couleur seule ; les liens isolés (cartes,
  en-têtes de section, navigation) ne le sont pas.
- Boutons : transition de 150 ms sur la couleur de fond ; primaire
  `cobalt` → `cobalt-fonce` ; secondaire fond transparent → `papier-2` ;
  inverse (sur fond `encre`) `blanc` → `papier-2`.
- Focus clavier visible partout : anneau 2 px `cobalt` décalé de 2 px
  (`focus-visible:outline`), jamais supprimé.
- Cartes cliquables : bordure `cobalt` au survol, sans déplacement.

## 3. Composants

Chaque composant est un fichier `.astro` dans `src/components/`, sans état,
stylé avec les classes Tailwind issues des tokens. Aucun style en ligne.

| Composant | Fichier | Rôle et règles |
|---|---|---|
| Marque | `Marque.astro` | Mot-symbole « Bresnik » en Bricolage 700, le « k » final en `cobalt`. Prop `taille` (`en-tete` 26 px, `pied` 22 px, mobile 24 px). Lien vers `/`. |
| En-tête | `Header.astro` | Hauteur 80 px (64 px mobile), bordure basse `ligne`. Desktop : marque à gauche, navigation Produits, Conseil, Blog, Contact plus bouton primaire « Demander une démo » (44 px). Lien actif : `cobalt` avec soulignement 2 px. Mobile (sous `lg`) : bouton 44 px avec icône menu, `aria-expanded`, `aria-controls` ; au clic, un panneau sous l'en-tête liste les liens empilés et le bouton de démo pleine largeur. Script inline minimal, sans dépendance ; fonctionne sans JavaScript en affichant les liens dans le pied de page. |
| Lien d'évitement | dans `Base.astro` | Premier élément focalisable, « Aller au contenu », visible au focus seulement, cible `#contenu` sur `<main>`. |
| Pied de page | `Footer.astro` | Bordure haute `ligne`. Marque, mention « © 2026 Bresnik. Logiciels complémentaires pour l'écosystème Sage 100. Éditeur indépendant, sans lien avec Sage Group plc. », liens Mentions légales, Confidentialité, Flux RSS. L'année est fixée à 2026 (site statique). En mobile : empilé. Contient aussi les quatre liens principaux (Produits, Conseil, Blog, Contact) : c'est la navigation de repli quand JavaScript est désactivé. |
| Bouton | `Bouton.astro` | Props `variante` (`primaire`, `secondaire`, `inverse`), `href` ou `type`, `taille` (`normal` 52 px, `compact` 44 à 48 px), `fleche` (icône flèche 18 px à droite), `desactive`. Rendu `<a>` si `href`, sinon `<button>`. Pleine largeur en mobile quand `plein`. |
| Étiquette cible | `EtiquetteCible.astro` | Prop `cible`. `entreprise` : « Entreprises », `cobalt` sur `cobalt-teinte` ; `consultant` : « Consultants Sage », `ambre` sur `ambre-teinte`. Hauteur 26 px, style `etiquette`. |
| Carte produit | `CarteProduit.astro` | Fond `blanc`, bordure `ligne`, rayon 8, padding 28. Étiquette, nom en `titre-3` (lien), accroche en `texte`, modules en `technique` (ou « Sage · Windows · SQL Server » quand la liste est vide). Toute la carte est cliquable (lien sur le nom, zone étendue via pseudo-élément). |
| Carte d'appel | `CarteAppel.astro` | Sixième case de la grille produits : fond `encre`, texte blanc, titre `titre-3`, texte `encre-claire`, lien inverse avec flèche vers `/contact/`. |
| En-tête de section | `EnTeteSection.astro` | Eyebrow, `titre-2`, et à droite un lien avec flèche facultatif (`lienHref`, `lienLibelle`). En mobile le lien passe sous le titre. |
| Liste à coches | `ListeCoches.astro` | Prop `elements: string[]`. Chaque ligne : icône coche 22 px `cobalt`, texte 17 px, fond `blanc`, bordure `ligne`, rayon 8, padding 18 × 20. Grille 2 colonnes quand `colonnes = 2` (fiche produit), sinon empilée. |
| Bande d'appel | `BandeAppel.astro` | Fond `encre`, rayon 12, padding 56 × 64 (28 × 24 mobile). Titre 34 px blanc, texte `encre-claire`, bouton inverse « Demander une démo » à droite (empilé en mobile). Texte par défaut : « Voyons ce que vos données Sage peuvent faire de plus. » et « Une démonstration de 30 minutes sur votre cas, sans engagement. » |
| Cadre de capture | `CadreCapture.astro` | Fenêtre : bordure `ligne`, rayon 10, ombre, barre haute 40 px `papier-2` avec trois pastilles et un libellé `technique`. Contenu : l'image (`astro:assets`, largeur 800) si fournie, sinon la trame de lignes de la maquette et une légende « [Capture d'écran à insérer] ». Props `titre`, `image?`, `alt?`. |
| Fiche technique | `FicheTechnique.astro` | Carte `blanc`, rayon 10, padding 28. `<dl>` à deux colonnes : libellés en `etiquette` `encre-2`, valeurs en 600. Lignes : Plateforme, Modules Sage, Objets métiers, Accès (« Sur démonstration », « Téléchargement », « Essai gratuit » selon `disponibilite`). Séparateur, bouton primaire pleine largeur, phrase « Une question technique avant ? Écrivez-nous, le formulaire arrive pré-rempli. » |
| Carte article | `CarteArticle.astro` | Filet haut 2 px `encre`, padding vertical 24. Ligne `technique` date et premier tag, titre `titre-3` 22 px (lien), description `texte-petit` `encre-2`. Prop `niveauTitre` (`h2` ou `h3`) pour respecter la hiérarchie de la page. Liste de tags avec `aria-label="Tags"`. |
| Champ | `Champ.astro` | Libellé 14 px 600, champ 48 px, bordure 1,5 px `ligne`, rayon 6, fond `blanc`, focus `cobalt`. Props `type`, `nom`, `libelle`, `requis`, `aide`. Variante `zone` (textarea) et `liste` (select). |

Icônes : SVG en ligne, trait 2 px, grille 24, `currentColor`. Trois icônes
suffisent : flèche droite, coche, menu.

## 4. Pages

Toutes héritent de `Base.astro`, qui ajoute le lien d'évitement,
`<main id="contenu">`, et la police via les imports Fontsource dans
`global.css`.

### 4.1 Accueil

Reproduit la planche « Accueil · desktop » et « Accueil · mobile ».

1. Héros : grille 2 colonnes (1 colonne sous `lg`). Gauche : eyebrow
   « Logiciels pour l'écosystème Sage 100 », `titre-1` « Des logiciels qui
   complètent Sage 100. », sous-titre, boutons « Voir les produits »
   (primaire, flèche) et « Demander une démo » (secondaire), ligne
   `technique` « Conçus par un consultant Sage 100 · Windows · SQL Server ».
   Droite : cadre de capture BankBridge (masqué sous `md`).
2. Produits : en-tête de section (« Produits », « Cinq outils, cinq besoins
   rencontrés sur le terrain. », lien « Tous les produits »), grille 3
   colonnes : les produits publiés triés par `ordre`, puis la carte d'appel.
3. Conseil : bande `papier-2`, grille 2 colonnes : texte (eyebrow, `titre-2`
   « Né du conseil, pas de la théorie. », paragraphe, lien « L'activité de
   conseil ») et liste à coches des quatre domaines d'intervention.
4. Derniers articles : en-tête de section et grille 3 colonnes de cartes
   article ; section entière omise s'il n'y a aucun article publié.
5. Bande d'appel.

Le titre du document reste « Bresnik ».

### 4.2 Catalogue `/produits/`

En-tête de page : eyebrow « Produits », `titre-1` « Cinq outils, cinq
besoins rencontrés sur le terrain. », sous-titre. Deux sections avec
`titre-2-petit` « Pour les entreprises utilisatrices de Sage 100 » puis
« Pour les consultants Sage », chacune une grille 3 colonnes de cartes
produit. Bande d'appel en bas.

### 4.3 Fiche produit `/produits/<slug>/`

Reproduit la planche « Fiche produit ».

1. En-tête bordé en bas : fil d'Ariane `technique` « Produits / Nom »,
   étiquette cible, `titre-1-produit`, accroche en sous-titre 24 px, bouton
   primaire « Demander une démo » (ou état désactivé avec mention selon
   `disponibilite`) et ligne `technique` « Réponse sous deux jours ouvrés ».
2. Corps : grille `1.5fr 0.8fr` (1 colonne sous `lg`, la fiche technique
   passant sous le texte). Gauche : description Markdown en `texte` 19 px,
   « Fonctionnalités » en `titre-2-petit` et liste à coches sur 2 colonnes,
   « Captures d'écran » avec grille 2 colonnes de cadres de capture (une
   par capture, ou un seul cadre vide si aucune). Droite : fiche technique,
   collée en haut au défilement (`sticky`).
3. « Dans la même famille » : `titre-2-petit` 24 px et jusqu'à trois cartes
   compactes (nom `titre-3` 20 px, accroche `texte-petit`) des autres
   produits de la même cible, triés par `ordre`.

### 4.4 Conseil, mentions légales, confidentialité

En-tête de page : eyebrow (« Conseil Sage », « Légal »), `titre-1` 48 px,
description en sous-titre. Corps Markdown rendu avec le plugin typographie
de Tailwind configuré sur les tokens : titres Bricolage, liens `cobalt`
soulignés, listes à puces standard, largeur 720 px. La page conseil se
termine par la bande d'appel ; les pages légales, non.

### 4.5 Blog

- Liste : en-tête de page (eyebrow « Blog », `titre-1` « Retours de terrain
  sur Sage 100 et SQL Server. », sous-titre), rangée d'étiquettes de tags
  (style étiquette neutre : `encre-2` sur `papier-2`), puis cartes article
  empilées en une colonne de 760 px. Message « Aucun article pour le
  moment » et lien RSS quand la liste est vide.
- Article : en-tête (ligne `technique` date et mise à jour, `titre-1` 48 px,
  description), corps avec le plugin typographie, tags en bas, lien
  « Tous les articles ».
- Tag : comme la liste, titre « Tag : nom ».

### 4.6 Contact

En-tête de page (eyebrow « Contact », `titre-1`, sous-titre « Demandez une
démonstration ou décrivez votre besoin. Réponse sous deux jours
ouvrés. »). Formulaire de 640 px avec les composants Champ, bouton primaire
désactivé et message d'état, inchangés dans leur comportement.

### 4.7 Page 404

`titre-1` « Page introuvable », texte, deux liens en boutons secondaires.
`<meta name="robots" content="noindex">` via une prop `noindex` de
`Base.astro`. Titre de document « Page introuvable ».

## 5. Favicon et image de partage

- `public/favicon.svg` : carré `cobalt` à coins arrondis avec un « B » blanc
  en Bricolage 700, converti en tracé pour ne dépendre d'aucune police.
  Déclaré dans `Base.astro`, avec `favicon-32.png` et `apple-touch-icon.png`
  (180 px) générés à partir du même dessin. Amendé le 2026-09-04 : ces PNG
  remplacent le `favicon.ico` prévu initialement.
- `public/og-default.png` (1200 × 630) : fond `papier`, mot-symbole
  « Bresnik » et sous-titre « Logiciels complémentaires pour l'écosystème
  Sage 100 » ; généré une fois par un script Node (`scripts/generer-og.mjs`,
  avec `satori` et `@resvg/resvg-js`, à partir des fichiers de polices
  Fontsource) et commité. `Base.astro` émet `og:image`, `og:image:width`,
  `og:image:height` et `twitter:card: summary_large_image`. Les pages
  peuvent passer une image spécifique via la prop `image` (articles avec
  `image` définie).

## 6. Accessibilité et SEO

- Lien d'évitement, `<main id="contenu">`, un seul `<h1>` par page, `h2`
  puis `h3` sans saut (les cartes reçoivent leur niveau par prop).
- Menu mobile : bouton avec `aria-expanded`, `aria-controls`, libellé
  « Menu », fermeture à la touche Échap.
- Bouton d'action désactivé : `aria-describedby` vers la mention « Bientôt
  disponible ».
- Listes de tags avec `aria-label`.
- Images : `alt` obligatoire (schéma de contenu déjà en place).
- Focus visible partout (§2.4). Cibles tactiles d'au moins 44 px.
- Balises existantes conservées (canonique, Open Graph, RSS, sitemap) plus
  `og:image`, `twitter:card`, `theme-color` `#faf8f4`.

## 7. Performance et qualité

- Polices auto-hébergées, sous-ensemble latin uniquement, préchargement
  des deux fichiers de titres et de texte.
- JavaScript livré au navigateur : le script du menu mobile et celui du
  pré-remplissage du formulaire, rien d'autre.
- Vérification des liens internes : script `scripts/verifier-liens.mjs`
  exécuté après le build (`npm run verifier-liens`) qui parcourt `dist/`,
  extrait les `href` et `src` internes et échoue si une cible n'existe pas.
  Ajouté au CI après l'étape de build.
- Lighthouse : avant fusion, exécution manuelle sur l'accueil, une fiche
  produit et un article via `npx lighthouse <url> --preset=desktop`, avec
  objectif 95 ou plus en performance, accessibilité, bonnes pratiques et
  SEO ; scores consignés dans le rapport de la tâche. Pas d'intégration
  continue Lighthouse pour l'instant.
- `astro check`, tests Vitest et build restent obligatoires ; les nouveaux
  helpers purs (par exemple le choix des produits « de la même famille »)
  sont testés.

## 8. Contenu à fournir par Nicolas

- Captures d'écran des produits (PNG, 1600 px de large conseillé), à placer
  dans `src/content/produits/captures/` et référencer dans le frontmatter
  `captures`. Sans elles, les cadres affichent l'emplacement.
- Premiers articles de blog. La section « Derniers articles » de l'accueil
  reste masquée tant qu'aucun n'est publié.
- Informations légales (déjà listées dans la spécification amont).

## 3 bis. Composants ajoutés le 2026-09-04

| Composant | Fichier | Rôle et règles |
|---|---|---|
| Alerte | `Alerte.astro` | Props `ton` (`information`, `succes`, `avertissement`, `erreur`), `titre?`, `id?`. Bordure gauche et fond teintés, icône du ton, `role="status"` sauf `erreur` en `role="alert"`. Sans fermeture : elle viendra avec le script du formulaire. |
| Résumé d'erreurs | `ResumeErreurs.astro` | Prop `erreurs: { champ, message }[]` ; alerte d'erreur focalisable (`tabindex="-1"`) listant des liens vers `#champ-<nom>`. Rien n'est rendu sans erreur. |
| Champ en erreur | `Champ.astro` | Prop `erreur?` : bordure `erreur`, `aria-invalid`, message sous le champ relié par `aria-describedby` avant le texte d'aide. |
| Choix | `Choix.astro` | Case (`type="case"`, défaut) ou radio ; contrôle natif 20 px coloré par `accent-color` cobalt ; props `nom`, `valeur`, `libelle`, `coche?`, `requis?`, `desactive?`, `aide?`. |
| Groupe de choix | `GroupeChoix.astro` | `fieldset` et `legend`, props `id`, `legende`, `aide?`, `erreur?`, `requis?`. |
| Bouton en chargement | `Bouton.astro` | Prop `chargement` : désactivé, `aria-busy`, icône `chargement` en rotation, flèche masquée. |
| Fil d'Ariane | `FilAriane.astro` | Prop `elements: { libelle, href? }[]` ; `nav` « Fil d'Ariane », dernier élément `aria-current="page"`, liens soulignés. |
| Lien avec flèche | `LienFleche.astro` | Props `href`, `sens` (`aller`, `retour`), `ton` (`cobalt`, `blanc`). Remplace toutes les répétitions. |
| Accordéon | `Accordeon.astro` | `details`/`summary` natifs, sans script ; props `elements: { titre, contenu }[]`, `nom?` (un seul volet ouvert). Chevron cobalt tourné à l'ouverture. |
| État vide | `EtatVide.astro` | Bordure pointillée, titre, texte, bouton secondaire compact facultatif. Utilisé par le blog vide. |
| Pagination | `Pagination.astro` | Props `courante`, `total`, `lienPage(n)`. Première, dernière, courante et voisines, ellipses ; précédent et suivant ; cases 44 px ; masquée quand une seule page. Le blog pagine par 10 (`/blog/`, `/blog/2/`…). |
| Icônes | `Icone.astro` | Ajout de `information`, `avertissement`, `erreur`, `chevron`, `chargement`. |

Mouvement : `prefers-reduced-motion: reduce` neutralise toutes les transitions et animations (feuille globale).

## 3 ter. Composants ajoutés le 2026-09-04 (lot 2)

| Composant | Fichier | Rôle et règles |
|---|---|---|
| Témoignage | `Temoignage.astro` | `figure` avec citation en Bricolage 500, auteur, fonction et société ; filet gauche cobalt. |
| Logos | `Logos.astro` | Grille de logos (image optimisée, 40 px de haut) ou nom en monospace tant que le logo manque. |
| Chiffres clés | `ChiffresCles.astro` | `dl` en grille, valeur en Bricolage 700 cobalt, libellé en `encre-2`. |
| Tableau comparatif | `TableauComparatif.astro` | Tableau accessible (légende, en-têtes de ligne et de colonne) ; `true` → coche cobalt et « Oui » lu, `false` → tiret et « Non » lu, chaîne affichée telle quelle. |
| Chronologie | `Chronologie.astro` | Liste ordonnée avec filet vertical et points cobalt ; date en `technique`. |
| Étapes | `Etapes.astro` | Trois colonnes, pastille numérotée cobalt, numéro annoncé aux lecteurs d'écran. |
| Galerie | `Galerie.astro` | Grille de cadres de capture, chaque image ouvrant l'original dans un nouvel onglet. |
| Vidéo | `Video.astro` | Lecteur natif avec affiche, `preload="none"` ; sans source, emplacement « Vidéo à venir ». |
| Séparateur | `Separateur.astro` | Filet `ligne`, espace petit ou grand. |
| Table des matières | `TableMatieres.astro` | Depuis les titres Markdown de niveaux 2 et 3 ; l'article l'affiche dès trois sections de niveau 2. |
| Info-bulle | `InfoBulle.astro` | Bouton 44 px avec `aria-describedby`, bulle `role="tooltip"` visible au survol et au focus, sans script. |
| Bandeau d'annonce | `BandeauAnnonce.astro` | Fond encre, texte et lien facultatif ; piloté par `annonce` dans `src/config/site.ts`, rendu par `Base.astro` au-dessus de l'en-tête. |
| Recherche | `Recherche.astro` | Formulaire `role="search"`, champ `type="search"` nommé `q`, bouton cobalt ; pas de moteur pour l'instant. |
| Abonnement | `Abonnement.astro` | Email, consentement, bouton désactivé tant que `actif` est faux, message d'état. |
| Liste de définitions | `ListeDefinitions.astro` | `dl` à deux colonnes, libellés en `etiquette` ; la fiche technique l'utilise. |
| Section | `Section.astro` | Section pleine largeur, fond `papier`, `papier-2` ou `encre`, conteneur intérieur et rythme vertical standard. |
| Pages | `erreur.astro`, `maintenance.astro` | Pages `noindex`, hors sitemap, prêtes à être servies. |
| Pied de page | `Footer.astro` | Lien « Retour en haut » vers `#contenu`. |

## 3 quater. Composants d'application (lot 3, statique, 2026-09-04)

Implémentations de référence, sans framework, dans `src/components/application/`.
Elles seront transposées dans la pile des applications le moment venu.

| Composant | Fichier | Rôle et règles |
|---|---|---|
| Badge | `Badge.astro` | Compteur en pastille, tons `cobalt`, `erreur`, `neutre`, contexte lu par `sr-only`. |
| Statut | `Statut.astro` | Point coloré et libellé : `actif` succès, `attente` ambre, `inactif` encre-2, `erreur`. Jamais la couleur seule. |
| Avatar, groupe | `Avatar.astro`, `GroupeAvatars.astro` | Initiales sur `cobalt-teinte` ou image ; trois tailles ; groupe chevauché avec « +N ». |
| Carte utilisateur | `CarteUtilisateur.astro` | Avatar grand, nom, fonction, email, statut. |
| Carte de statistique | `CarteStatistique.astro` | Valeur en Bricolage, variation avec icône de tendance et sens lu, `favorable` pour inverser la couleur. |
| Barre de progression | `BarreProgression.astro` | `progress` natif coloré par `accent-color` ; seuils 80 et 95 % vers ambre puis erreur. |
| Chargement | `Squelette.astro`, `Spinner.astro` | `aria-busy` et texte lu ; animation neutralisée par `prefers-reduced-motion`. |
| Journal d'activité | `JournalActivite.astro` | Liste d'événements avec avatar, action, détail, date. |
| Barre d'outils | `BarreOutils.astro` | Emplacements nommés `recherche`, `filtres`, `actions`. |
| Filtres actifs | `FiltresActifs.astro` | Pastilles avec retrait individuel et « Tout effacer ». |
| Tableau de données | `TableauDonnees.astro` | Légende, en-têtes de ligne, `aria-sort`, nombres alignés à droite en monospace tabulaire, zébrage, sélection, actions en icônes. Tri côté client au lot interactif. |
| Boutons | `BoutonIcone.astro`, `GroupeBoutons.astro` | Icône seule 44 px avec `aria-label`, trois variantes ; groupe segmenté `role="group"`. |
| Champs | `Champ.astro` | Types `nombre`, `date`, `heure`, `motdepasse` ; props `prefixe` et `suffixe`. |
| Graphiques | `GraphiqueBarres.astro`, `LegendeGraphique.astro` | Palette `--graphique-1..5` (#1f4fc7, #a8650a, #2a8a4a, #8a3fa8, #c2452e), validée pour les daltonismes sur fond papier ; un axe, barres fines à coins de 4 px, jour de 2 px, légende dès deux séries, maximum étiqueté, tableau des données. |
| Menu latéral | `MenuLateral.astro` | Groupes titrés, élément actif en `cobalt-teinte`, badges, emplacement de pied. |
| En-tête d'application | `EnTeteApplication.astro` | Fil d'Ariane, titre, sous-titre, emplacement d'actions. |
| Gabarits | `gabarits/application.astro`, `gabarits/connexion.astro` | Pages `noindex` hors sitemap, habillage `application` de `Base` (sans en-tête ni pied du site). |
| Impression | `global.css` | `@media print` : habillage masqué, noir sur blanc, ombres retirées, adresses des liens externes. |
| Icônes | `Icone.astro` | Vingt-six icônes d'application ajoutées, tracés en ligne, grille 24. |

## 3 quinquies. Composants d'application interactifs (lot 4, 2026-09-04)

Éléments personnalisés (`bk-*`) avec un script natif minimal, sans bibliothèque,
définis une fois par page ; tout est utilisable au clavier.

| Composant | Fichier | Rôle et règles |
|---|---|---|
| Onglets | `Onglets.astro` | Motif ARIA tabs : `tablist`, `tab` avec `aria-selected`, `tabpanel` ; flèches, Début, Fin. Panneaux par emplacements nommés. |
| Menu déroulant | `MenuDeroulant.astro` | Bouton `aria-haspopup="menu"` et `aria-expanded`, liste `role="menu"` ; flèches, Début, Fin, Échap, fermeture au clic extérieur ; variante icône seule pour le menu contextuel ; élément `danger` en erreur. |
| Indicateur d'étapes | `IndicateurEtapes.astro` | Étapes faites, courante (`aria-current="step"`) et à venir, état lu par les lecteurs d'écran. |
| Interrupteur | `Interrupteur.astro` | `role="switch"` avec `aria-checked`, champ caché `oui`/`non`, événement `bk-bascule`. |
| Mot de passe | `ChampMotDePasse.astro` | Bouton d'affichage `aria-pressed`, robustesse en quatre segments et libellé (`evaluerRobustesse`, testé), zone `aria-live`. |
| Téléversement | `Televersement.astro` | Zone de dépôt liée au champ fichier natif, liste des fichiers avec taille et retrait, glisser-déposer. |
| Sélecteur à recherche | `SelecteurRecherche.astro` | Motif combobox : filtre au clavier, `aria-activedescendant`, sélection simple ou multiple en puces, champs cachés pour le formulaire, événement `bk-selection`. |
| Modale et panneau latéral | `Modale.astro` | `dialog` natif (`showModal`) : focus piégé, Échap, arrière-plan cliquable ; prop `lateral` pour le panneau coulissant. Ouverture par `data-ouvre-dialogue`. |
| Confirmation | `BoiteConfirmation.astro` | `dialog` en `alertdialog`, formulaire `method="dialog"`, événement `bk-confirmation` avec `confirme` ; variante `danger`. |
| Notifications | `Notifications.astro`, `scripts/notifications.ts` | Zone `role="status"` en bas à droite, `window.bkNotifier({ texte, ton, duree })` ou attribut `data-notifier`, fermeture manuelle, retrait automatique. |
| Tableau de données | `TableauDonnees.astro` | Tri côté client par colonne (`comparerValeurs`, testé, nombres à la française), `aria-sort` mis à jour, case d'en-tête pour tout sélectionner avec état indéterminé. |

## 8 bis. Charte vivante

Ajouté le 2026-09-04. La page `/charte/` présente les couleurs, la
typographie, les icônes et chaque composant dans toutes ses variantes, en
rendant les composants réels avec des données d'exemple. Elle est publiée
avec `noindex`, exclue du sitemap (filtre de l'intégration) et jamais liée
depuis la navigation. Règle : tout nouveau composant ou toute nouvelle
variante y est ajouté dans la même modification.

## 9. Décisions

- Polices via Fontsource plutôt que Google Fonts : aucune requête tierce,
  cohérent avec la politique de confidentialité.
- Plugin typographie de Tailwind adopté pour le Markdown, configuré sur les
  tokens ; la classe `prose` déjà posée devient effective.
- Menu mobile en script inline plutôt qu'en `<details>` : un vrai bouton
  avec `aria-expanded` est plus robuste pour les lecteurs d'écran.
- Année du pied de page fixée à 2026 plutôt que calculée au build.
- Pas de mode sombre.
