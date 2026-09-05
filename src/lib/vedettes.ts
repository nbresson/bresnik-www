/**
 * Captures vedettes : la première capture de chaque produit qui en possède,
 * dans l'ordre reçu (celui du catalogue). Sert au carrousel de l'accueil.
 */

export interface ProduitAvecCaptures<T> {
  id: string;
  nom: string;
  href: string;
  captures: T[];
}

export interface CaptureVedette<T> {
  id: string;
  nom: string;
  href: string;
  capture: T;
}

export function capturesVedettes<T>(produits: ProduitAvecCaptures<T>[]): CaptureVedette<T>[] {
  return produits
    .filter((produit) => produit.captures.length > 0)
    .map(({ id, nom, href, captures }) => ({ id, nom, href, capture: captures[0] }));
}
