/**
 * En-têtes de sécurité posés sur toutes les réponses du Worker. La politique
 * de sécurité du contenu (CSP) est, elle, générée par Astro dans une balise
 * `<meta>` de chaque page, avec les empreintes des scripts et styles en ligne ;
 * `frame-ancestors` ne pouvant pas s'exprimer en `<meta>`, `X-Frame-Options`
 * le remplace ici.
 */

export const ENTETES_SECURITE: Readonly<Record<string, string>> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'X-Frame-Options': 'DENY',
};

export function securiser(reponse: Response): Response {
  // Les en-têtes d'une réponse des ressources statiques sont immuables : on la recopie.
  const copie = new Response(reponse.body, reponse);
  for (const [nom, valeur] of Object.entries(ENTETES_SECURITE)) {
    if (!copie.headers.has(nom)) copie.headers.set(nom, valeur);
  }
  return copie;
}
