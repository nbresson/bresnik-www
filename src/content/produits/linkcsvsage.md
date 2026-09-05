---
nom: LinkCsvSage
accroche: Automatisez l'export CSV de vos documents Sage 100.
cible: entreprise
modulesSage:
  - "Sage 100 Gestion commerciale"
objetsMetiersSage: true
plateforme: Windows (WPF)
logo: ./logos/linkcsvsage.svg
captures:
  - fichier: connexion-multisocietes.png
    titre: Connexion à la société
    alt: Écran de connexion de LinkCsvSage, choix de la société Sage parmi celles déclarées, avec société par défaut, puis saisie du mot de passe.
  - fichier: configurateur-export.png
    titre: Profil d'export
    alt: Éditeur d'un profil d'export, choix et ordre des colonnes parmi les champs d'en-tête et de ligne du document, format CSV, séparateur, décimales, format de date, encodage, ligne d'en-tête, et aperçu du fichier produit.
  - fichier: export-et-rattachement.png
    titre: Sélection et export des documents
    alt: Sélection des documents de vente par type, période, numéro de pièce, client, représentant et dépôt, profil d'export, règle si un export existe déjà, transmission par e-mail, liste des pièces avec état exporté ou déjà rattaché, et bouton Exporter et rattacher.
  - fichier: rapport-export.png
    titre: Rapport d'export
    alt: Rapport d'export enregistré au format CSV et ouvert dans Excel, une ligne par pièce exportée avec son type, le résultat, le nom du fichier CSV produit et la durée.
fonctionnalites:
  - "Export CSV automatisé des documents de Gestion commerciale"
  - "Rattachement du fichier CSV au document Sage"
  - "Envoi facilité des documents au format CSV"
disponibilite: contact
ordre: 5
publie: true
---

LinkCsvSage automatise l'export CSV des documents de Sage 100 Gestion
commerciale et rattache le fichier produit au document Sage, afin de
faciliter l'envoi des documents au format CSV. Il s'appuie sur les Objets
métiers Sage.
