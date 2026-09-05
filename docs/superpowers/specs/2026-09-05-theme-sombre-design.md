# Bresnik — Thème clair et thème sombre

Date : 2026-09-05
Statut : validé par Nicolas Bresson le 2026-09-05 (conception présentée en
conversation)
Amende : `2026-09-03-design-site-vitrine-design.md` §2.1 (palette), §2.3
(ombre), §9 (décision « pas de mode sombre », retirée) et §8 bis (charte).

## 1. Objectif et périmètre

Le site propose deux rendus, clair et sombre. Le rendu suit le réglage du
système du visiteur ; un sélecteur dans l'en-tête permet de forcer « clair »
ou « sombre », ou de revenir à « système » ; le choix est mémorisé dans le
navigateur. Le mécanisme repose sur un attribut de la page réutilisable par
les futures applications.

Inclus : palette sombre validée, tokens de bande, mécanisme sans flash,
sélecteur de thème, charte montrant les deux palettes et leurs contrastes,
gabarits d'application héritant du mécanisme.

Exclus : variantes d'images par thème (captures et logos restent tels quels),
image de partage et favicon (inchangés, affichés hors du site), animation de
transition entre thèmes (le basculement est instantané).

## 2. Palettes

Les deux palettes portent les mêmes noms de tokens ; un composant ne connaît
que le rôle, jamais le thème. Contrastes WCAG AA (4,5 minimum en texte
normal) vérifiés par le calcul pour chaque couple listé en §5.

