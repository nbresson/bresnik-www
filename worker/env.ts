/** Variables et liaisons du Worker. Les secrets sont définis dans Cloudflare, jamais dans le dépôt. */
export interface Env {
  ASSETS: Fetcher;
  BREVO_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}
