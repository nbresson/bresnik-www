import { describe, expect, it, vi } from 'vitest';
import { CACHE_IMMUABLE, cacher, ressourceImmuable } from '../../worker/cache';
import worker from '../../worker/index';
import type { Env } from '../../worker/env';

describe('ressourceImmuable', () => {
  it('reconnaît les fichiers construits sous /_astro/ et rien d\'autre', () => {
    expect(ressourceImmuable('/_astro/Base.Bj6oue3X.css')).toBe(true);
    expect(ressourceImmuable('/_astro/fonts/93b3050bb25583df.woff2')).toBe(true);
    expect(ressourceImmuable('/')).toBe(false);
    expect(ressourceImmuable('/produits/bocs/')).toBe(false);
    expect(ressourceImmuable('/og-default.png')).toBe(false);
    expect(ressourceImmuable('/api/produits.json')).toBe(false);
  });
});

describe('cacher', () => {
  it('pose un cache immuable d\'un an sur une ressource construite servie en 200', async () => {
    const reponse = cacher(new Response('css', { headers: { 'Content-Type': 'text/css', 'Cache-Control': 'public, max-age=0, must-revalidate' } }), '/_astro/a.css');
    expect(reponse.headers.get('Cache-Control')).toBe(CACHE_IMMUABLE);
    expect(reponse.headers.get('Content-Type')).toBe('text/css');
    expect(await reponse.text()).toBe('css');
  });

  it('laisse intacts les pages et les réponses qui ne sont pas en 200', () => {
    const page = new Response('<html>', { headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } });
    expect(cacher(page, '/produits/').headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
    const absent = new Response('', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    expect(cacher(absent, '/_astro/perdu.css').headers.get('Cache-Control')).toBe('no-store');
  });
});

describe('worker fetch', () => {
  it('sert /_astro/* avec le cache immuable et les pages avec leur politique d\'origine', async () => {
    const env = {
      ASSETS: { fetch: vi.fn(async () => new Response('x', { headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } })) } as unknown as Env['ASSETS'],
      BREVO_API_KEY: '',
      TURNSTILE_SECRET_KEY: '',
      CONTACT_TO_EMAIL: '',
      CONTACT_FROM_EMAIL: '',
    } satisfies Env;
    const css = await worker.fetch(new Request('https://bresnik.fr/_astro/Base.abc123.css'), env);
    const page = await worker.fetch(new Request('https://bresnik.fr/produits/'), env);
    expect(css.headers.get('Cache-Control')).toBe(CACHE_IMMUABLE);
    expect(page.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
  });
});
