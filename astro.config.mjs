// @ts-check
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const replisSans = ['Segoe UI', 'system-ui', 'sans-serif'];

/**
 * Empreinte CSP d'un script inséré tel quel dans les pages (voir Base.astro).
 * @param {string} chemin
 * @returns {`sha256-${string}`}
 */
const empreinte = (chemin) => `sha256-${createHash('sha256').update(readFileSync(new URL(chemin, import.meta.url))).digest('base64')}`;

export default defineConfig({
  site: 'https://bresnik-www.nkobrs21.workers.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (page) => !['/charte/', '/erreur/', '/maintenance/', '/gabarits/', '/contact/merci/'].some((chemin) => page.includes(chemin)) })],
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
  // Prism plutôt que Shiki : Shiki colore par attributs style, incompatibles avec la CSP.
  markdown: { syntaxHighlight: 'prism' },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://cloudflareinsights.com",
        "frame-src https://challenges.cloudflare.com",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", 'https://challenges.cloudflare.com', 'https://static.cloudflareinsights.com'],
        hashes: [empreinte('./src/scripts/theme-anti-flash.js')],
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
