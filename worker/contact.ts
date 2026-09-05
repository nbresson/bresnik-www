import type { Env } from './env';
import { validerContact, type ErreurChamp } from './validation';
import { verifierTurnstile } from './turnstile';
import { construireEmail } from './email';
import { envoyerBrevo } from './brevo';

interface Produits {
  ids: string[];
  noms: Record<string, string>;
}

export interface DependancesContact {
  fetchFn?: typeof fetch;
  lireProduits?: () => Promise<Produits>;
}

const MESSAGE_TURNSTILE = 'La vérification anti-robot a échoué. Refaites-la et réessayez.';
const MESSAGE_ENVOI = 'L\'envoi a échoué. Réessayez dans quelques minutes.';

/** Taille maximale du corps d'une demande de contact. */
export const TAILLE_MAX = 32 * 1024;

class CorpsTropVolumineux extends Error {}

/**
 * Lit le corps en le plafonnant à `max` octets, quel que soit l'en-tête
 * Content-Length (absent en transfert par morceaux). Au-delà, la lecture
 * s'arrête et la requête est refusée.
 */
export async function lireOctets(request: Request, max = TAILLE_MAX): Promise<Uint8Array> {
  const lecteur = request.body?.getReader();
  if (!lecteur) return new Uint8Array();
  const morceaux: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lecteur.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await lecteur.cancel();
      throw new CorpsTropVolumineux();
    }
    morceaux.push(value);
  }
  const octets = new Uint8Array(total);
  let position = 0;
  for (const morceau of morceaux) {
    octets.set(morceau, position);
    position += morceau.byteLength;
  }
  return octets;
}

async function lireCorps(request: Request): Promise<Record<string, string>> {
  const octets = await lireOctets(request);
  const type = request.headers.get('Content-Type') ?? '';
  if (type.includes('application/json')) {
    const json = JSON.parse(new TextDecoder().decode(octets)) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([cle, valeur]) => [cle, typeof valeur === 'string' ? valeur : '']));
  }
  // Formulaire classique (urlencoded ou multipart) : on rejoue le corps plafonné dans une requête.
  const formulaire = await new Request(request.url, { method: 'POST', headers: request.headers, body: octets }).formData();
  return Object.fromEntries([...formulaire.entries()].map(([cle, valeur]) => [cle, typeof valeur === 'string' ? valeur : '']));
}

/** L'en-tête Origin, quand un navigateur l'envoie, doit désigner ce site. */
export function origineAcceptee(request: Request): boolean {
  const origine = request.headers.get('Origin');
  if (!origine || origine === 'null') return !origine;
  try {
    return new URL(origine).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function attendJson(request: Request): boolean {
  return (request.headers.get('Accept') ?? '').includes('application/json');
}

function repondre(request: Request, statut: number, erreurs: ErreurChamp[]): Response {
  if (attendJson(request)) {
    return Response.json(statut === 200 ? { ok: true } : { ok: false, erreurs }, { status: statut, headers: { 'Cache-Control': 'no-store' } });
  }
  let location: string;
  if (statut === 200) {
    location = '/contact/merci/';
  } else {
    const champs = erreurs.map((e) => e.champ).filter(Boolean);
    const parametres = new URLSearchParams({ etat: 'erreur' });
    if (champs.length > 0) parametres.set('champs', champs.join(','));
    location = `/contact/?${parametres.toString()}#erreur`;
  }
  return new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store' } });
}

async function produitsDepuisAssets(request: Request, env: Env): Promise<Produits> {
  const reponse = await env.ASSETS.fetch(new Request(new URL('/api/produits.json', request.url).toString()));
  if (!reponse.ok) throw new Error(`Assets produits.json : statut ${reponse.status}.`);
  const json = (await reponse.json()) as { produits: { id: string; nom: string }[] };
  return { ids: json.produits.map((p) => p.id), noms: Object.fromEntries(json.produits.map((p) => [p.id, p.nom])) };
}

export async function traiterContact(request: Request, env: Env, deps: DependancesContact = {}): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ ok: false, erreurs: [{ champ: '', message: 'Méthode non autorisée.' }] }, { status: 405, headers: { Allow: 'POST' } });
  }
  if (!origineAcceptee(request)) return repondre(request, 403, [{ champ: '', message: 'Origine de la demande non autorisée.' }]);
  const taille = Number(request.headers.get('Content-Length') ?? '0');
  if (taille > TAILLE_MAX) return repondre(request, 413, [{ champ: '', message: 'Requête trop volumineuse.' }]);

  const fetchFn = deps.fetchFn ?? fetch;
  const lireProduits = deps.lireProduits ?? (() => produitsDepuisAssets(request, env));

  let brut: Record<string, string>;
  try {
    brut = await lireCorps(request);
  } catch (erreur) {
    if (erreur instanceof CorpsTropVolumineux) return repondre(request, 413, [{ champ: '', message: 'Requête trop volumineuse.' }]);
    return repondre(request, 400, [{ champ: '', message: 'Requête illisible.' }]);
  }

  let produits: Produits;
  try {
    produits = await lireProduits();
  } catch {
    console.error('Liste des produits illisible.');
    return repondre(request, 502, [{ champ: '', message: MESSAGE_ENVOI }]);
  }
  const validation = validerContact(brut, produits.ids);
  if (!validation.ok) return repondre(request, 400, validation.erreurs);

  const ip = request.headers.get('CF-Connecting-IP');
  const humain = await verifierTurnstile(brut['cf-turnstile-response'] ?? '', env.TURNSTILE_SECRET_KEY, ip, fetchFn, undefined, new URL(request.url).hostname);
  if (!humain) return repondre(request, 403, [{ champ: 'cf-turnstile-response', message: MESSAGE_TURNSTILE }]);

  const email = construireEmail(validation.valeurs, produits.noms);
  const envoi = await envoyerBrevo(
    {
      cle: env.BREVO_API_KEY,
      de: env.CONTACT_FROM_EMAIL,
      a: env.CONTACT_TO_EMAIL,
      repondreA: { email: validation.valeurs.email, nom: validation.valeurs.nom },
      ...email,
    },
    fetchFn,
  );
  if (!envoi.ok) {
    console.error(`Envoi Brevo refusé (statut ${envoi.statut}).`);
    return repondre(request, 502, [{ champ: '', message: MESSAGE_ENVOI }]);
  }
  return repondre(request, 200, []);
}
