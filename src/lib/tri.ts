export type SensTri = 'aucun' | 'croissant' | 'decroissant';

const collation = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });

/** Nombre écrit à la française (« 1 250,5 »), ou null si le texte n'en est pas un. */
export function nombreFrancais(texte: string): number | null {
  const normalise = texte.replace(/[\s  ]/g, '').replace(',', '.');
  if (normalise === '' || !/^[-+]?\d*(\.\d+)?$/.test(normalise)) return null;
  const valeur = Number.parseFloat(normalise);
  return Number.isFinite(valeur) ? valeur : null;
}

/** Comparateur pour le tri d'un tableau : numérique (non-nombres en dernier) ou textuel en français. */
export function comparerValeurs(a: string, b: string, numerique: boolean): number {
  if (numerique) {
    const na = nombreFrancais(a);
    const nb = nombreFrancais(b);
    if (na === null && nb === null) return collation.compare(a, b);
    if (na === null) return 1;
    if (nb === null) return -1;
    return na - nb;
  }
  return collation.compare(a, b);
}

export function sensSuivant(sens: SensTri): 'croissant' | 'decroissant' {
  return sens === 'croissant' ? 'decroissant' : 'croissant';
}
