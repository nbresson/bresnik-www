import { readFileSync, existsSync } from 'node:fs';
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

  it('favicon.svg est un SVG carré de 64', () => {
    expect(existsSync('public/favicon.svg')).toBe(true);
    const svg = readFileSync('public/favicon.svg', 'utf8');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 64 64"');
  });
});
