import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { ICONES_FONCTIONNALITE } from './lib/glyphes';

const produits = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/produits' }),
  schema: ({ image }) =>
    z.object({
      nom: z.string().min(1),
      accroche: z.string().min(1),
      /** Complète le nom dans le titre de la page : « Nom — Sous-titre », 60 caractères au plus. */
      sousTitre: z.string().min(1).max(48),
      /** Description pour les moteurs de recherche et le partage, 100 à 160 caractères. */
      description: z.string().min(100).max(160),
      cible: z.enum(['consultant', 'entreprise']),
      modulesSage: z.array(z.string()),
      objetsMetiersSage: z.boolean(),
      plateforme: z.string().min(1),
      /** Chaîne simple (coche) ou objet `{ titre, icone }` avec un glyphe de `src/lib/glyphes.ts`. */
      fonctionnalites: z.array(z.union([z.string().min(1), z.object({ titre: z.string().min(1), icone: z.enum(ICONES_FONCTIONNALITE).optional() })])).min(1),
      logo: image().optional(),
      captures: z.array(z.object({ fichier: z.string().min(1), alt: z.string().min(1), titre: z.string().optional() })).default([]),
      vedette: z.string().min(1).optional(),
      disponibilite: z.enum(['contact', 'telechargement', 'essai']),
      ordre: z.number().int(),
      publie: z.boolean(),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      titre: z.string().min(1),
      description: z.string().min(1),
      date: z.coerce.date(),
      miseAJour: z.coerce.date().optional(),
      tags: z.array(z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'Tag en minuscules, chiffres et tirets')),
      brouillon: z.boolean(),
      image: image().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    titre: z.string().min(1),
    description: z.string().min(1),
  }),
});

export const collections = { produits, blog, pages };
