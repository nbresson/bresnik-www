# Backlog des composants UI/UX

Inventaire des composants classiques absents de la charte vivante (`/charte/`),
établi le 2026-09-04. Cible : **V** vitrine, **A** applications à venir (espace
client, applications produit), **V/A** les deux. Priorité : **1** manque réel à
court terme pour la vitrine, **2** utile à moyen terme, **3** système de design
partagé, à traiter avec la première application.

Règle : quand un composant est réalisé, il est ajouté à `/charte/` dans la
même modification et coché ici.

La section « Revue du site du 2026-09-05 » regroupe les améliorations de fond
et techniques issues d'une revue complète, hors composants.

## Navigation et structure

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Fil d'Ariane | V/A | 1 | Existe en dur sur la fiche produit. |
| [x] | Lien avec flèche (`LienFleche`, sens aller/retour) | V/A | 1 | Six occurrences à absorber. |
| [x] | Pagination | V/A | 1 | Blog dès la deuxième page. |
| [x] | Table des matières d'article | V | 2 | |
| [x] | Ancres de section, retour en haut | V | 2 | Lien « Retour en haut » dans le pied de page ; les sections ont déjà des identifiants. |
| [x] | Onglets | A | 3 | Parfois V (fiche produit à volets). |
| [x] | Menu latéral d'application (actif, replié, groupes) | A | 3 | |
| [x] | Menu déroulant, menu contextuel | A | 3 | |
| [x] | Étapes d'un parcours, progression | A | 3 | |

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
| [x] | Carrousel de captures | V | 2 | Une capture par produit sur l'accueil ; défilement automatique, pause, arrêt à l'interaction ; défilable sans script. |
| [x] | Vidéo intégrée avec vignette | V | 2 | Lecteur natif, emplacement sans source. |
| [x] | Séparateur, espaceur | V/A | 2 | |

## Retour d'information et états

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Alerte : information, succès, avertissement, erreur | V/A | 1 | Nécessaire au formulaire de contact. |
| [x] | État vide avec action suggérée | V/A | 1 | Deux versions ad hoc aujourd'hui. |
| [x] | Toast / notification éphémère | A | 3 | |
| [x] | État de chargement : squelette, spinner, barre | A | 3 | |
| [x] | Pages d'erreur 500 et maintenance | V/A | 2 | 404 existe. |
| [x] | Badge de compteur | A | 3 | |
| [x] | Indicateur de statut (point coloré) | A | 3 | |
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
| [x] | Interrupteur oui/non | A | 3 | |
| [x] | Champ mot de passe, indicateur de robustesse | A | 3 | |
| [x] | Champ numérique, date, heure | A | 3 | |
| [x] | Téléversement de fichier, zone de dépôt | A | 3 | Fichiers FEC, extraits. |
| [x] | Sélecteur à recherche, sélection multiple | A | 3 | |
| [x] | Champ avec préfixe ou suffixe | A | 3 | Montants, pourcentages. |
| [x] | Bouton icône seule, groupe de boutons | A | 3 | |

## Données et applications

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Tableau de données (tri, zébrage, nombres alignés, actions, sélection) | A | 3 | Tri côté client et sélection globale inclus. |
| [x] | Liste de définitions générique | V/A | 2 | La fiche technique en est un cas. |
| [x] | Carte de statistique | A | 3 | |
| [x] | Barre d'outils de liste (recherche, filtres, tri, actions) | A | 3 | |
| [x] | Filtres actifs en pastilles | A | 3 | |
| [x] | Avatar, groupe d'avatars | A | 3 | |
| [x] | Carte utilisateur | A | 3 | |
| [x] | Journal d'activité | A | 3 | |
| [x] | Graphiques : couleurs et légende | A | 3 | Trésorerie, reporting. |
| [x] | Barre de progression de quota | A | 3 | |

