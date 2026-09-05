import { describe, expect, it, vi } from 'vitest';
import { ENTETES_SECURITE, securiser } from '../../worker/entetes';
import worker from '../../worker/index';
import type { Env } from '../../worker/env';

describe('securiser', () => {
  it('pose les cinq en-têtes de sécurité sans toucher au reste', async () => {
    const reponse = securiser(new Response('corps', { status: 201, headers: { 'Content-Type': 'text/plain' } }));
    for (const [nom, valeur] of Object.entries(ENTETES_SECURITE)) expect(reponse.headers.get(nom), nom).toBe(valeur);
    expect(reponse.status).toBe(201);
    expect(reponse.headers.get('Content-Type')).toBe('text/plain');
    expect(await reponse.text()).toBe('corps');
  });

  it('ne remplace pas un en-tête déjà posé par la route', () => {
    const reponse = securiser(new Response('', { headers: { 'Referrer-Policy': 'no-referrer' } }));
    expect(reponse.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(reponse.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('couvre HSTS, nosniff, referrer, permissions et cadres', () => {
    expect(Object.keys(ENTETES_SECURITE).sort()).toEqual(
      ['Permissions-Policy', 'Referrer-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options'],
    );
    expect(ENTETES_SECURITE['Strict-Transport-Security']).toMatch(/max-age=31536000/);
  });
});

describe('worker fetch', () => {
  const env = (): Env => ({
    ASSETS: { fetch: vi.fn(async () => new Response('<html>', { headers: { 'Content-Type': 'text/html' } })) } as unknown as Env['ASSETS'],
    BREVO_API_KEY: '',
    TURNSTILE_SECRET_KEY: '',
    CONTACT_TO_EMAIL: '',
    CONTACT_FROM_EMAIL: '',
  });

  it('sécurise les pages statiques comme les réponses d\'API, sur tous les hôtes', async () => {
    const e = env();
    const page = await worker.fetch(new Request('https://bresnik.fr/produits/'), e);
    const api = await worker.fetch(new Request('https://bresnik-www.nkobrs21.workers.dev/api/inconnu'), e);
    for (const reponse of [page, api]) {
      expect(reponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(reponse.headers.get('X-Frame-Options')).toBe('DENY');
    }
    expect(page.headers.get('X-Robots-Tag')).toBeNull();
    expect(api.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });
});
