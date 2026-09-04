import { describe, expect, it, vi } from 'vitest';
import { traiterContact } from '../../worker/contact';
import type { Env } from '../../worker/env';

const env = {
  ASSETS: { fetch: vi.fn() } as unknown as Env['ASSETS'],
  BREVO_API_KEY: 'cle',
  TURNSTILE_SECRET_KEY: 'secret',
  CONTACT_TO_EMAIL: 'nicolas@exemple.fr',
  CONTACT_FROM_EMAIL: 'site@exemple.fr',
} satisfies Env;

const champs = {
  nom: 'Nicolas Bresson',
  email: 'visiteur@exemple.fr',
  societe: '',
  produit: 'bocs',
  message: 'Je souhaite une démonstration de BOCS.',
  consentement: 'oui',
  site_web: '',
  'cf-turnstile-response': 'jeton',
};

const lireProduits = async () => ({ ids: ['bocs'], noms: { bocs: 'BOCS' } });

/** fetch simulé : Turnstile répond selon `turnstile`, Brevo selon `brevo`. */
const fetchSimule = (turnstile: boolean, brevo = 201) =>
  vi.fn<typeof fetch>(async (url: Parameters<typeof fetch>[0]) => {
    const adresse = String(url);
    if (adresse.includes('turnstile')) return new Response(JSON.stringify({ success: turnstile }));
    if (adresse.includes('brevo')) return new Response('{}', { status: brevo });
    throw new Error(`appel inattendu : ${adresse}`);
  });

const requeteJson = (corps: unknown, methode = 'POST') =>
  new Request('https://site.test/api/contact', {
    method: methode,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'CF-Connecting-IP': '203.0.113.1' },
    body: methode === 'POST' ? JSON.stringify(corps) : undefined,
  });

const requeteFormulaire = (corps: Record<string, string>) =>
  new Request('https://site.test/api/contact', { method: 'POST', body: new URLSearchParams(corps) });

describe('traiterContact', () => {
  it('refuse les méthodes autres que POST', async () => {
    const reponse = await traiterContact(requeteJson(null, 'GET'), env, { lireProduits });
    expect(reponse.status).toBe(405);
  });

  it('envoie l\'email et répond 200 en JSON', async () => {
    const fetchFn = fetchSimule(true);
    const reponse = await traiterContact(requeteJson(champs), env, { fetchFn, lireProduits });
    expect(reponse.status).toBe(200);
    expect(await reponse.json()).toEqual({ ok: true });
    const appelBrevo = fetchFn.mock.calls.find(([url]) => String(url).includes('brevo'));
    const corps = JSON.parse(appelBrevo?.[1]?.body as string);
    expect(corps.to).toEqual([{ email: 'nicolas@exemple.fr' }]);
    expect(corps.replyTo).toEqual({ email: 'visiteur@exemple.fr', name: 'Nicolas Bresson' });
    expect(corps.subject).toBe('[Contact] BOCS — Nicolas Bresson');
  });

  it('répond 400 avec les erreurs de champ, sans appeler Turnstile ni Brevo', async () => {
    const fetchFn = fetchSimule(true);
    const reponse = await traiterContact(requeteJson({ ...champs, email: 'faux' }), env, { fetchFn, lireProduits });
    expect(reponse.status).toBe(400);
    expect(await reponse.json()).toEqual({ ok: false, erreurs: [{ champ: 'email', message: 'L\'adresse email n\'est pas valide.' }] });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('répond 403 quand Turnstile refuse, sans envoyer', async () => {
    const fetchFn = fetchSimule(false);
    const reponse = await traiterContact(requeteJson(champs), env, { fetchFn, lireProduits });
    expect(reponse.status).toBe(403);
    expect(fetchFn.mock.calls.some(([url]) => String(url).includes('brevo'))).toBe(false);
  });

  it('répond 502 quand Brevo échoue', async () => {
    const reponse = await traiterContact(requeteJson(champs), env, { fetchFn: fetchSimule(true, 401), lireProduits });
    expect(reponse.status).toBe(502);
    expect(await reponse.json()).toEqual({ ok: false, erreurs: [{ champ: '', message: 'L\'envoi a échoué. Réessayez dans quelques minutes.' }] });
  });

  it('redirige un envoi de formulaire classique vers la page de contact', async () => {
    const succes = await traiterContact(requeteFormulaire(champs), env, { fetchFn: fetchSimule(true), lireProduits });
    expect(succes.status).toBe(303);
    expect(succes.headers.get('Location')).toBe('https://site.test/contact/?etat=envoye');
    const echec = await traiterContact(requeteFormulaire({ ...champs, nom: 'N', consentement: '' }), env, { fetchFn: fetchSimule(true), lireProduits });
    expect(echec.status).toBe(303);
    expect(echec.headers.get('Location')).toBe('https://site.test/contact/?etat=erreur&champs=nom%2Cconsentement');
  });

  it('lit la liste des produits depuis les assets par défaut', async () => {
    const assets = { fetch: vi.fn<(request: Request) => Promise<Response>>(async () => new Response(JSON.stringify({ produits: [{ id: 'bocs', nom: 'BOCS' }] }))) };
    const reponse = await traiterContact(requeteJson(champs), { ...env, ASSETS: assets as unknown as Env['ASSETS'] }, { fetchFn: fetchSimule(true) });
    expect(reponse.status).toBe(200);
    expect(assets.fetch.mock.calls[0]![0].url).toBe('https://site.test/api/produits.json');
  });
});