## Superpositions

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Menu mobile montré sur la charte | V | 2 | Existe dans l'en-tête ; l'afficher sur la charte dupliquerait ses identifiants, à traiter avec une prop de préfixe si besoin. |
| [x] | Fenêtre modale (focus piégé) | A | 3 | |
| [x] | Panneau latéral coulissant | A | 3 | |
| [x] | Boîte de confirmation | A | 3 | |

## Gabarits et mise en page

| Fait | Composant | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Conteneurs et grilles de référence, points de rupture | V/A | 2 | |
| [x] | Sections pleine largeur `papier-2` et sombre en gabarits | V | 2 | |
| [x] | Colonne latérale collante | V/A | 2 | |
| [x] | Gabarit d'email transactionnel | V/A | 2 | `worker/email.ts`, texte et HTML de la notification. |
| [x] | Gabarit d'écran d'application | A | 3 | |
| [x] | En-tête de page d'application | A | 3 | |
| [x] | Gabarit d'authentification | A | 3 | |
| [x] | Styles d'impression | A | 3 | |

## Fondations manquantes sur la page de charte

| Fait | Élément | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | États focus, survol, actif montrés côte à côte | V/A | 1 | |
| [x] | Échelle d'espacements | V/A | 1 | |
| [x] | Rayons et ombre en pastilles | V/A | 1 | |
| [x] | Grille de contrastes avec ratios | V/A | 1 | |
| [x] | Mouvement : durée, courbe, `prefers-reduced-motion` | V/A | 1 | |
| [x] | Mention explicite de l'absence de mode sombre | V/A | 1 | Remplacée par le thème sombre (2026-09-05). |
| [x] | Bibliothèque d'icônes cohérente | A | 3 | Trois icônes aujourd'hui. |
| [ ] | Variantes sombres des logos | V | 2 | Un logo transparent à encre sombre disparaît sur la tuile `blanc` en mode sombre (`Logos`, `LogoProduit`). |

## Revue du site du 2026-09-05

Propositions issues d'une revue complète du site (fond, conversion, technique),
classées par thème. Même échelle de priorité : **1** à traiter en premier,
**2** utile ensuite, **3** finition. Chaque sujet sera abordé un à un, avec une
conception courte puis une PR, et coché ici une fois en production.

### Contenu et positionnement

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Titre et sous-titre de l'accueil orientés bénéfice | V | 1 | « Des logiciels qui complètent Sage 100 » décrit une catégorie ; le sous-titre oublie BOCS et parle de fabrication. |
| [ ] | Expliquer « Objets métiers Sage » | V | 1 | Une ligne ou une info-bulle partout où l'expression apparaît, dont la fiche technique ; préciser que l'option est payante chez Sage. |
| [ ] | Étoffer les cinq fiches produits | V | 1 | Récit problème → conséquence → solution → preuve, 400 à 600 mots ; accroches réécrites côté déclencheur. |
| [ ] | Prix, licence, essai sur chaque fiche | V | 1 | Au minimum une fourchette ou un « à partir de », le mode de licence, l'existence d'un essai. |
| [ ] | Prérequis techniques sur chaque fiche | V | 1 | Versions Sage 100 supportées, SQL Server, Windows, .NET, option Objets métiers requise ou non. |
| [ ] | Bloc « Support et mises à jour » | V | 1 | Canal, délai de réponse, suivi des montées de version Sage. |
| [ ] | Personne grammaticale unique | V | 2 | Le site mélange « Nicolas Bresson accompagne », « nous » et « on » ; choisir le « je ». |
| [ ] | Remplacer « Windows (WPF) » | V | 2 | « Application de bureau Windows 10/11 » ; le détail WPF/.NET en section technique. |
| [ ] | Fonctionnalités formulées en bénéfices | V | 2 | Les listes actuelles se lisent comme des notes internes. |

