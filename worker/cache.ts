/**
 * Cache navigateur des ressources construites. Les fichiers sous `/_astro/`
 * portent une empreinte dans leur nom : un nouveau build produit un nouveau
 * nom, l'ancien peut donc être conservé un an sans revalidation. Les pages
 * HTML gardent leur politique courte, posée par les ressources statiques.
 */

export const CACHE_IMMUABLE = 'public, max-age=31536000, immutable';

export function ressourceImmuable(pathname: string): boolean {
  return pathname.startsWith('/_astro/');
}

export function cacher(reponse: Response, pathname: string): Response {
  if (!ressourceImmuable(pathname) || reponse.status !== 200) return reponse;
  const copie = new Response(reponse.body, reponse);
  copie.headers.set('Cache-Control', CACHE_IMMUABLE);
  return copie;
}
