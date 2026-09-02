import { describe, expect, it } from 'vitest';
import { filtrerPublies, listerTags, trierParDate } from '../../src/lib/blog';

const article = (id: string, date: string, brouillon: boolean, tags: string[] = []) => ({
  id,
  data: { date: new Date(date), brouillon, tags },
});

describe('filtrerPublies', () => {
  const articles = [article('a', '2026-01-01', false), article('b', '2026-01-02', true)];

  it('exclut les brouillons par défaut', () => {
    expect(filtrerPublies(articles, false).map((a) => a.id)).toEqual(['a']);
  });

  it('inclut les brouillons quand demandé', () => {
    expect(filtrerPublies(articles, true).map((a) => a.id)).toEqual(['a', 'b']);
  });
});

describe('trierParDate', () => {
  it('classe le plus récent en premier sans modifier le tableau source', () => {
    const articles = [article('ancien', '2025-06-01', false), article('recent', '2026-03-15', false)];
    const tries = trierParDate(articles);
    expect(tries.map((a) => a.id)).toEqual(['recent', 'ancien']);
    expect(articles.map((a) => a.id)).toEqual(['ancien', 'recent']);
  });
});

describe('listerTags', () => {
  it('renvoie les tags uniques triés en français', () => {
    const articles = [
      article('a', '2026-01-01', false, ['sql-server', 'sage-100']),
      article('b', '2026-01-02', false, ['sage-100', 'batigest']),
    ];
    expect(listerTags(articles)).toEqual(['batigest', 'sage-100', 'sql-server']);
  });
});
