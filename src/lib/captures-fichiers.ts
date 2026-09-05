import type { ImageMetadata } from 'astro';
import { fusionnerCaptures, type DescriptionCapture } from './captures';

export interface CaptureProduit {
  fichier: string;
  titre: string;
  alt: string;
  src: ImageMetadata;
}

// Toutes les captures, résolues au build par Vite (chemin absolu depuis la racine du projet).
const fichiers = import.meta.glob<{ default: ImageMetadata }>('/src/content/produits/captures/*/*.{png,jpg,jpeg,webp}', { eager: true });

function capturesBrutes(slug: string): Map<string, ImageMetadata> {
  const prefixe = `/src/content/produits/captures/${slug}/`;
  const resultat = new Map<string, ImageMetadata>();
  for (const [chemin, module] of Object.entries(fichiers)) {
    if (chemin.startsWith(prefixe)) resultat.set(chemin.slice(prefixe.length), module.default);
  }
  return resultat;
}

/** Captures du produit `slug`, ordonnées et décrites (voir `fusionnerCaptures`). */
export function capturesDuProduit(slug: string, nomProduit: string, descriptions: DescriptionCapture[] = []): CaptureProduit[] {
  const brutes = capturesBrutes(slug);
  return fusionnerCaptures([...brutes.keys()], descriptions, nomProduit).map((capture) => ({
    ...capture,
    src: brutes.get(capture.fichier)!,
  }));
}