### Confiance et juridique

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Compléter les mentions légales | V | 1 | Placeholder « À compléter » visible en production ; manquent directeur de publication, RCS, TVA, contact direct. |
| [ ] | Compléter la politique de confidentialité | V | 1 | Responsable de traitement, base légale, durée de conservation, recours CNIL, transferts hors UE, date de mise à jour. |
| [ ] | Affirmer le traitement local des données | V | 1 | Sur chaque fiche : aucune donnée comptable ou bancaire ne quitte le poste. |
| [ ] | Page « À propos » | V | 1 | Photo, parcours, années d'expérience, LinkedIn ; entrée de navigation. |
| [ ] | Nuancer « aucun cookie » | V | 2 | Le thème est mémorisé dans le navigateur et Turnstile est chargé ; affirmer l'état réel de la mesure d'audience. |
| [ ] | CGV et licence logicielle | V | 2 | Page `/cgv/` et CLUF téléchargeable. |

### Conversion

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Second niveau d'appel à l'action | V | 1 | « Demander une démo » est seul et répété cinq fois ; ajouter question technique, fiche PDF ou vidéo. |
| [ ] | Alternatives au formulaire | V | 1 | Email, téléphone, prise de rendez-vous sur la page contact. |
| [ ] | Accusé de réception au visiteur | V | 1 | Second envoi Brevo avec récapitulatif, délai de réponse et lien vers la fiche concernée. |
| [ ] | Qualifier la demande | V | 2 | Choix démo / devis / question technique, téléphone facultatif. |
| [ ] | Case de consentement | V | 2 | Discutable pour une demande entrante ; à remplacer par une mention sous le bouton après validation juridique. |
| [ ] | Réassurance près du bouton et écran de succès | V | 2 | « Réponse par le consultant lui-même » ; liens de continuation après envoi. |
| [ ] | Activer un essai ou un téléchargement | V | 2 | Les états existent dans le code ; FEC Analyzer est le candidat naturel. |

### Structure et pages produits

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Structure des fiches produits | V | 1 | Ajouter « pour qui », « comment ça marche » (Étapes), prérequis, FAQ produit (Accordéon). |
| [ ] | FAQ générale | V | 1 | Prix, essai, versions Sage, installation, données, RGPD, changement de version. |
| [ ] | Références et témoignages | V | 1 | Trois témoignages nommés ou cas anonymisés chiffrés ; composants Témoignage et Logos déjà prêts. |
| [ ] | Comparatif « quel outil pour quel besoin » | V | 2 | Sur `/produits/`, via Tableau comparatif. |
| [ ] | Documentation et changelog | V | 2 | Pages `/documentation/` et `/changelog/` (Chronologie). |
| [ ] | Pied de page en colonnes | V | 2 | Produits nommés, société, contact direct, légal. |
| [ ] | Maillage interne | V | 2 | Fiches ↔ conseil ↔ blog ; repli « Tous les produits » quand la famille est vide (BOCS). |
| [ ] | Captures dans le récit | V | 2 | Remonter deux ou trois captures clés avec légende bénéfice ; chiffres clés par produit. |
| [ ] | Visionneuse pour la galerie | V | 3 | Boîte de dialogue avec précédent / suivant au lieu du PNG brut. |
| [ ] | Fil d'Ariane partout | V | 3 | Blog et pages légales ; entrée « Accueil » en tête. |

### Blog

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Trois premiers articles | V | 1 | Contrôles du FEC, CAMT.053 dans Sage 100, sauvegarde SQL Server Express, catégories tarifaires, Objets métiers ; masquer l'onglet tant que le blog est vide. |
| [ ] | Liste de tags de référence | V | 2 | `sage-100`, `comptabilite`, `gestion-commerciale`, `sql-server`, `fec`, `objets-metiers`. |
| [ ] | Signature, encart produit, RSS et abonnement visibles | V | 2 | Composant Abonnement déjà prêt. |

