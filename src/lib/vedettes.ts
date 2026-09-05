/**
 * Captures vedettes : pour chaque produit qui possède des captures, celle que
 * le frontmatter nomme dans `vedette` si elle existe, sinon la première.
 * L'ordre est celui reçu (celui du catalogue). Sert au carrousel de l'accueil.
 */

export interface ProduitAvecCaptures<T extends { fichier: string }> {
  id: string;
  nom: string;
  href: string;
  captures: T[];
  /** Nom du fichier à mettre en avant, facultatif. */
  vedette?: string;
}

export interface CaptureVedette<T> {
  id: string;
  nom: string;
  href: string;
  capture: T;
}

export function capturesVedettes<T extends { fichier: string }>(produits: ProduitAvecCaptures<T>[]): CaptureVedette<T>[] {
  return produits
    .filter((produit) => produit.captures.length > 0)
    .map(({ id, nom, href, captures, vedette }) => ({
      id,
      nom,
      href,
      capture: captures.find((capture) => capture.fichier === vedette) ?? captures[0],
    }));
}

/** Produits dont la vedette nommée ne correspond à aucune capture : à signaler au build. */
export function vedettesIntrouvables<T extends { fichier: string }>(produits: ProduitAvecCaptures<T>[]): string[] {
  return produits
    .filter((produit) => produit.vedette && !produit.captures.some((capture) => capture.fichier === produit.vedette))
    .map((produit) => `${produit.id} : vedette « ${produit.vedette} » introuvable dans ses captures`);
}
