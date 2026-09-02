import { describe, expect, it } from 'vitest';
import { actionProduit } from '../../src/lib/produits';

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
