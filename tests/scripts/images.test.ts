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

  it('les favicons font 32, 192 et 512 et apple-touch-icon.png 180', () => {
    for (const taille of [32, 192, 512]) expect(dimensionsPng(`public/favicon-${taille}.png`)).toEqual({ largeur: taille, hauteur: taille });
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


  it('chaque vignette réseaux du manifeste existe aux dimensions annoncées', () => {
    const manifeste = JSON.parse(readFileSync('src/data/reseaux.json', 'utf8')) as { fichier: string; largeur: number; hauteur: number }[];
    expect(manifeste.length).toBeGreaterThan(20);
    for (const v of manifeste) {
      expect(existsSync(`public${v.fichier}`), v.fichier).toBe(true);
      expect(dimensionsPng(`public${v.fichier}`)).toEqual({ largeur: v.largeur, hauteur: v.hauteur });
    }
  });
});
