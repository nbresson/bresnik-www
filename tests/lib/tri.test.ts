import { describe, expect, it } from 'vitest';
import { comparerValeurs, sensSuivant } from '../../src/lib/tri';

describe('comparerValeurs', () => {
  it('compare des textes avec la collation française, sans casse', () => {
    const valeurs = ['écrou', 'Boulon', 'axe'];
    expect([...valeurs].sort((a, b) => comparerValeurs(a, b, false))).toEqual(['axe', 'Boulon', 'écrou']);
  });

  it('compare des nombres écrits à la française', () => {
    const valeurs = ['12', '3', '1 250,5', '100'];
    expect([...valeurs].sort((a, b) => comparerValeurs(a, b, true))).toEqual(['3', '12', '100', '1 250,5']);
  });

  it('place les valeurs non numériques après les nombres', () => {
    expect([...['5', '—', '2'].sort((a, b) => comparerValeurs(a, b, true))]).toEqual(['2', '5', '—']);
  });
});

describe('sensSuivant', () => {
  it('alterne croissant puis décroissant', () => {
    expect(sensSuivant('aucun')).toBe('croissant');
    expect(sensSuivant('croissant')).toBe('decroissant');
    expect(sensSuivant('decroissant')).toBe('croissant');
  });
});
