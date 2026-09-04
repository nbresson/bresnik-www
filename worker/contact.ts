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

const MESSAGE_TURNSTILE = 'La vérification anti-robot a échoué. Rechargez la page et réessayez.';
const MESSAGE_ENVOI = 'L\'envoi a échoué. Réessayez dans quelques minutes.';

async function lireCorps(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get('Content-Type') ?? '';
  if (type.includes('application/json')) {
    const json = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([cle, valeur]) => [cle, typeof valeur === 'string' ? valeur : '']));
  }
  const formulaire = await request.formData();
  return Object.fromEntries([...formulaire.entries()].map(([cle, valeur]) => [cle, typeof valeur === 'string' ? valeur : '']));
}

function attendJson(request: Request): boolean {
  return (request.headers.get('Accept') ?? '').includes('application/json');
}

function repondre(request: Request, statut: number, erreurs: ErreurChamp[]): Response {
  if (attendJson(request)) {
    return Response.json(statut === 200 ? { ok: true } : { ok: false, erreurs }, { status: statut });
  }
  const destination = new URL('/contact/', request.url);
  if (statut === 200) destination.searchParams.set('etat', 'envoye');
  else {
    destination.searchParams.set('etat', 'erreur');
    const champs = erreurs.map((e) => e.champ).filter(Boolean);
    if (champs.length > 0) destination.searchParams.set('champs', champs.join(','));
  }
  return Response.redirect(destination.toString(), 303);
}

async function produitsDepuisAssets(request: Request, env: Env): Promise<Produits> {
  const reponse = await env.ASSETS.fetch(new Request(new URL('/api/produits.json', request.url).toString()));
  const json = (await reponse.json()) as { produits: { id: string; nom: string }[] };
  return { ids: json.produits.map((p) => p.id), noms: Object.fromEntries(json.produits.map((p) => [p.id, p.nom])) };
}

export async function traiterContact(request: Request, env: Env, deps: DependancesContact = {}): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ ok: false, erreurs: [{ champ: '', message: 'Méthode non autorisée.' }] }, { status: 405, headers: { Allow: 'POST' } });
  }
  const fetchFn = deps.fetchFn ?? fetch;
  const lireProduits = deps.lireProduits ?? (() => produitsDepuisAssets(request, env));

  let brut: Record<string, string>;
  try {
    brut = await lireCorps(request);
  } catch {
    return repondre(request, 400, [{ champ: '', message: 'Requête illisible.' }]);
  }

  const produits = await lireProduits();
  const validation = validerContact(brut, produits.ids);
  if (!validation.ok) return repondre(request, 400, validation.erreurs);

  const ip = request.headers.get('CF-Connecting-IP');
  const humain = await verifierTurnstile(brut['cf-turnstile-response'] ?? '', env.TURNSTILE_SECRET_KEY, ip, fetchFn);
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
