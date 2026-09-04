import { describe, expect, it } from 'vitest';
import { actionProduit, libelleAcces, libelleCible, produitsMemeFamille, tonCible } from '../../src/lib/produits';

describe('actionProduit', () => {
  it('propose une demande de démo pré-remplie pour la disponibilité contact', () => {
    expect(actionProduit('contact', 'bankbridge')).toEqual({
      libelle: 'Demander une démo',
      href: '/contact/?produit=bankbridge',
      actif: true,
      mention: null,
    });
  });

  it('désactive le téléchargement tant qu\'il n\'est pas disponible', () => {
    expect(actionProduit('telechargement', 'bocs')).toEqual({
      libelle: 'Télécharger',
      href: null,
      actif: false,
      mention: 'Bientôt disponible',
    });
  });

  it('désactive l\'essai tant qu\'il n\'est pas disponible', () => {
    expect(actionProduit('essai', 'fec-analyzer')).toEqual({
      libelle: 'Essayer gratuitement',
      href: null,
      actif: false,
      mention: 'Bientôt disponible',
    });
  });
});

describe('libelleCible et tonCible', () => {
  it('nomme et colore chaque cible', () => {
    expect(libelleCible('entreprise')).toBe('Entreprises');
    expect(libelleCible('consultant')).toBe('Consultants Sage');
    expect(tonCible('entreprise')).toBe('cobalt');
    expect(tonCible('consultant')).toBe('ambre');
  });
});

describe('libelleAcces', () => {
  it('décrit l\'accès selon la disponibilité', () => {
    expect(libelleAcces('contact')).toBe('Sur démonstration');
    expect(libelleAcces('telechargement')).toBe('Téléchargement');
    expect(libelleAcces('essai')).toBe('Essai gratuit');
  });
});

describe('produitsMemeFamille', () => {
  const p = (id: string, cible: string, ordre: number) => ({ id, data: { cible, ordre } });
  const tous = [p('a', 'entreprise', 3), p('b', 'consultant', 1), p('c', 'entreprise', 1), p('d', 'entreprise', 2), p('e', 'entreprise', 4)];

  it('renvoie les autres produits de la même cible, triés par ordre, limités à trois', () => {
    expect(produitsMemeFamille(tous, tous[0]).map((x) => x.id)).toEqual(['c', 'd', 'e']);
  });

  it('exclut le produit courant et respecte la limite demandée', () => {
    expect(produitsMemeFamille(tous, tous[2], 1).map((x) => x.id)).toEqual(['d']);
  });

  it('renvoie une liste vide quand le produit est seul de sa cible', () => {
    expect(produitsMemeFamille(tous, tous[1])).toEqual([]);
  });
});
