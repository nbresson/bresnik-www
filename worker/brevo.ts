const URL_BREVO = 'https://api.brevo.com/v3/smtp/email';

export interface OptionsBrevo {
  cle: string;
  de: string;
  a: string;
  repondreA: { email: string; nom: string };
  sujet: string;
  texte: string;
  html: string;
}

export async function envoyerBrevo(options: OptionsBrevo, fetchFn: typeof fetch = fetch): Promise<{ ok: true } | { ok: false; statut: number }> {
  const corps = {
    sender: { email: options.de, name: 'Site Bresnik' },
    to: [{ email: options.a }],
    replyTo: { email: options.repondreA.email, name: options.repondreA.nom },
    subject: options.sujet,
    textContent: options.texte,
    htmlContent: options.html,
  };
  try {
    const reponse = await fetchFn(URL_BREVO, {
      method: 'POST',
      headers: { 'api-key': options.cle, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(corps),
    });
    return reponse.ok ? { ok: true } : { ok: false, statut: reponse.status };
  } catch {
    return { ok: false, statut: 0 };
  }
}
