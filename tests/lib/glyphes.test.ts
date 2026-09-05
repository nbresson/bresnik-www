import { describe, expect, it } from 'vitest';
import { GLYPHES, ICONES_FONCTIONNALITE, glypheAcces, glypheModules, normaliserFonctionnalites } from '../../src/lib/glyphes';

describe('normaliserFonctionnalites', () => {
  it('accepte chaînes et objets, avec la coche par défaut', () => {
    expect(normaliserFonctionnalites(['Export', { titre: 'Banque', icone: 'banque' }, { titre: 'Sans icône' }])).toEqual([
      { titre: 'Export', icone: 'coche' },
      { titre: 'Banque', icone: 'banque' },
      { titre: 'Sans icône', icone: 'coche' },
    ]);
  });
});

describe('glypheModules', () => {
  it('distingue comptabilité, gestion commerciale et le cas générique', () => {
    expect(glypheModules(['Sage 100 Comptabilité'])).toBe('livre-comptes');
    expect(glypheModules(['Sage 100 Gestion commerciale'])).toBe('colis');
    expect(glypheModules(['Sage 100 Comptabilité', 'Sage 100 Gestion commerciale'])).toBe('document');
    expect(glypheModules([])).toBe('document');
  });
});

describe('glypheAcces', () => {
  it('courrier pour le contact, téléchargement sinon', () => {
    expect(glypheAcces('contact')).toBe('courrier');
    expect(glypheAcces('telechargement')).toBe('telecharger');
    expect(glypheAcces('essai')).toBe('telecharger');
  });
});

describe('listes', () => {
  it('les icônes de fonctionnalité incluent tous les glyphes métier et la coche', () => {
    for (const g of GLYPHES) expect(ICONES_FONCTIONNALITE).toContain(g);
    expect(ICONES_FONCTIONNALITE).toContain('coche');
  });
});
