import { describe, expect, it, vi } from 'vitest';
import { diagnostiquer } from '../../worker/diagnostic';
import type { Env } from '../../worker/env';

const cleBrevo = `xkeysib-${'a'.repeat(64)}-${'B'.repeat(16)}`;
const cleSite = '0x4AAAAAAAsite0000000000000000';
const cleSecrete = '0x4AAAAAAAsecret000000000000000';

const assets = (sitekey: string) => ({
  fetch: vi.fn<(request: Request) => Promise<Response>>(async () => new Response(`<div class="cf-turnstile" data-sitekey="${sitekey}"></div>`)),
});

const env = (surcharges: Partial<Env> = {}, sitekey = cleSite): Env => ({
  ASSETS: assets(sitekey) as unknown as Env['ASSETS'],
  BREVO_API_KEY: cleBrevo,
  TURNSTILE_SECRET_KEY: cleSecrete,
  CONTACT_TO_EMAIL: 'nicolas@exemple.fr',
  CONTACT_FROM_EMAIL: 'nicolas@exemple.fr',
  ...surcharges,
});

const fetchSimule = (codesTurnstile: string[], statutBrevo = 200) =>
  vi.fn<typeof fetch>(async (url) => {
    const adresse = String(url);
    if (adresse.includes('turnstile')) return new Response(JSON.stringify({ success: false, 'error-codes': codesTurnstile }));
    if (adresse.includes('brevo')) return new Response('{}', { status: statutBrevo });
    throw new Error(`appel inattendu : ${adresse}`);
  });

const parNom = (resultats: { nom: string; ok: boolean; detail: string }[], debut: string) => resultats.find((r) => r.nom.startsWith(debut));

describe('diagnostiquer', () => {
  it('valide une configuration correcte', async () => {
    const resultats = await diagnostiquer(env(), 'https://site.test', fetchSimule(['invalid-input-response']));
    expect(resultats.every((r) => r.ok)).toBe(true);
    expect(parNom(resultats, 'TURNSTILE_SECRET_KEY (acceptation')?.detail).toContain('accepte');
    expect(resultats.some((r) => r.detail.includes(cleSecrete) || r.detail.includes(cleBrevo))).toBe(false);
  });

  it('détecte une clé de site copiée à la place de la clé secrète', async () => {
    const resultats = await diagnostiquer(env({ TURNSTILE_SECRET_KEY: cleSite }), 'https://site.test', fetchSimule(['invalid-input-secret']));
    expect(parNom(resultats, 'TURNSTILE_SECRET_KEY (cohérence')?.ok).toBe(false);
    expect(parNom(resultats, 'TURNSTILE_SECRET_KEY (acceptation')?.ok).toBe(false);
  });

  it('signale un secret absent, des espaces parasites et une clé Brevo refusée', async () => {
    const resultats = await diagnostiquer(env({ TURNSTILE_SECRET_KEY: '', BREVO_API_KEY: ` ${cleBrevo} ` }), 'https://site.test', fetchSimule([], 401));
    expect(parNom(resultats, 'TURNSTILE_SECRET_KEY (format')?.detail).toContain('absente');
    expect(parNom(resultats, 'BREVO_API_KEY (format')?.detail).toContain('espaces');
    expect(parNom(resultats, 'BREVO_API_KEY (acceptation')?.ok).toBe(false);
  });

  it('signale une page construite avec la clé de site de test', async () => {
    const resultats = await diagnostiquer(env({}, '1x00000000000000000000AA'), 'https://site.test', fetchSimule(['invalid-input-response']));
    expect(parNom(resultats, 'PUBLIC_TURNSTILE_SITE_KEY')?.ok).toBe(false);
    expect(parNom(resultats, 'PUBLIC_TURNSTILE_SITE_KEY')?.detail).toContain('test');
  });
});
