---
nom: FEC Analyzer
accroche: Analysez votre Fichier des Écritures Comptables.
sousTitre: Analyse du Fichier des Écritures Comptables
description: "FEC Analyzer contrôle la conformité d'un Fichier des Écritures Comptables, reconstitue balance et grand-livre, détecte les anomalies et exporte les résultats."
cible: entreprise
modulesSage:
  - "Sage 100 Comptabilité"
objetsMetiersSage: false
plateforme: Application de bureau Windows 10/11
logo: ./logos/fec-analyzer.png
vedette: synthese.png
captures:
  - fichier: accueil.png
    titre: Ouverture d'un FEC
    alt: Écran d'accueil de FEC Analyzer, dépôt ou ouverture d'un fichier FEC au format texte tabulé ou à barre verticale, en 18, 21 ou 22 colonnes, et liste des dossiers récents avec leur nombre d'erreurs.
  - fichier: synthese.png
    titre: Synthèse
    alt: Synthèse d'un FEC non conforme, nombre de lignes, d'écritures, de comptes et de journaux, période, totaux débit et crédit, résultat, balance par classe et totaux par journal.
  - fichier: controles.png
    titre: Contrôles
    alt: Liste des contrôles avec sévérité, code, ligne et message, par exemple une date de validation antérieure à la date de comptabilisation, filtrable par type et par statut.
  - fichier: balance.png
    titre: Balance
    alt: Balance reconstituée, totaux des comptes de bilan et de résultat, puis pour chaque compte le débit, le crédit et les soldes débiteur et créditeur.
  - fichier: grand-livre.png
    titre: Grand-livre
    alt: Grand-livre reconstitué, écritures regroupées par compte avec date, journal, pièce, libellé, débit, crédit, lettrage, solde cumulé et sous-total par compte.
  - fichier: tiers.png
    titre: Tiers et balance âgée
    alt: Soldes par tiers clients avec nombre de lignes, débit, crédit et solde, puis balance âgée des écritures non lettrées par tranche d'ancienneté.
  - fichier: benford.png
    titre: Loi de Benford
    alt: Répartition du premier chiffre significatif des montants comparée à la loi de Benford, fréquences observée et théorique, écart et barres de distribution, avec l'indicateur de conformité.
  - fichier: recherche.png
    titre: Recherche dans les écritures
    alt: Recherche dans les écritures par libellé ou pièce, journal, compte, période et montant, résultats en tableau et export CSV.
fonctionnalites:
  - titre: "La synthèse du FEC en une lecture : lignes, journaux, totaux, résultat"
    icone: rapport
  - titre: "Les anomalies repérées avant le contrôle fiscal ou le commissaire aux comptes"
    icone: bouclier
  - titre: "Balance, grand-livre et comparatif N/N-1 reconstitués sans Sage"
    icone: livre-comptes
  - titre: "Une écriture retrouvée par libellé, pièce, compte, période ou montant"
    icone: recherche
  - titre: "Vos résultats exportés en Excel, PDF ou CSV"
    icone: export-fichier
disponibilite: contact
ordre: 3
publie: true
---

FEC Analyzer analyse un Fichier des Écritures Comptables : il en fait la
synthèse, détecte les anomalies, reconstitue les états comptables (Balance,
Grand-livre, comparatif N/N-1), facilite la recherche et l'export selon
plusieurs formats.