### SEO et partage

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Données structurées | V | 1 | Organization et Person (accueil), SoftwareApplication (fiches), BreadcrumbList, Article, FAQPage. |
| [ ] | Titres et descriptions | V | 1 | Trop courts ; champ `description` distinct de l'accroche dans le schéma produits. |
| [ ] | Image de partage par page | V | 2 | Étendre le script de génération aux produits et aux articles ; toujours émettre dimensions et alt. |
| [ ] | Sitemap, pagination, robots | V | 2 | Dates de modification, description propre aux pages 2+, `Disallow: /api/`, blog vide en `noindex`. |

### Performance

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Cache long des fichiers hachés | V | 1 | Fichier d'en-têtes : `/_astro/*` immuable un an, HTML court avec revalidation. |
| [ ] | Galerie sans PNG originaux | V | 1 | « Voir en grand » pointe sur la source ; générer une variante WebP large. |
| [ ] | `srcset` des cadres de capture | V | 2 | Largeurs 400 / 800 / 1600 et `sizes`. |
| [ ] | Préconnexion à Turnstile | V | 2 | Sur la page contact seulement. |
| [ ] | Poids des polices et du CSS | V | 3 | Un seul poids variable préchargé ; feuille séparée pour charte et gabarits. |

### Sécurité

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [x] | Protéger `/api/diagnostic` | V | 1 | En-tête `X-Diagnostic-Cle` comparé au secret `DIAGNOSTIC_CLE` ; 404 sinon (2026-09-05). |
| [x] | En-têtes de sécurité | V | 1 | Worker : HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options ; CSP `<meta>` générée par Astro avec empreintes ; Prism remplace Shiki (2026-09-05). Suite possible : couleurs de syntaxe dédiées dans la palette. |
| [ ] | Durcir le formulaire de contact | V | 2 | Lecture du corps plafonnée, limitation de débit, contrôle d'origine et de l'hôte du jeton Turnstile. |
| [ ] | Délais et dépendances | V | 3 | Délai maximal sur les appels sortants ; Dependabot et audit en CI. |

### Accessibilité

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Page contact sans JavaScript | V | 1 | Le message promet un fonctionnement sans script, faux avec Turnstile ; donner une adresse de repli. |
| [ ] | Turnstile en thème sombre | V | 1 | Widget figé en clair ; suivre `data-theme`. |
| [ ] | Erreurs de saisie sans script, menu mobile, champs obligatoires | V | 2 | Erreurs lisibles, fermeture au clic extérieur et focus, légende « * obligatoire ». |
| [ ] | Carrousel, contraste élevé, retour en haut | V | 3 | Diapositives hors écran inertes, `forced-colors`, lien vers le haut de page. |

### Qualité, tests et observabilité

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | Activer la mesure d'audience | V | 1 | Variable de build absente ; tracer l'envoi du formulaire par produit. |
| [ ] | Tests du HTML produit | V | 2 | Titres, descriptions, canonical, `noindex` ; ancres dans le vérificateur de liens. |
| [ ] | CI | V | 2 | Bloc `concurrency`, cache des images. |
| [ ] | Supervision | V | 2 | Contrôle externe de disponibilité, webhooks Brevo, alerte sur le taux d'erreur du Worker. |

### Bascule vers bresnik.fr

| Fait | Sujet | Cible | Priorité | Note |
|---|---|---|---|---|
| [ ] | URL du site depuis une variable de build | V | 1 | Figée sur workers.dev aujourd'hui ; redirection 301 du domaine technique et arrêt de sa publication. Depuis le 2026-09-05, les hôtes workers.dev portent déjà `X-Robots-Tag: noindex, nofollow`. |
| [ ] | Authentifier le domaine d'envoi Brevo | V | 1 | SPF, DKIM, DMARC ; expéditeur sur le domaine. |
| [ ] | Liste de bascule complète | V | 2 | Hôtes Turnstile en étape bloquante, mentions légales et confidentialité au même moment. |
