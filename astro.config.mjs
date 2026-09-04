// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const replisSans = ['Segoe UI', 'system-ui', 'sans-serif'];

export default defineConfig({
  site: 'https://bresnik-www.nkobrs21.workers.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (page) => !['/charte/', '/erreur/', '/maintenance/'].some((chemin) => page.includes(chemin)) })],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Bricolage Grotesque',
      cssVariable: '--police-titres',
      weights: ['500 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: replisSans,
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Source Sans 3',
      cssVariable: '--police-texte',
      weights: ['400 600'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: replisSans,
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--police-technique',
      weights: [500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Consolas', 'ui-monospace', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
