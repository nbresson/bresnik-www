// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // URL provisoire : remplacée par l'URL workers.dev réelle (tâche 12),
  // puis par https://bresnik.fr après l'achat du domaine.
  site: 'https://bresnik-www.nkobrs21.workers.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
