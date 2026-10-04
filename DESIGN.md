# Design System: Bresnik

Character: **SaaS Moderne & Précision B2B (Concept A — Style Linear / Stripe)**.
Élégance technique, clarté absolue, surfaces en verre dépoli (`glass-card`), micro-bordures chirurgicales et halos de lumière ambiante (`glow-saas`). Conçu pour valoriser des outils Windows natifs de haute précision pour Sage 100.

Mise à jour d'après la refonte Concept A (`src/styles/tokens.css`, `src/lib/palettes.ts`, page `/charte/`).
Les tokens font foi : ce fichier donne la raison de chaque valeur et les règles d'usage.

## Color

Palette alliant rigueur technique, haute lisibilité et accents électriques :
- Mode sombre : fond spatial ardoise `#090d16`, bandes `#0f172a`, surfaces de cartes `#131d33`, micro-bordures `#1e293b`.
- Mode clair : canevas précis `#f8fafc`, bandes `#f1f5f9`, cartes blanches pures `#ffffff`, micro-bordures `#e2e8f0`.
- Contrastes certifiés WCAG 2 AA ($\ge 4.5:1$ sur tous les couples de l'interface), vérifiés par test automatisé unitaire.

### Tokens
- `papier` / `papier-2` : fonds de page et bandes de rythme (ardoise spatiale en sombre, canevas technique en clair).
- `blanc` : surface des cartes et champs, portant la micro-bordure et le verre dépoli (`glass-card`).
- `encre` / `encre-2` : texte principal à fort contraste et texte secondaire précis.
- `cobalt` / `cobalt-fonce` / `cobalt-teinte` : accent signature bleu électrique, boutons primaires, liens, états actifs et halos ambiants.
- `ambre` / `ambre-teinte` : orange lisible pour les surtitres techniques et étiquettes cibles.
- `flamme` / `braise` : couleurs d'énergie du logo, décoratives ; `braise` est le « k » de la marque.
- `succes` / `succes-teinte` : sémantique des validations et balises de statut temps réel (`SQL_SYNC_OK`).
- `erreur` / `erreur-teinte` : alertes et erreurs de validation.
- `bande` / `bande-texte` / `encre-claire` : cartes d'appel et d'action.

## Typography

- Titres : Bricolage Grotesque 600 et 700 ; caractère moderne, lisible, à tracking resserré (`tracking-[-0.025em]`).
- Texte : Source Sans 3, variable 400 à 600 ; confort de lecture technique.
- Technique : JetBrains Mono 500, réservé aux surtitres (`eyebrow`), métriques de télémétrie, pastilles de versions et statuts (`SQL_SYNC_OK`).
- Échelle : **13 · 15 · 17 · 20 · 24 · 30 · 40 · 48 · 64**, plus 10 et 11 px pour les micro-badges et pastilles de compteur.

## Spacing & Elevation

- Base 4 px. Conteneur : 1 440 px maximum, marges 20 px en mobile et 80 px en large.
- Rayons modernes : `bouton` 8px · `carte` 12px · `cadre` 14px · `bande` 16px, et `full` (9999px) pour les pilules de statut.
- Surfaces :
  - **Verre dépoli (`glass-card`)** : `backdrop-filter: blur(12px)` avec fond semi-transparent et micro-bordure 1 px.
  - **Halos ambiants (`glow-saas`, `glow-subtle`)** : diffusion lumineuse subtile bleu électrique sous les cadres logiciels clés.
  - **Bordures** : 1 px `ligne` haute précision.

## Components

- En-tête : navigation flottante sticky avec verre dépoli (`backdrop-blur-md`), pastilles de liens interactifs, badge de comptage produits `5` et accès rapide démo.
- Bouton :
  - `primaire` : plein cobalt avec ombre portée lumineuse (`shadow-md shadow-cobalt/25 hover:shadow-lg hover:-translate-y-0.5`), une seule action dominante par vue.
  - `secondaire` : carte claire bordée avec survol feutré.
  - `inverse` : sur bande sombre.
- Vitrine logicielle (Hero) : cadre de prévisualisation studio avec barre d'état fenêtre, badge live (`SQL_SYNC_OK`), carrousel d'écrans réels et télémétrie en direct.
- Carte Produit : carte en verre avec micro-bordure, aperçu 16:10, monogramme/logo, tags modules Sage et translation d'accentuation au survol.
- Tableau comparatif : table technique moderne avec entête ardoise douce et coches cobalts.

## Voice

- Première personne : Nicolas Bresson, consultant Sage 100 avec plus de 12 ans d'expérience, dit « je ».
- Clarté factuelle, souveraineté des données (« 100% sur votre poste ») et respect de l'architecture Sage (« Objets métiers officiels »).
