const URL_VERIFICATION = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Vérifie un jeton Turnstile auprès de Cloudflare. Tout doute vaut refus. */
export async function verifierTurnstile(jeton: string, secret: string, ip: string | null, fetchFn: typeof fetch = fetch): Promise<boolean> {
  if (!jeton) return false;
  const corps = new URLSearchParams({ secret, response: jeton });
  if (ip) corps.set('remoteip', ip);
  try {
    const reponse = await fetchFn(URL_VERIFICATION, { method: 'POST', body: corps });
    if (!reponse.ok) return false;
    const resultat = (await reponse.json()) as { success?: boolean };
    return resultat.success === true;
  } catch {
    return false;
  }
}
