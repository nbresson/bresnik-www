import { describe, expect, it } from 'vitest';
import { evaluerRobustesse } from '../../src/lib/robustesse';

describe('evaluerRobustesse', () => {
  it('note zéro un mot de passe vide', () => {
    expect(evaluerRobustesse('')).toEqual({ score: 0, libelle: 'Vide', criteres: { longueur: false, majuscule: false, chiffre: false, symbole: false } });
  });

  it('compte chaque critère rempli', () => {
    expect(evaluerRobustesse('bonjour').score).toBe(0);
    expect(evaluerRobustesse('bonjour1').score).toBe(2);
    expect(evaluerRobustesse('Bonjour1').score).toBe(3);
    expect(evaluerRobustesse('Bonjour1!').score).toBe(4);
  });

  it('donne un libellé français par niveau', () => {
    expect(evaluerRobustesse('bonjour').libelle).toBe('Trop faible');
    expect(evaluerRobustesse('bonjour1').libelle).toBe('Faible');
    expect(evaluerRobustesse('Bonjour1').libelle).toBe('Correct');
    expect(evaluerRobustesse('Bonjour1!').libelle).toBe('Robuste');
  });
});
