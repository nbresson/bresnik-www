import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const produits = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/produits' }),
  schema: ({ image }) =>
    z.object({
      nom: z.string().min(1),
      accroche: z.string().min(1),
      cible: z.enum(['consultant', 'entreprise']),
      modulesSage: z.array(z.string()),
      objetsMetiersSage: z.boolean(),
      plateforme: z.string().min(1),
      fonctionnalites: z.array(z.string()).min(1),
      logo: image().optional(),
      captures: z.array(z.object({ src: image(), alt: z.string() })).default([]),
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
