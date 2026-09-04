import type { Env } from './env';

export async function traiterContact(_request: Request, _env: Env): Promise<Response> {
  return Response.json({ ok: false, erreurs: [{ champ: '', message: 'Formulaire en cours d\'activation.' }] }, { status: 501 });
}
