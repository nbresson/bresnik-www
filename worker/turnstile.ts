const URL_VERIFICATION = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
/** Délai maximal d'attente de Cloudflare, en millisecondes. */
export const DELAI_TURNSTILE = 8000;

type Journal = (message: string) => void;

/**
 * Vérifie un jeton Turnstile auprès de Cloudflare. Tout doute vaut refus.
 * Si `hoteAttendu` est fourni, le jeton doit avoir été obtenu sur cet hôte.
 * La raison du refus est journalisée (codes d'erreur Cloudflare, jamais de
 * donnée du visiteur) pour permettre le diagnostic dans les journaux du Worker.
 */
export async function verifierTurnstile(
  jeton: string,
  secret: string,
  ip: string | null,
  fetchFn: typeof fetch = fetch,
  journaliser: Journal = (message) => console.error(message),
  hoteAttendu?: string,
): Promise<boolean> {
  if (!jeton) {
    journaliser('Turnstile refusé : jeton absent (widget non terminé ou non rendu).');
    return false;
  }
  const corps = new URLSearchParams({ secret, response: jeton });
  if (ip) corps.set('remoteip', ip);
  try {
    const reponse = await fetchFn(URL_VERIFICATION, { method: 'POST', body: corps, signal: AbortSignal.timeout(DELAI_TURNSTILE) });
    if (!reponse.ok) {
      journaliser(`Turnstile refusé : siteverify a répondu ${reponse.status}.`);
      return false;
    }
    const resultat = (await reponse.json()) as { success?: boolean; 'error-codes'?: string[]; hostname?: string };
    if (resultat.success === true) {
      if (hoteAttendu && resultat.hostname && resultat.hostname !== hoteAttendu) {
        journaliser(`Turnstile refusé : jeton obtenu sur l'hôte ${resultat.hostname}, attendu ${hoteAttendu}.`);
        return false;
      }
      return true;
    }
    journaliser(`Turnstile refusé : codes ${(resultat['error-codes'] ?? []).join(', ') || 'aucun'}, hôte ${resultat.hostname ?? 'inconnu'}.`);
    return false;
  } catch (erreur) {
    journaliser(`Turnstile refusé : appel siteverify impossible (${erreur instanceof Error ? erreur.message : 'erreur'}).`);
    return false;
  }
}
