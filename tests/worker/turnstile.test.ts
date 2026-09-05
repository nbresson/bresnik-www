import { describe, expect, it, vi } from 'vitest';
import { verifierTurnstile } from '../../worker/turnstile';

const reponse = (corps: unknown, statut = 200) => new Response(JSON.stringify(corps), { status: statut });
const silencieux = () => {};

describe('verifierTurnstile', () => {
  it('appelle siteverify avec le secret, le jeton et l\'adresse IP', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => reponse({ success: true }));
    const ok = await verifierTurnstile('jeton', 'secret', '203.0.113.1', fetchFn, silencieux);
    expect(ok).toBe(true);
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init?.method).toBe('POST');
    const corps = init?.body as URLSearchParams;
    expect(corps.get('secret')).toBe('secret');
    expect(corps.get('response')).toBe('jeton');
    expect(corps.get('remoteip')).toBe('203.0.113.1');
  });

  it('refuse un jeton vide sans appel réseau et le journalise', async () => {
    const fetchFn = vi.fn<typeof fetch>();
    const journal = vi.fn();
    expect(await verifierTurnstile('', 'secret', null, fetchFn, journal)).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
    expect(journal).toHaveBeenCalledWith(expect.stringContaining('jeton absent'));
  });

  it('journalise les codes d\'erreur renvoyés par Cloudflare', async () => {
    const journal = vi.fn();
    const fetchFn = vi.fn<typeof fetch>(async () => reponse({ success: false, 'error-codes': ['invalid-input-secret'], hostname: 'exemple.fr' }));
    expect(await verifierTurnstile('jeton', 'secret', null, fetchFn, journal)).toBe(false);
    expect(journal).toHaveBeenCalledWith('Turnstile refusé : codes invalid-input-secret, hôte exemple.fr.');
  });

  it('refuse un jeton obtenu sur un autre hôte que celui attendu, et l\'accepte sur le bon', async () => {
    const journal = vi.fn();
    const autre = vi.fn<typeof fetch>(async () => reponse({ success: true, hostname: 'autre.example' }));
    expect(await verifierTurnstile('jeton', 'secret', null, autre, journal, 'bresnik.fr')).toBe(false);
    expect(journal).toHaveBeenCalledWith(expect.stringContaining('autre.example'));
    const bon = vi.fn<typeof fetch>(async () => reponse({ success: true, hostname: 'bresnik.fr' }));
    expect(await verifierTurnstile('jeton', 'secret', null, bon, silencieux, 'bresnik.fr')).toBe(true);
    const sansHote = vi.fn<typeof fetch>(async () => reponse({ success: true }));
    expect(await verifierTurnstile('jeton', 'secret', null, sansHote, silencieux, 'bresnik.fr')).toBe(true);
  });

  it('borne l\'attente de Cloudflare par un signal d\'abandon', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => reponse({ success: true }));
    await verifierTurnstile('jeton', 'secret', null, fetchFn, silencieux);
    expect(fetchFn.mock.calls[0]![1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('refuse quand Cloudflare répond success false ou en erreur', async () => {
    expect(await verifierTurnstile('jeton', 'secret', null, vi.fn<typeof fetch>(async () => reponse({ success: false })), silencieux)).toBe(false);
    expect(await verifierTurnstile('jeton', 'secret', null, vi.fn<typeof fetch>(async () => reponse({}, 500)), silencieux)).toBe(false);
    expect(await verifierTurnstile('jeton', 'secret', null, vi.fn<typeof fetch>(async () => { throw new Error('réseau'); }), silencieux)).toBe(false);
  });
});
