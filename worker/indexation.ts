/**
 * Indexation par les moteurs de recherche. Les hôtes techniques
 * (`*.workers.dev`, production comme prévisualisations) ne doivent jamais
 * être référencés : chaque réponse y porte `X-Robots-Tag: noindex, nofollow`.
 * Le domaine public, lui, reste indexable sans rien changer ici.
 */

export function hoteTechnique(hostname: string): boolean {
  return hostname === 'workers.dev' || hostname.endsWith('.workers.dev');
}

export function interdireIndexation(reponse: Response): Response {
  // Les en-têtes d'une réponse des ressources statiques sont immuables : on la recopie.
  const copie = new Response(reponse.body, reponse);
  copie.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return copie;
}
