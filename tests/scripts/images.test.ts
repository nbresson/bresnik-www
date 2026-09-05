import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function dimensionsPng(chemin: string) {
  const octets = readFileSync(chemin);
  return { largeur: octets.readUInt32BE(16), hauteur: octets.readUInt32BE(20) };
}

describe('images générées dans public/', () => {
  it('og-default.png fait 1200 × 630', () => {
    expect(dimensionsPng('public/og-default.png')).toEqual({ largeur: 1200, hauteur: 630 });
  });

  it('favicon-32.png fait 32 × 32 et apple-touch-icon.png 180 × 180', () => {
    expect(dimensionsPng('public/favicon-32.png')).toEqual({ largeur: 32, hauteur: 32 });
    expect(dimensionsPng('public/apple-touch-icon.png')).toEqual({ largeur: 180, hauteur: 180 });
  });

  it('chaque produit publié a son image de partage de 1200 × 630', () => {
    const produits = readdirSync('src/content/produits').filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
    expect(produits.length).toBeGreaterThan(0);
    for (const slug of produits) {
      const texte = readFileSync(`src/content/produits/${slug}.md`, 'utf8');
      if (/^publie: false/m.test(texte)) continue;
      expect(existsSync(`public/og/produits/${slug}.png`), slug).toBe(true);
      expect(dimensionsPng(`public/og/produits/${slug}.png`)).toEqual({ largeur: 1200, hauteur: 630 });
    }
  });

  it('favicon.svg est un SVG carré de 64', () => {
    expect(existsSync('public/favicon.svg')).toBe(true);
    const svg = readFileSync('public/favicon.svg', 'utf8');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 64 64"');
  });
});
