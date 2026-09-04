import { describe, expect, it, vi } from 'vitest';
import { envoyerBrevo } from '../../worker/brevo';

const options = {
  cle: 'cle-test',
  de: 'site@exemple.fr',
  a: 'nicolas@exemple.fr',
  repondreA: { email: 'visiteur@exemple.fr', nom: 'Visiteur' },
  sujet: 'Sujet',
  texte: 'Texte',
  html: '<p>Texte</p>',
};

describe('envoyerBrevo', () => {
  it('poste sur l\'API Brevo avec la clé et les champs attendus', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => new Response('{"messageId":"1"}', { status: 201 }));
    expect(await envoyerBrevo(options, fetchFn)).toEqual({ ok: true });
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect((init?.headers as Record<string, string>)['api-key']).toBe('cle-test');
    const corps = JSON.parse(init?.body as string);
    expect(corps).toEqual({
      sender: { email: 'site@exemple.fr', name: 'Site Bresnik' },
      to: [{ email: 'nicolas@exemple.fr' }],
      replyTo: { email: 'visiteur@exemple.fr', name: 'Visiteur' },
      subject: 'Sujet',
      textContent: 'Texte',
      htmlContent: '<p>Texte</p>',
    });
  });

  it('renvoie le statut en cas d\'échec et ok false sur erreur réseau', async () => {
    expect(await envoyerBrevo(options, vi.fn(async () => new Response('{}', { status: 401 })))).toEqual({ ok: false, statut: 401 });
    expect(await envoyerBrevo(options, vi.fn(async () => { throw new Error('réseau'); }))).toEqual({ ok: false, statut: 0 });
  });
});
