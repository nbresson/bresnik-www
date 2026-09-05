---
nom: MajTarifPQ
accroche: Gérez votre politique tarifaire Fournisseur, Article, Catégorie, Client.
sousTitre: Tarifs fournisseurs et catégories Sage 100
description: "MajTarifPQ applique en masse coefficients et remises par fournisseur et catégorie tarifaire dans Sage 100 Gestion commerciale, avec aperçu et annulation."
cible: entreprise
modulesSage:
  - "Sage 100 Gestion commerciale"
objetsMetiersSage: true
plateforme: Application de bureau Windows 10/11
logo: ./logos/majtarifpq.png
vedette: regles.png
captures:
  - fichier: tableau-de-bord.png
    titre: Tableau de bord
    alt: Tableau de bord de MajTarifPQ sur la société ouverte, règles actives, fournisseurs et catégories visés, part du catalogue couverte, nature du paramétrage, cumul des lignes écrites et derniers lots appliqués.
  - fichier: regles.png
    titre: Règles de tarification
    alt: Liste des règles de tarification, une ligne par couple fournisseur et catégorie tarifaire, avec coefficient ou remise, statut actif et actions de modification et de suppression.
  - fichier: fournisseurs.png
    titre: Fournisseurs
    alt: Liste des fournisseurs de Sage 100 Gestion commerciale avec leur code, le nombre de règles et le nombre d'articles concernés, et un bouton pour ajouter une règle.
  - fichier: apercu.png
    titre: Aperçu avant application
    alt: Aperçu du calcul, articles applicables, inchangés, écartés ou en échec, avec pour chaque article le fournisseur, la catégorie, les coefficients et remises avant et après, l'état et le motif, puis l'application de la sélection.
  - fichier: historique.png
    titre: Historique des lots
    alt: Historique des lots d'application et d'annulation, avec pour le lot sélectionné le nombre de lignes écrites, en échec et prévues, le détail ligne par ligne, l'export du journal et l'annulation du lot.
fonctionnalites:
  - titre: "Un tarif par fournisseur et par catégorie tarifaire, ce que Sage ne permet pas"
    icone: colis
  - titre: "Coefficients et remises appliqués à tout un catalogue en un lot"
    icone: etiquette-prix
  - titre: "Un aperçu avant écriture et l'annulation d'un lot complet"
    icone: migration
disponibilite: contact
ordre: 4
publie: true
---

MajTarifPQ gère la politique tarifaire Fournisseur → Article → Catégorie
tarifaire → Client. Il facilite la gestion des catégories tarifaires de
Sage 100 Gestion commerciale en permettant une relation Fournisseur / Article
/ Catégorie tarifaire que Sage ne propose pas. Il s'appuie sur les Objets
métiers Sage.
