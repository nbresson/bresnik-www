# Backlog des composants UI/UX

Inventaire des composants classiques absents de la charte vivante (`/charte/`),
établi le 2026-09-04. Cible : **V** vitrine, **A** applications à venir (espace
client, applications produit), **V/A** les deux. Priorité : **1** manque réel à
court terme pour la vitrine, **2** utile à moyen terme, **3** système de design
partagé, à traiter avec la première application.

Règle : quand un composant est réalisé, il est ajouté à `/charte/` dans la
même modification et coché ici.

## Navigation et structure

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Fil d'Ariane | V/A | 1 | Existe en dur sur la fiche produit. |
| [x] | Lien avec flèche (`LienFleche`, sens aller/retour) | V/A | 1 | Six occurrences à absorber. |
| [x] | Pagination | V/A | 1 | Blog dès la deuxième page. |
| [x] | Table des matières d'article | V | 2 | |
| [x] | Ancres de section, retour en haut | V | 2 | Lien « Retour en haut » dans le pied de page ; les sections ont déjà des identifiants. |
| [ ] | Onglets | A | 3 | Parfois V (fiche produit à volets). |
| [ ] | Menu latéral d'application (actif, replié, groupes) | A | 3 | |
| [ ] | Menu déroulant, menu contextuel | A | 3 | |
| [ ] | Étapes d'un parcours, progression | A | 3 | |

## Contenu et typographie

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Démonstration du texte enrichi (`prose`) : listes, citations, tableaux, code, images légendées | V | 1 | |
| [x] | Accordéon / FAQ | V/A | 1 | `details`/`summary` natif. |
| [x] | Citation, témoignage client | V | 2 | |
| [x] | Logos clients ou partenaires | V | 2 | |
| [x] | Chiffres clés | V | 2 | |
| [x] | Tableau comparatif | V | 2 | |
| [ ] | Grille tarifaire | V | 2 | Quand les prix seront publics. |
| [x] | Chronologie (versions, feuille de route) | V | 2 | |
| [x] | Étapes numérotées « comment ça marche » | V | 2 | |
| [x] | Bloc de code, raccourci clavier `kbd` | V/A | 2 | Blog technique, aide. |
| [x] | Image légendée, galerie avec agrandissement | V | 2 | Agrandissement par ouverture de l'image, sans visionneuse. |
| [x] | Vidéo intégrée avec vignette | V | 2 | Lecteur natif, emplacement sans source. |
| [x] | Séparateur, espaceur | V/A | 2 | |

## Retour d'information et états

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Alerte : information, succès, avertissement, erreur | V/A | 1 | Nécessaire au formulaire de contact. |
| [x] | État vide avec action suggérée | V/A | 1 | Deux versions ad hoc aujourd'hui. |
| [ ] | Toast / notification éphémère | A | 3 | |
| [ ] | État de chargement : squelette, spinner, barre | A | 3 | |
| [x] | Pages d'erreur 500 et maintenance | V/A | 2 | 404 existe. |
| [ ] | Badge de compteur | A | 3 | |
| [ ] | Indicateur de statut (point coloré) | A | 3 | |
| [x] | Info-bulle | V/A | 2 | |
| [x] | Bandeau d'annonce | V | 2 | |

## Formulaires

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Message d'erreur de champ, `aria-invalid`, résumé d'erreurs | V/A | 1 | Nécessaire au formulaire de contact. |
| [x] | Case à cocher, bouton radio, groupes avec légende | V/A | 1 | Consentement du formulaire de contact. |
| [x] | Groupe de champs `fieldset` | V/A | 2 | `GroupeChoix`. |
| [x] | Bouton de chargement (envoi en cours) | V/A | 1 | Formulaire de contact. |
| [x] | Champ recherche | V/A | 2 | Composant seul, sans moteur de recherche. |
| [x] | Formulaire d'abonnement à une lettre | V | 2 | Composant seul, envoi désactivé. |
| [ ] | Interrupteur oui/non | A | 3 | |
| [ ] | Champ mot de passe, indicateur de robustesse | A | 3 | |
| [ ] | Champ numérique, date, heure | A | 3 | |
| [ ] | Téléversement de fichier, zone de dépôt | A | 3 | Fichiers FEC, extraits. |
| [ ] | Sélecteur à recherche, sélection multiple | A | 3 | |
| [ ] | Champ avec préfixe ou suffixe | A | 3 | Montants, pourcentages. |
| [ ] | Bouton icône seule, groupe de boutons | A | 3 | |

## Données et applications

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Tableau de données (tri, zébrage, nombres alignés, actions, sélection) | A | 3 | Aussi V pour les comparatifs. |
| [x] | Liste de définitions générique | V/A | 2 | La fiche technique en est un cas. |
| [ ] | Carte de statistique | A | 3 | |
| [ ] | Barre d'outils de liste (recherche, filtres, tri, actions) | A | 3 | |
| [ ] | Filtres actifs en pastilles | A | 3 | |
| [ ] | Avatar, groupe d'avatars | A | 3 | |
| [ ] | Carte utilisateur | A | 3 | |
| [ ] | Journal d'activité | A | 3 | |
| [ ] | Graphiques : couleurs et légende | A | 3 | Trésorerie, reporting. |
| [ ] | Barre de progression de quota | A | 3 | |

## Superpositions

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Menu mobile montré sur la charte | V | 2 | Existe dans l'en-tête ; l'afficher sur la charte dupliquerait ses identifiants, à traiter avec une prop de préfixe si besoin. |
| [ ] | Fenêtre modale (focus piégé) | A | 3 | |
| [ ] | Panneau latéral coulissant | A | 3 | |
| [ ] | Boîte de confirmation | A | 3 | |

## Gabarits et mise en page

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Conteneurs et grilles de référence, points de rupture | V/A | 2 | |
| [x] | Sections pleine largeur `papier-2` et sombre en gabarits | V | 2 | |
| [x] | Colonne latérale collante | V/A | 2 | |
| [ ] | Gabarit d'email transactionnel | V/A | 2 | Confirmation de contact ; à faire avec le plan du formulaire. |
| [ ] | Gabarit d'écran d'application | A | 3 | |
| [ ] | En-tête de page d'application | A | 3 | |
| [ ] | Gabarit d'authentification | A | 3 | |
| [ ] | Styles d'impression | A | 3 | |

## Fondations manquantes sur la page de charte

| Fait | Élément | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | États focus, survol, actif montrés côte à côte | V/A | 1 | |
| [x] | Échelle d'espacements | V/A | 1 | |
| [x] | Rayons et ombre en pastilles | V/A | 1 | |
| [x] | Grille de contrastes avec ratios | V/A | 1 | |
| [x] | Mouvement : durée, courbe, `prefers-reduced-motion` | V/A | 1 | |
| [x] | Mention explicite de l'absence de mode sombre | V/A | 1 | |
| [ ] | Bibliothèque d'icônes cohérente | A | 3 | Trois icônes aujourd'hui. |
