export type ElementPagination = number | 'ellipse';

/**
 * Pages à afficher dans une pagination : la première, la dernière, la
 * courante et ses voisines dans un rayon donné. Les trous sont marqués par
 * « ellipse », sauf quand ils ne cacheraient qu'une seule page, affichée alors.
 */
export function pagesAffichees(courante: number, total: number, rayon = 1): ElementPagination[] {
  if (total < 1) return [];
  const retenues = new Set<number>([1, total]);
  for (let page = courante - rayon; page <= courante + rayon; page += 1) {
    if (page >= 1 && page <= total) retenues.add(page);
  }
  const triees = [...retenues].sort((a, b) => a - b);
  const resultat: ElementPagination[] = [];
  for (const [index, page] of triees.entries()) {
    const precedente = triees[index - 1];
    if (precedente !== undefined) {
      const ecart = page - precedente;
      if (ecart === 2) resultat.push(precedente + 1);
      else if (ecart > 2) resultat.push('ellipse');
    }
    resultat.push(page);
  }
  return resultat;
}

/** URL d'une page de liste : la première sans numéro, les suivantes avec. */
export function lienPageListe(base: string, page: number): string {
  return page === 1 ? base : `${base}${page}/`;
}
