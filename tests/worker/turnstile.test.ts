import { describe, expect, it, vi } from 'vitest';
import { verifierTurnstile } from '../../worker/turnstile';

const reponse = (corps: unknown, statut = 200) => new Response(JSON.stringify(corps), { status: statut });

describe('verifierTurnstile', () => {
  it('appelle siteverify avec le secret, le jeton et l\'adresse IP', async () => {
    const fetchFn = vi.fn(async () => reponse({ success: true }));
    const ok = await verifierTurnstile('jeton', 'secret', '203.0.113.1', fetchFn);
    expect(ok).toBe(true);
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init.method).toBe('POST');
    const corps = init.body as URLSearchParams;
    expect(corps.get('secret')).toBe('secret');
    expect(corps.get('response')).toBe('jeton');
    expect(corps.get('remoteip')).toBe('203.0.113.1');
  });

  it('refuse un jeton vide sans appel réseau', async () => {
    const fetchFn = vi.fn();
    expect(await verifierTurnstile('', 'secret', null, fetchFn)).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('refuse quand Cloudflare répond success false ou en erreur', async () => {
    expect(await verifierTurnstile('jeton', 'secret', null, vi.fn(async () => reponse({ success: false })))).toBe(false);
    expect(await verifierTurnstile('jeton', 'secret', null, vi.fn(async () => reponse({}, 500)))).toBe(false);
    expect(await verifierTurnstile('jeton', 'secret', null, vi.fn(async () => { throw new Error('réseau'); }))).toBe(false);
  });
});
