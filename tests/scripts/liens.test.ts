import { describe, expect, it } from 'vitest';
import { cheminsCandidats, estInterne, extraireLiens } from '../../scripts/liens.mjs';

describe('extraireLiens', () => {
  it('extrait les href et src, sans doublon', () => {
    const html = '<a href="/produits/">x</a><img src="/og.png"><a href="/produits/">y</a><link href="/rss.xml">';
    expect(extraireLiens(html)).toEqual(['/produits/', '/og.png', '/rss.xml']);
  });
});

describe('estInterne', () => {
  it('ne garde que les chemins absolus du site', () => {
    expect(estInterne('/blog/')).toBe(true);
    expect(estInterne('https://exemple.fr/')).toBe(false);
    expect(estInterne('//cdn.exemple.fr/x.js')).toBe(false);
    expect(estInterne('mailto:contact@exemple.fr')).toBe(false);
    expect(estInterne('#contenu')).toBe(false);
    expect(estInterne('/api/contact')).toBe(false);
  });
});

describe('cheminsCandidats', () => {
  it('résout un dossier vers son index', () => {
    expect(cheminsCandidats('/produits/')).toEqual(['produits/index.html']);
  });

  it('résout un fichier directement, en ignorant requête et ancre', () => {
    expect(cheminsCandidats('/contact/?produit=bocs#formulaire')).toEqual(['contact/index.html']);
    expect(cheminsCandidats('/rss.xml')).toEqual(['rss.xml']);
  });

  it('accepte une page sans barre finale sous ses deux formes', () => {
    expect(cheminsCandidats('/produits')).toEqual(['produits', 'produits/index.html', 'produits.html']);
  });
});
