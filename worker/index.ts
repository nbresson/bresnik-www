import type { Env } from './env';
import { hoteTechnique, interdireIndexation } from './indexation';

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
    const { diagnostiquer } = await import('./diagnostic');
    const resultats = await diagnostiquer(env, url.origin);
    return Response.json(
      { ok: resultats.every((r) => r.ok), verifications: resultats },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (url.pathname.startsWith('/api/') && url.pathname !== '/api/produits.json') {
    return Response.json({ ok: false, erreurs: [{ champ: '', message: 'Point de terminaison inconnu.' }] }, { status: 404 });
  }
  return env.ASSETS.fetch(request);
}
