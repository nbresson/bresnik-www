# Design System: Bresnik

Character: un atelier technique sobre et chaleureux ; on sent le consultant qui connaît Sage 100 de l'intérieur, pas l'agence.

Extrait de l'existant le 2026-09-15 (`src/styles/tokens.css`, `src/lib/palettes.ts`,
`docs/superpowers/specs/2026-09-03-design-site-vitrine-design.md`, page `/charte/`).
Les tokens font foi : ce fichier donne la raison de chaque valeur et les règles
d'usage. Toute valeur hors système est une extension à inscrire ici dans la même
modification, jamais une invention silencieuse.

## Color

Palette alignée sur le logo (marine `#133868` → `#062045`, ruban `#f87800` → `#f84808`).
Valeurs claires et sombres dans `src/lib/palettes.ts`, vérifiées par test (dérive et contrastes AA).

- `papier` / `papier-2` : fonds chauds, papier technique ; le blanc clinique écraserait le marine.
- `blanc` : surface des cartes et champs, la seule qui porte une bordure.
- `encre` / `encre-2` : marine profond du logo pour le texte, secondaire à 7:1.
- `cobalt` : signature. Réservé au bouton primaire, aux liens, à l'état actif de la navigation et aux icônes de repère. Nom conservé, teinte marine d'accent.
- `ambre` : orange lisible, surtitres et étiquette Consultants uniquement.
- `flamme` / `braise` : couleurs vives du ruban, décoratives ; `braise` est le « k » de la marque. Jamais du texte courant.
- `succes` / `erreur` : sémantiques, alertes et statuts seulement.
- `bande` / `bande-texte` / `encre-claire` : bandes d'appel marine.

## Typography

- Titres : Bricolage Grotesque 600 et 700 (deux graisses fixes) ; caractère technique et chaleureux.
- Texte : Source Sans 3, variable 400 à 600 ; lecture longue confortable.
- Technique : JetBrains Mono 500, **réservé aux surtitres (`eyebrow`) et aux données techniques** (versions, formats, libellés de fiche technique). Pas pour le fil d'Ariane, les délais ou les phrases.
- Contraste : titre 1 à 64 px contre 19 px de texte (rapport 3,4) ; la voix est dans les titres.
- Échelle cible : **13 · 15 · 17 · 20 · 24 · 30 · 40 · 64**. Les tailles 14, 16, 18, 22 et 48 existent encore dans des composants hérités ; toute nouvelle page utilise l'échelle cible, et un composant touché y est ramené.

## Spacing

- Base 4 px. Conteneur : 1 440 px maximum, marges 20 px en mobile et 80 px en large.
- Rythme aéré : 88 px entre sections en large, 40 px en mobile ; 20 à 28 px de padding de carte.
- Dans un groupe, 8 à 14 px ; entre groupes, 24 à 40 px. Plus d'espace au-dessus d'un titre qu'en dessous.

## Shape & elevation

- Rayons : `bouton` 6 · `carte` 8 · `cadre` 10 · `bande` 12, plus `full` pour les pastilles. Exceptions tolérées : logos miniatures (5 et 9 px) et tuiles de logo en grand (18 et 22 px).
- Séparation : **bordures 1 px `ligne`** pour les surfaces cliquables et les panneaux ; **aplats `papier-2`** pour les bandes de rythme et les tuiles d'information non cliquables ; **une seule ombre**, réservée aux cadres de capture et aux menus.
- Une tuile qui ne mène nulle part n'a ni bordure ni survol.

## Motion

- 150 ms, couleur et transformation ; aucune animation d'entrée. `prefers-reduced-motion` neutralise tout.
- Carrousel : 6 s entre diapositives, arrêt au survol, au focus et à la première interaction.

## Components

- Bouton : `primaire` (plein cobalt, une seule action principale par écran), `secondaire` (bordé encre), `inverse` (sur bande). États : survol plus foncé, pressé `scale 0.98`, focus anneau cobalt 2 px décalé de 2 px, chargement avec roue et libellé au présent (« Envoi en cours… »), désactivé à 60 % avec une raison visible.
- Lien fléché : action tertiaire, pressé à 70 % d'opacité.
- Carte cliquable : `blanc`, bordure `ligne`, survol bordure `cobalt`, pressé fond `papier-2`, toute la carte cliquable.
- Tuile d'information (`TuileDomaine`) : aplat, glyphe en tuile `cobalt-teinte`, jamais cliquable.
- Champ : libellé au-dessus, obligatoires sans marque, facultatifs suivis de « (facultatif) », hauteur 48 px.
- Choix exclusif de 2 à 7 options : boutons radio visibles en tuiles, pas de liste déroulante.
- Info-bulle : explique, ne porte jamais une information nécessaire à la décision ; cible de 44 px.
- Cibles tactiles : 44 px minimum, y compris liens du pied de page et du fil d'Ariane en mobile.

## Voice

- Première personne : Nicolas Bresson, consultant Sage 100 avec plus de 12 ans d'expérience, dit « je ». Pas de « nous » ni de « on ». Pages légales impersonnelles.
- Casse de phrase partout ; verbes d'action sur les boutons (« Envoyer ma demande », « Demander une démo »).
- Bénéfice avant la fonction : ce que l'utilisateur obtient, puis comment.
