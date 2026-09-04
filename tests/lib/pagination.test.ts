import { describe, expect, it } from 'vitest';
import { pagesAffichees } from '../../src/lib/pagination';

describe('pagesAffichees', () => {
  it('renvoie toutes les pages quand il y en a peu', () => {
    expect(pagesAffichees(1, 3)).toEqual([1, 2, 3]);
  });

  it('garde la première, la dernière, la courante et ses voisines, avec des ellipses', () => {
    expect(pagesAffichees(5, 10)).toEqual([1, 'ellipse', 4, 5, 6, 'ellipse', 10]);
  });

  it('évite une ellipse qui ne cacherait rien', () => {
    expect(pagesAffichees(3, 10)).toEqual([1, 2, 3, 4, 'ellipse', 10]);
    expect(pagesAffichees(8, 10)).toEqual([1, 'ellipse', 7, 8, 9, 10]);
  });

  it('gère une seule page', () => {
    expect(pagesAffichees(1, 1)).toEqual([1]);
  });
});
