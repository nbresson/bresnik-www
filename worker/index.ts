import type { Env } from './env';
import { hoteTechnique, interdireIndexation } from './indexation';

const inconnu = () => Response.json({ ok: false, erreurs: [{ champ: '', message: 'Point de terminaison inconnu.' }] }, { status: 404 });

/** Comparaison en temps constant, pour ne pas révéler la clé caractère par caractère. */
export function clesEgales(fournie: string | null, attendue: string | undefined): boolean {
  if (!fournie || !attendue || fournie.length !== attendue.length) return false;
  let difference = 0;
  for (let i = 0; i < attendue.length; i++) difference |= fournie.charCodeAt(i) ^ attendue.charCodeAt(i);
  return difference === 0;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const reponse = await router(request, env, url);
    return hoteTechnique(url.hostname) ? interdireIndexation(reponse) : reponse;
  },
} satisfies ExportedHandler<Env>;

async function router(request: Request, env: Env, url: URL): Promise<Response> {
  if (url.pathname === '/api/contact') {
    const { traiterContact } = await import('./contact');
    return traiterContact(request, env);
  }
  if (url.pathname === '/api/diagnostic') {
    // Sans clé configurée ou sans la bonne clé, la route n'existe pas.
    if (!clesEgales(request.headers.get('X-Diagnostic-Cle'), env.DIAGNOSTIC_CLE)) return inconnu();
    const { diagnostiquer } = await import('./diagnostic');
    const resultats = await diagnostiquer(env, url.origin);
    return Response.json(
      { ok: resultats.every((r) => r.ok), verifications: resultats },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (url.pathname.startsWith('/api/') && url.pathname !== '/api/produits.json') return inconnu();
  return env.ASSETS.fetch(request);
}
