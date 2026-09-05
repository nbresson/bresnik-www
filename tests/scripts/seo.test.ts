import { describe, expect, it } from 'vitest';
import { analyserPage, cheminPublic, verifierPage } from '../../scripts/seo.mjs';
import { lireFrontmatter } from '../../scripts/blog-frontmatter.mjs';

const page = ({ titre = 'Titre correct', description = 'd'.repeat(120), canonical = 'https://site.test/produits/', noindex = false } = {}) =>
  `<html><head><title>${titre}</title><meta name="description" content="${description}">${noindex ? '<meta name="robots" content="noindex">' : ''}<link rel="canonical" href="${canonical}"></head></html>`;

describe('analyserPage', () => {
  it('extrait titre, description, canonical, noindex et le nombre de blocs JSON-LD', () => {
    expect(analyserPage(page({ noindex: true }) + '<script type="application/ld+json">{}</script>')).toEqual({
      titre: 'Titre correct',
      description: 'd'.repeat(120),
      canonical: 'https://site.test/produits/',
      noindex: true,
      jsonld: 1,
    });
  });
});

describe('verifierPage', () => {
  it('accepte une page indexable dans les bornes avec le bon canonical', () => {
    expect(verifierPage(page(), '/produits/', 'https://site.test')).toEqual([]);
  });

  it('signale titre trop long, description hors bornes et canonical inattendu', () => {
    const problemes = verifierPage(page({ titre: 't'.repeat(61), description: 'court', canonical: 'https://site.test/autre/' }), '/produits/', 'https://site.test');
    expect(problemes).toEqual(['canonical inattendu : https://site.test/autre/', 'titre trop long (61)', 'description hors bornes (5)']);
  });

  it('exige noindex sur les pages techniques et le refuse ailleurs, sans juger leurs longueurs', () => {
    expect(verifierPage(page({ titre: 't'.repeat(80), canonical: 'https://site.test/charte/' }), '/charte/', 'https://site.test')).toEqual(['noindex attendu']);
    expect(verifierPage(page({ titre: 't'.repeat(80), canonical: 'https://site.test/charte/', noindex: true }), '/charte/', 'https://site.test')).toEqual([]);
    expect(verifierPage(page({ noindex: true }), '/produits/', 'https://site.test')).toEqual(['noindex inattendu']);
  });

  it('tolère noindex sur le blog vide et les pages de tags', () => {
    expect(verifierPage(page({ canonical: 'https://site.test/blog/', noindex: true }), '/blog/', 'https://site.test')).toEqual([]);
    expect(verifierPage(page({ canonical: 'https://site.test/blog/tags/fec/' }), '/blog/tags/fec/', 'https://site.test')).toEqual([]);
  });
});

describe('cheminPublic', () => {
  it('transforme un fichier de dist en chemin public', () => {
    expect(cheminPublic('C:/site/dist/produits/bocs/index.html', 'C:/site/dist')).toBe('/produits/bocs/');
    expect(cheminPublic('C:\\site\\dist\\404.html', 'C:\\site\\dist')).toBe('/404.html');
  });
});

describe('lireFrontmatter', () => {
  it('lit les champs scalaires en tête de fichier, sans les guillemets', () => {
    expect(lireFrontmatter('---\ntitre: "Bonjour"\ndate: 2026-09-02\nbrouillon: true\ntags:\n  - a\n---\ncorps')).toEqual({ titre: 'Bonjour', date: '2026-09-02', brouillon: 'true' });
    expect(lireFrontmatter('pas de frontmatter')).toEqual({});
  });
});