| Token | Rôle | Clair | Sombre |
|---|---|---|---|
| `papier` | Fond de page | `#faf8f4` | `#141a26` |
| `papier-2` | Bandes de rythme, barres de fenêtre | `#f1ede4` | `#1b2230` |
| `blanc` | Surface des cartes, champs | `#ffffff` | `#1f2735` |
| `encre` | Texte principal | `#1c2331` | `#f1efe9` |
| `encre-2` | Texte secondaire | `#4f5868` | `#aab3c2` |
| `ligne` | Bordures | `#e2ddd2` | `#2f3a4c` |
| `cobalt` | Accent, liens, bouton primaire | `#1f4fc7` | `#8fb0ff` |
| `cobalt-fonce` | Survol | `#183f9f` | `#adc4ff` |
| `cobalt-teinte` | Fond teinté cobalt | `#e6ecfa` | `#22304d` |
| `ambre` | Étiquette consultants, avertissement | `#8f620f` | `#e3ac48` |
| `ambre-teinte` | Fond teinté ambre | `#fbf1dd` | `#3a2f16` |
| `succes` | Alertes de succès, statut actif | `#1e6b45` | `#6fd19a` |
| `succes-teinte` | Fond des alertes de succès | `#e4f3ea` | `#1a3326` |
| `erreur` | Erreurs, alertes d'erreur | `#b42318` | `#ff9384` |
| `erreur-teinte` | Fond des alertes d'erreur | `#fbe9e7` | `#40201d` |
| `bande` | Fond des bandes sombres (appel, carte d'appel, annonce, info-bulle, section encre) | `#1c2331` | `#2a3446` |
| `bande-texte` | Texte principal sur une bande | `#ffffff` | `#f1efe9` |
| `encre-claire` | Texte secondaire sur une bande | `#c9cfdb` | `#b8c0cf` |
| `voile` | Arrière-plan des boîtes de dialogue | `rgb(28 35 49 / 0.5)` | `rgb(0 0 0 / 0.6)` |

Ombre des cadres de capture : clair `0 24px 48px -32px rgb(28 35 49 / 0.35)`,
sombre `0 24px 48px -32px rgb(0 0 0 / 0.6)`.

Palette de graphiques, ordre fixe, validée pour les daltonismes par l'outil du
guide de visualisation sur la surface de chaque thème :

| Série | Clair | Sombre |
|---|---|---|
| 1 | `#1f4fc7` | `#5d88e8` |
| 2 | `#a8650a` | `#b8852c` |
| 3 | `#2a8a4a` | `#3fa46c` |
| 4 | `#8a3fa8` | `#a46ee6` |
| 5 | `#c2452e` | `#d9655a` |

Les deux tableaux remplacent le tableau de §2.1 de la spécification design ;
la règle « aucune couleur hors tableau » s'applique aux deux colonnes. Les
tokens `bande`, `bande-texte` et `voile` sont nouveaux : les composants qui
dessinaient une bande avec `bg-encre text-blanc` passent à
`bg-bande text-bande-texte`, et les arrière-plans de dialogue à `bg-voile`.

## 3. Mécanisme

- L'élément `<html>` porte `data-theme="light"` ou `data-theme="dark"` quand
  le visiteur a forcé un thème ; sans attribut, le CSS suit
  `prefers-color-scheme`. Les variables sombres sont définies deux fois dans
  `tokens.css` : sous `@media (prefers-color-scheme: dark)` pour
  `:root:not([data-theme="light"])`, et sous `:root[data-theme="dark"]`. Un
  test compare les deux blocs et la table de `src/lib/palettes.ts` pour
  empêcher toute dérive.
- `color-scheme: light` sur `:root`, `dark` quand le thème sombre s'applique,
  pour les contrôles natifs, barres de défilement et champs.
- Un script en ligne dans `<head>`, avant tout rendu, lit la clé
  `localStorage` `bresnik-theme` (`light`, `dark`, absente = système) et pose
  l'attribut : aucun flash au chargement. Il est entouré de `try/catch`
  (stockage indisponible).
- Deux balises `theme-color` avec `media="(prefers-color-scheme: …)"`, mises à
  jour par le sélecteur quand un thème est forcé.
- Le sélecteur (`SelecteurTheme.astro`, élément `bk-theme`) est un bouton
  d'icône dans l'en-tête, présent en desktop et dans le menu mobile, qui ouvre
  un menu de trois choix `role="menuitemradio"` : Clair, Sombre, Système. Le
  choix pose ou retire l'attribut, écrit ou efface la clé de stockage, met à
  jour `aria-checked` et l'icône (soleil, lune, écran). Il écoute aussi le
  changement du réglage système en mode « système ». Sans JavaScript, le
  bouton n'est pas rendu utile : il est masqué par défaut et révélé par le
  script.
- `src/lib/theme.ts` expose `resoudreTheme(choix, systemeSombre)` et
  `libelleTheme(choix)`, testés.

## 4. Charte et gabarits

- La charte reçoit un sélecteur de thème en tête de page (le même composant)
  et montre, pour les couleurs, les deux valeurs de chaque token ; la grille
  de contrastes est calculée pour les deux palettes.
- Les gabarits d'application héritent du mécanisme sans changement ; le
  gabarit application reçoit le sélecteur dans les actions d'en-tête.
- Les captures et logos ne changent pas ; la tuile blanche bordée des logos
  devient une tuile `blanc` (surface sombre en mode sombre), ce qui est le
  comportement d'une icône d'application.

## 5. Vérifications

- Tests : `resoudreTheme`, cohérence `tokens.css` / `palettes.ts` (les deux
  blocs sombres et le bloc clair), contrastes des couples suivants dans les
  deux palettes, tous ≥ 4,5 : `encre`/`papier`, `encre-2`/`papier`,
  `encre`/`blanc`, `encre-2`/`blanc`, `cobalt`/`papier`, `cobalt`/`blanc`,
  `blanc`/`cobalt`, `cobalt`/`cobalt-teinte`, `ambre`/`ambre-teinte`,
  `succes`/`succes-teinte`, `erreur`/`erreur-teinte`, `erreur`/`blanc`,
  `bande-texte`/`bande`, `encre-claire`/`bande`, `cobalt`/`bande`.
- Le HTML construit contient le script de thème avant les feuilles de style et
  les deux balises `theme-color`.
- Lighthouse manuel en clair et en sombre (forcé par `localStorage`) sur
  l'accueil, une fiche produit et la charte : accessibilité 95 ou plus.
- Aucun `bg-encre text-blanc` ne subsiste dans les composants pour dessiner
  une bande ; aucun `backdrop:bg-encre` ne subsiste.

## 6. Décisions

- Suivi du système par défaut, sélecteur à trois états, mémorisation locale :
  choix de Nicolas Bresson le 2026-09-05.
- Inversion par variables plus deux rôles nouveaux (`bande`, `bande-texte`)
  et un voile, plutôt qu'une passe sémantique complète : même résultat,
  quatre composants touchés au lieu de quarante.
- Palette sombre dérivée de la marque (bleu nuit proche de l'encre) plutôt
  qu'un gris neutre.
- Pas de transition animée entre thèmes.
