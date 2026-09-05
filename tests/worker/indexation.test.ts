import { describe, expect, it, vi } from 'vitest';
import { hoteTechnique, interdireIndexation } from '../../worker/indexation';
import worker from '../../worker/index';
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

describe('worker fetch', () => {
  const env = (): Env => ({
    ASSETS: { fetch: vi.fn(async () => new Response('<html>', { headers: { 'Content-Type': 'text/html' } })) } as unknown as Env['ASSETS'],
    BREVO_API_KEY: '',
    TURNSTILE_SECRET_KEY: '',
    CONTACT_TO_EMAIL: '',
    CONTACT_FROM_EMAIL: '',
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

  it('laisse le domaine public indexable et transmet les pages aux ressources statiques', async () => {
    const e = env();
    const page = await worker.fetch(new Request('https://bresnik.fr/produits/'), e);
    expect(page.headers.get('X-Robots-Tag')).toBeNull();
    expect(e.ASSETS.fetch).toHaveBeenCalledTimes(1);
  });
});
