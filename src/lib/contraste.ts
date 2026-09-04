/** Luminance relative d'une couleur hexadécimale (#rrggbb), selon WCAG 2. */
export function luminance(hex: string): number {
  const canal = (position: number) => {
    const valeur = parseInt(hex.slice(position, position + 2), 16) / 255;
    return valeur <= 0.03928 ? valeur / 12.92 : ((valeur + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

/** Ratio de contraste WCAG entre deux couleurs, de 1 à 21. */
export function ratioContraste(premiere: string, seconde: string): number {
  const a = luminance(premiere);
  const b = luminance(seconde);
  const [clair, sombre] = a >= b ? [a, b] : [b, a];
  return (clair + 0.05) / (sombre + 0.05);
}
