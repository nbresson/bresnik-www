import type { Env } from './env';

/**
 * Diagnostic de la configuration du Worker, sans jamais renvoyer une valeur
 * secrète : présence, format, cohérence entre clés, et acceptation par les
 * services distants (Turnstile, Brevo). Consultable sur GET /api/diagnostic.
 */

export interface Verification {
  nom: string;
  ok: boolean;
  detail: string;
}

const MOTIF_BREVO = /^xkeysib-[0-9a-f]{64}-[A-Za-z0-9]{16}$/;
const MOTIF_TURNSTILE = /^0x[A-Za-z0-9_-]{20,}$/;
const MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function etatValeur(valeur: string | undefined): string {
  if (valeur === undefined || valeur === '') return 'absente';
  const brute = valeur;
  const nettoyee = brute.trim().replace(/^["']|["']$/g, '');
  if (nettoyee !== brute) return 'présente mais entourée d\'espaces ou de guillemets à retirer';
  return `présente (${brute.length} caractères)`;
}

function verifierFormat(nom: string, valeur: string | undefined, motif: RegExp, attendu: string): Verification {
  const etat = etatValeur(valeur);
  if (!valeur) return { nom, ok: false, detail: `Secret ${etat}.` };
  const conforme = motif.test(valeur);
  return { nom, ok: conforme && etat.startsWith('présente ('), detail: conforme ? `Secret ${etat}, format attendu.` : `Secret ${etat}, format inattendu : ${attendu}.` };
}

async function cleSiteDepuisPage(env: Env, origine: string): Promise<string | null> {
  try {
    const page = await env.ASSETS.fetch(new Request(`${origine}/contact/`));
    const html = await page.text();
    const correspondance = html.match(/data-sitekey="([^"]*)"/);
    return correspondance?.[1] ?? null;
  } catch {
    return null;
  }
}

async function testerTurnstile(secret: string, fetchFn: typeof fetch): Promise<Verification> {
  try {
    const reponse = await fetchFn('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: 'jeton-de-diagnostic' }),
    });
    const resultat = (await reponse.json()) as { 'error-codes'?: string[] };
    const codes = resultat['error-codes'] ?? [];
    if (codes.includes('invalid-input-secret') || codes.includes('missing-input-secret')) {
      return { nom: 'TURNSTILE_SECRET_KEY (acceptation par Cloudflare)', ok: false, detail: 'Cloudflare refuse cette clé secrète : ce n\'est pas la clé secrète du widget (vérifiez que ce n\'est pas la clé de site, ou celle d\'un autre widget).' };
    }
    if (codes.includes('invalid-input-response')) {
      return { nom: 'TURNSTILE_SECRET_KEY (acceptation par Cloudflare)', ok: true, detail: 'Cloudflare accepte la clé secrète (le jeton de test est refusé, ce qui est attendu).' };
    }
    return { nom: 'TURNSTILE_SECRET_KEY (acceptation par Cloudflare)', ok: false, detail: `Réponse inattendue de Cloudflare : codes ${codes.join(', ') || 'aucun'}.` };
  } catch {
    return { nom: 'TURNSTILE_SECRET_KEY (acceptation par Cloudflare)', ok: false, detail: 'Cloudflare injoignable depuis le Worker.' };
  }
}

async function testerBrevo(cle: string, fetchFn: typeof fetch): Promise<Verification> {
  try {
    const reponse = await fetchFn('https://api.brevo.com/v3/account', { headers: { 'api-key': cle, Accept: 'application/json' } });
    if (reponse.ok) return { nom: 'BREVO_API_KEY (acceptation par Brevo)', ok: true, detail: 'Brevo accepte la clé.' };
    if (reponse.status === 401) return { nom: 'BREVO_API_KEY (acceptation par Brevo)', ok: false, detail: 'Brevo refuse la clé (401) : clé incomplète, révoquée ou copiée avec une erreur.' };
    return { nom: 'BREVO_API_KEY (acceptation par Brevo)', ok: false, detail: `Brevo a répondu ${reponse.status}.` };
  } catch {
    return { nom: 'BREVO_API_KEY (acceptation par Brevo)', ok: false, detail: 'Brevo injoignable depuis le Worker.' };
  }
}

export async function diagnostiquer(env: Env, origine: string, fetchFn: typeof fetch = fetch): Promise<Verification[]> {
  const resultats: Verification[] = [];

  resultats.push(verifierFormat('BREVO_API_KEY (format)', env.BREVO_API_KEY, MOTIF_BREVO, 'une clé Brevo commence par « xkeysib- » et compte 81 caractères'));
  resultats.push(verifierFormat('TURNSTILE_SECRET_KEY (format)', env.TURNSTILE_SECRET_KEY, MOTIF_TURNSTILE, 'une clé secrète Turnstile commence par « 0x »'));

  const cleSite = await cleSiteDepuisPage(env, origine);
  if (cleSite === null) {
    resultats.push({ nom: 'PUBLIC_TURNSTILE_SITE_KEY (variable de build)', ok: false, detail: 'Impossible de lire la clé de site dans la page de contact.' });
  } else if (cleSite === '') {
    resultats.push({ nom: 'PUBLIC_TURNSTILE_SITE_KEY (variable de build)', ok: false, detail: 'La page de contact a été construite sans clé de site : variable de build absente au moment du build.' });
  } else if (cleSite.startsWith('1x') || cleSite.startsWith('2x') || cleSite.startsWith('3x')) {
    resultats.push({ nom: 'PUBLIC_TURNSTILE_SITE_KEY (variable de build)', ok: false, detail: 'La page utilise une clé de site de test, pas celle de votre widget.' });
  } else {
    resultats.push({ nom: 'PUBLIC_TURNSTILE_SITE_KEY (variable de build)', ok: true, detail: `Clé de site présente dans la page (${cleSite.length} caractères).` });
    if (env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SECRET_KEY === cleSite) {
      resultats.push({ nom: 'TURNSTILE_SECRET_KEY (cohérence)', ok: false, detail: 'La clé secrète est identique à la clé de site : la clé de site a été copiée à la place de la clé secrète.' });
    }
  }

  if (env.TURNSTILE_SECRET_KEY) resultats.push(await testerTurnstile(env.TURNSTILE_SECRET_KEY, fetchFn));
  if (env.BREVO_API_KEY) resultats.push(await testerBrevo(env.BREVO_API_KEY, fetchFn));

  for (const [nom, valeur] of [['CONTACT_TO_EMAIL', env.CONTACT_TO_EMAIL], ['CONTACT_FROM_EMAIL', env.CONTACT_FROM_EMAIL]] as const) {
    const etat = etatValeur(valeur);
    const conforme = Boolean(valeur) && MOTIF_EMAIL.test(valeur ?? '');
    resultats.push({ nom, ok: conforme && etat.startsWith('présente ('), detail: conforme ? `Adresse ${etat}, format attendu.` : `Adresse ${etat}${valeur ? ', format inattendu' : ''}.` });
  }

  return resultats;
}
