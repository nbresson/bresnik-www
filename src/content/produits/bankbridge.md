---
nom: BankBridge
accroche: Intégrez vos extraits bancaires dans Sage 100 Comptabilité.
sousTitre: Intégration bancaire pour Sage 100 Comptabilité
description: "BankBridge importe les relevés CFONB, CAMT.053, MT940 ou CSV dans Sage 100 Comptabilité, affecte les mouvements par règles et prépare le rapprochement."
cible: entreprise
modulesSage:
  - "Sage 100 Comptabilité"
objetsMetiersSage: true
plateforme: Application de bureau Windows 10/11
logo: ./logos/bankbridge.png
vedette: mouvements.png
captures:
  - fichier: tableau-de-bord.png
    titre: Tableau de bord
    alt: Tableau de bord de BankBridge, solde global issu de la comptabilité Sage, variation sur la période, chaîne d'intégration des mouvements et graphiques de flux mensuels.
  - fichier: import.png
    titre: Import de relevés
    alt: Écran d'import des relevés bancaires, formats CFONB 120, CAMT.053, MT940 et CSV, boîte de dépôt et extraits déjà présents dans Sage.
  - fichier: mouvements.png
    titre: Mouvements
    alt: Liste des mouvements bancaires avec nature, sens, montant, compte, tiers et statut, prêts à être affectés, validés puis intégrés dans Sage.
  - fichier: regles.png
    titre: Règles d'affectation
    alt: Règles d'affectation évaluées par priorité, avec pour chacune le critère sur le libellé, le compte cible et le nombre d'applications.
  - fichier: rapprochement.png
    titre: Rapprochement bancaire
    alt: Préparation d'une session de rapprochement bancaire par compte et par période.
  - fichier: diagnostic.png
    titre: Diagnostic du poste
    alt: Diagnostic du poste, vérification des Objets métiers Sage, de la base de travail et des serveurs SQL, sans rien modifier.
fonctionnalites:
  - titre: "Vos relevés CFONB, CAMT.053, MT940 ou CSV intégrés dans Sage en quelques clics"
    icone: banque
  - titre: "Chaque mouvement affecté au bon compte par vos règles, sans ressaisie"
    icone: rapport
  - titre: "Un rapprochement bancaire préparé par compte et par période"
    icone: rapprochement
disponibilite: contact
ordre: 2
publie: true
---

BankBridge facilite l'intégration semi-automatique des extraits bancaires
dans Sage 100 Comptabilité. Il améliore la gestion budgétaire et les
prévisions de trésorerie. Il écrit dans Sage par les Objets métiers, la couche
officielle de Sage 100 : chaque écriture passe les mêmes contrôles qu'une saisie.
