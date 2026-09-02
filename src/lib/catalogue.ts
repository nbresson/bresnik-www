import { getCollection, type CollectionEntry } from 'astro:content';

/** Produits publiés, triés par le champ `ordre`. */
export async function produitsPublies(): Promise<CollectionEntry<'produits'>[]> {
  const produits = await getCollection('produits', ({ data }) => data.publie);
  return produits.sort((a, b) => a.data.ordre - b.data.ordre);
}
