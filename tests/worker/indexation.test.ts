import { describe, expect, it, vi } from 'vitest';
import { hoteTechnique, interdireIndexation } from '../../worker/indexation';
import worker, { clesEgales } from '../../worker/index';
import type { Env } from '../../worker/env';

describe('hoteTechnique', () => {
  it('reconnaît les hôtes workers.dev, production comme prévisualisations', () => {
    expect(hoteTechnique('bresnik-www.nkobrs21.workers.dev')).toBe(true);
    expect(hoteTechnique('feat-x-bresnik-www.nkobrs21.workers.dev')).toBe(true);
  });

  it('laisse passer le domaine public et le développement local', () => {
    expect(hoteTechnique('bresnik.fr')).toBe(false);
    expect(hoteTechnique('www.bresnik.fr')).toBe(false);
    expect(hoteTechnique('localhost')).toBe(false);
    expect(hoteTechnique('workers.dev.exemple.fr')).toBe(false);
  });
});

describe('interdireIndexation', () => {
  it('ajoute X-Robots-Tag sans toucher au statut, au corps ni aux autres en-têtes', async () => {
    const origine = new Response('corps', { status: 201, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });
    const reponse = interdireIndexation(origine);
    expect(reponse.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(reponse.status).toBe(201);
    expect(reponse.headers.get('Content-Type')).toBe('text/plain');
    expect(reponse.headers.get('Cache-Control')).toBe('no-store');
    expect(await reponse.text()).toBe('corps');
  });
});

describe('clesEgales', () => {
  it('compare des clés de même longueur et refuse les absentes', () => {
    expect(clesEgales('abc', 'abc')).toBe(true);
    expect(clesEgales('abd', 'abc')).toBe(false);
    expect(clesEgales('ab', 'abc')).toBe(false);
    expect(clesEgales(null, 'abc')).toBe(false);
    expect(clesEgales('', '')).toBe(false);
    expect(clesEgales('abc', undefined)).toBe(false);
  });
});

describe('worker fetch', () => {
  const env = (): Env => ({
    ASSETS: { fetch: vi.fn(async () => new Response('<html>', { headers: { 'Content-Type': 'text/html' } })) } as unknown as Env['ASSETS'],
    BREVO_API_KEY: '',
    TURNSTILE_SECRET_KEY: '',
    CONTACT_TO_EMAIL: '',
    CONTACT_FROM_EMAIL: '',
    DIAGNOSTIC_CLE: 'cle-de-diagnostic-longue',
  });

  it('interdit l\'indexation de toutes les réponses servies sur workers.dev', async () => {
    const e = env();
    const page = await worker.fetch(new Request('https://bresnik-www.nkobrs21.workers.dev/produits/'), e);
    expect(page.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(await page.text()).toBe('<html>');
    const api = await worker.fetch(new Request('https://bresnik-www.nkobrs21.workers.dev/api/inconnu'), e);
    expect(api.status).toBe(404);
    expect(api.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('cache le diagnostic sans la bonne clé, comme une route inconnue', async () => {
    const e = env();
    const sans = await worker.fetch(new Request('https://bresnik.fr/api/diagnostic'), e);
    const fausse = await worker.fetch(new Request('https://bresnik.fr/api/diagnostic', { headers: { 'X-Diagnostic-Cle': 'cle-de-diagnostic-fausse' } }), e);
    const inconnue = await worker.fetch(new Request('https://bresnik.fr/api/inconnu'), e);
    expect([sans.status, fausse.status]).toEqual([404, 404]);
    expect(await sans.text()).toBe(await inconnue.text());
    const desactive = await worker.fetch(new Request('https://bresnik.fr/api/diagnostic', { headers: { 'X-Diagnostic-Cle': '' } }), { ...e, DIAGNOSTIC_CLE: undefined });
    expect(desactive.status).toBe(404);
  });

  it('répond au diagnostic avec la bonne clé, sans mise en cache', async () => {
    const e = env();
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ success: false, 'error-codes': ['invalid-input-secret'] }, { status: 200 })));
    try {
      const reponse = await worker.fetch(new Request('https://bresnik.fr/api/diagnostic', { headers: { 'X-Diagnostic-Cle': 'cle-de-diagnostic-longue' } }), e);
      expect(reponse.status).toBe(200);
      expect(reponse.headers.get('Cache-Control')).toBe('no-store');
      const corps = (await reponse.json()) as { verifications: unknown[] };
      expect(corps.verifications.length).toBeGreaterThan(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('laisse le domaine public indexable et transmet les pages aux ressources statiques', async () => {
    const e = env();
    const page = await worker.fetch(new Request('https://bresnik.fr/produits/'), e);
    expect(page.headers.get('X-Robots-Tag')).toBeNull();
    expect(e.ASSETS.fetch).toHaveBeenCalledTimes(1);
  });
});
