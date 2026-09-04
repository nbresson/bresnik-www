# Formulaire de contact — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre le formulaire de contact fonctionnel : un Worker Cloudflare reçoit la demande sur `/api/contact`, vérifie Turnstile, valide les champs et envoie un email à Nicolas via l'API Brevo, avec réponse JSON pour le script de la page et redirection pour l'envoi sans JavaScript.

**Architecture:** Le Worker `worker/index.ts` devient le script principal (`main`) du site : il traite `/api/*` (`run_worker_first`) et laisse tout le reste aux assets statiques. La logique est découpée en modules purs testés avec Vitest en injectant `fetch` : validation des champs, vérification Turnstile, appel Brevo, construction de l'email, traitement de la requête. La liste des produits valides est lue par le Worker depuis un point de terminaison statique `/api/produits.json` généré par Astro. Côté page, le formulaire existant est activé : consentement, widget Turnstile, envoi en `fetch` avec état de chargement et messages d'erreur, repli natif par redirection.

**Tech Stack:** Cloudflare Workers (assets + script), Wrangler 4, TypeScript avec `@cloudflare/workers-types`, Vitest 4, Turnstile, API Brevo v3, Astro 7 pour la page et le point de terminaison JSON.

**Spec:** `docs/superpowers/specs/2026-09-02-bresnik-www-design.md` §7 (formulaire), §8 (secrets sur le Worker). Composants disponibles : `docs/superpowers/specs/2026-09-03-design-site-vitrine-design.md` §3 bis (Alerte, ResumeErreurs, Champ avec erreur, Choix, GroupeChoix, Bouton chargement).

## Global Constraints

- Langue : français partout (libellés, messages d'erreur, emails, commits).
- Secrets attendus sur le Worker, déjà en place dans Cloudflare : `BREVO_API_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Variable de build : `PUBLIC_TURNSTILE_SITE_KEY`. Aucune valeur secrète dans le dépôt, les rapports ou les commits ; en local, `.dev.vars` (ignoré par Git) et `.env` (ignoré) portent les valeurs.
- Validation (spec §7) : nom 2 à 100 caractères ; email au format valide ; message 10 à 5000 caractères ; société facultative, 100 caractères au plus ; produit vide ou identifiant connu ; pot-de-miel `site_web` vide ; consentement coché.
- Aucune donnée stockée : le Worker n'écrit ni journal nominatif ni base ; en cas d'erreur, réponse générique côté visiteur, détail technique dans `console.error` sans les données saisies.
- Réponses du Worker : `POST /api/contact` seulement ; `405` sinon. Succès `200 {"ok":true}` ; erreurs de validation `400 {"ok":false,"erreurs":[{"champ","message"}]}` ; Turnstile refusé `403 {"ok":false,"erreurs":[{"champ":"cf-turnstile-response","message":"…"}]}` ; échec d'envoi `502 {"ok":false,"erreurs":[{"champ":"","message":"…"}]}`. Sans en-tête `Accept: application/json`, redirection `303` vers `/contact/?etat=envoye` ou `/contact/?etat=erreur&champs=<liste>`.
- Les clés de test Turnstile servent en local et dans les tests : site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA` (toujours valides) ; secret `2x0000000000000000000000000000000AA` (toujours refusé).
- Tout lien interne se termine par `/` ; `/api/contact` et `/api/produits.json` sont des points de terminaison.
- Fin de chaque message de commit : `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- `npm run check`, `npm run check:worker`, `npm test`, `npm run build`, `npm run verifier-liens` doivent passer à la fin de chaque tâche (à partir de la tâche 1 pour `check:worker`).

---

## Carte des fichiers

| Fichier | Responsabilité |
|---|---|
| `wrangler.jsonc` | `main`, liaison `ASSETS`, `run_worker_first`. |
| `worker/tsconfig.json`, `worker/env.ts` | Typage du Worker et de ses variables. |
| `worker/index.ts` | Routage : `/api/contact` → traitement ; sinon assets. |
| `worker/validation.ts` | Validation pure des champs. |
| `worker/turnstile.ts` | Vérification du jeton Turnstile (fetch injecté). |
| `worker/email.ts` | Sujet, texte et HTML de l'email de notification. |
| `worker/brevo.ts` | Envoi via l'API Brevo (fetch injecté). |
| `worker/contact.ts` | Traitement d'une requête : lecture du corps, validation, Turnstile, envoi, réponse. |
| `src/pages/api/produits.json.ts` | Liste des identifiants de produits publiés. |
| `src/pages/contact.astro` | Formulaire activé, consentement, Turnstile, script d'envoi, états. |
| `src/content/pages/confidentialite.md` | Mention de Turnstile. |
| `tests/worker/*.test.ts` | Tests des modules du Worker. |
| `.dev.vars.example`, `.env.example`, `docs/deploiement.md`, `README.md`, `docs/backlog-composants.md` | Documentation. |

---

### Task 1 : Worker principal branché sur les assets

**Files:**
- Modify: `wrangler.jsonc`, `tsconfig.json`, `package.json`, `.github/workflows/ci.yml`, `.dev.vars.example`
- Create: `worker/tsconfig.json`, `worker/env.ts`, `worker/index.ts`, `.env.example`

**Interfaces:**
- Produces: `interface Env { ASSETS: Fetcher; BREVO_API_KEY: string; TURNSTILE_SECRET_KEY: string; CONTACT_TO_EMAIL: string; CONTACT_FROM_EMAIL: string }` dans `worker/env.ts` ; `worker/index.ts` exporte `default { fetch }` et délègue `/api/contact` à `traiterContact(request, env)` importé de `./contact` (créé en tâche 5 ; jusque-là, un stub renvoie `501`). Script `npm run check:worker`.

- [ ] **Étape 1 : Dépendance et scripts**

Run : `npm install --save-dev @cloudflare/workers-types@^5.20260904.1`

Dans `package.json`, `scripts`, ajouter : `"check:worker": "tsc -p worker --noEmit"`.

- [ ] **Étape 2 : Configuration Wrangler**

Remplacer `wrangler.jsonc` par :

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "bresnik-www",
  "main": "worker/index.ts",
  "compatibility_date": "2026-09-02",
  "workers_dev": true,
  "preview_urls": true,
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "404-page",
    "run_worker_first": ["/api/*"]
  }
}
```

- [ ] **Étape 3 : Typage du Worker**

`worker/tsconfig.json` :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types/2023-07-01"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["./**/*.ts"]
}
```

Dans `tsconfig.json` (racine), remplacer `"exclude": ["dist", "node_modules"]` par `"exclude": ["dist", "node_modules", "worker"]`.

`worker/env.ts` :

```ts
/** Variables et liaisons du Worker. Les secrets sont définis dans Cloudflare, jamais dans le dépôt. */
export interface Env {
  ASSETS: Fetcher;
  BREVO_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}
```

- [ ] **Étape 4 : Point d'entrée**

`worker/index.ts` :

```ts
import type { Env } from './env';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') {
      const { traiterContact } = await import('./contact');
      return traiterContact(request, env);
    }
    if (url.pathname.startsWith('/api/') && url.pathname !== '/api/produits.json') {
      return Response.json({ ok: false, erreurs: [{ champ: '', message: 'Point de terminaison inconnu.' }] }, { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
```

Créer provisoirement `worker/contact.ts` (remplacé en tâche 5) :

```ts
import type { Env } from './env';

export async function traiterContact(_request: Request, _env: Env): Promise<Response> {
  return Response.json({ ok: false, erreurs: [{ champ: '', message: 'Formulaire en cours d\'activation.' }] }, { status: 501 });
}
```

- [ ] **Étape 5 : Fichiers d'exemple et CI**

Remplacer `.dev.vars.example` par :

```
# Copier en .dev.vars (ignoré par Git) pour `npm run cf:dev`. Valeurs de test Turnstile : toujours valides.
BREVO_API_KEY=remplacer-par-la-cle-brevo
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
CONTACT_TO_EMAIL=vous@exemple.fr
CONTACT_FROM_EMAIL=vous@exemple.fr
```

`.env.example` (variables publiques lues par Astro au build) :

```
# Copier en .env (ignoré par Git). Clé de site Turnstile de test : widget toujours validé.
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

Dans `.github/workflows/ci.yml`, après `- run: npm run check`, ajouter `      - run: npm run check:worker`.

- [ ] **Étape 6 : Vérifier**

Run : `npm run check && npm run check:worker && npm run build`

Puis, dans un premier terminal, `npx wrangler dev --port 8788` (créer d'abord `.dev.vars` à partir de l'exemple si absent ; ne pas le commiter). Dans un second :

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/
curl -s -w "\n%{http_code}\n" -X POST http://localhost:8788/api/contact
curl -s -w "\n%{http_code}\n" http://localhost:8788/api/inconnu
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/produits/bocs/
```

Expected : `200` ; corps JSON `ok:false` et `501` ; JSON et `404` ; `200`. Arrêter le serveur.

- [ ] **Étape 7 : Commit**

```bash
git add -A
git commit -m "feat(worker): script principal du Worker, routage de /api/* et typage

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2 : Validation des champs et liste des produits

**Files:**
- Create: `worker/validation.ts`, `tests/worker/validation.test.ts`, `src/pages/api/produits.json.ts`

**Interfaces:**
- Produces: `type ErreurChamp = { champ: string; message: string }` ; `type DonneesContact = { nom: string; email: string; societe: string; produit: string; message: string }` ; `validerContact(brut: Record<string, string>, produitsConnus: string[]): { ok: true; valeurs: DonneesContact } | { ok: false; erreurs: ErreurChamp[] }` ; `GET /api/produits.json` → `{ "produits": ["bocs", "bankbridge", …] }`.

- [ ] **Étape 1 : Tests (échec attendu)**

`tests/worker/validation.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { validerContact } from '../../worker/validation';

const produits = ['bocs', 'bankbridge'];
const valide = {
  nom: 'Nicolas Bresson',
  email: 'nicolas@exemple.fr',
  societe: 'Bresnik',
  produit: 'bankbridge',
  message: 'Je souhaite une démonstration de BankBridge.',
  consentement: 'oui',
  site_web: '',
};

describe('validerContact', () => {
  it('accepte une demande complète et normalise les espaces', () => {
    const resultat = validerContact({ ...valide, nom: '  Nicolas Bresson  ' }, produits);
    expect(resultat).toEqual({ ok: true, valeurs: { nom: 'Nicolas Bresson', email: 'nicolas@exemple.fr', societe: 'Bresnik', produit: 'bankbridge', message: valide.message } });
  });

  it('accepte une demande sans société ni produit', () => {
    const resultat = validerContact({ ...valide, societe: '', produit: '' }, produits);
    expect(resultat.ok).toBe(true);
  });

  it('refuse un nom trop court, un email invalide, un message trop court', () => {
    const resultat = validerContact({ ...valide, nom: 'N', email: 'nicolas@', message: 'Bonjour' }, produits);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) expect(resultat.erreurs.map((e) => e.champ)).toEqual(['nom', 'email', 'message']);
  });

  it('refuse un produit inconnu et un message trop long', () => {
    const resultat = validerContact({ ...valide, produit: 'inconnu', message: 'a'.repeat(5001) }, produits);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) expect(resultat.erreurs.map((e) => e.champ)).toEqual(['produit', 'message']);
  });

  it('exige le consentement', () => {
    const resultat = validerContact({ ...valide, consentement: '' }, produits);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) expect(resultat.erreurs).toEqual([{ champ: 'consentement', message: 'Merci de cocher la case de consentement.' }]);
  });

  it('refuse silencieusement un pot-de-miel rempli, sous forme d\'erreur générique', () => {
    const resultat = validerContact({ ...valide, site_web: 'http://spam.example' }, produits);
    expect(resultat).toEqual({ ok: false, erreurs: [{ champ: '', message: 'Envoi impossible.' }] });
  });

  it('tolère des champs absents', () => {
    const resultat = validerContact({}, produits);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) expect(resultat.erreurs.map((e) => e.champ)).toEqual(['nom', 'email', 'message', 'consentement']);
  });
});
```

Run : `npm test` → FAIL, module introuvable.

- [ ] **Étape 2 : Implémentation**

`worker/validation.ts` :

```ts
export interface ErreurChamp {
  champ: string;
  message: string;
}

export interface DonneesContact {
  nom: string;
  email: string;
  societe: string;
  produit: string;
  message: string;
}

export type ResultatValidation = { ok: true; valeurs: DonneesContact } | { ok: false; erreurs: ErreurChamp[] };

const MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const texte = (brut: Record<string, string>, cle: string) => (brut[cle] ?? '').trim();

export function validerContact(brut: Record<string, string>, produitsConnus: string[]): ResultatValidation {
  if (texte(brut, 'site_web') !== '') {
    return { ok: false, erreurs: [{ champ: '', message: 'Envoi impossible.' }] };
  }
  const valeurs: DonneesContact = {
    nom: texte(brut, 'nom'),
    email: texte(brut, 'email'),
    societe: texte(brut, 'societe'),
    produit: texte(brut, 'produit'),
    message: texte(brut, 'message'),
  };
  const erreurs: ErreurChamp[] = [];
  if (valeurs.nom.length < 2 || valeurs.nom.length > 100) erreurs.push({ champ: 'nom', message: 'Le nom doit compter entre 2 et 100 caractères.' });
  if (!MOTIF_EMAIL.test(valeurs.email) || valeurs.email.length > 254) erreurs.push({ champ: 'email', message: 'L\'adresse email n\'est pas valide.' });
  if (valeurs.societe.length > 100) erreurs.push({ champ: 'societe', message: 'Le nom de société doit compter 100 caractères au plus.' });
  if (valeurs.produit !== '' && !produitsConnus.includes(valeurs.produit)) erreurs.push({ champ: 'produit', message: 'Le produit sélectionné est inconnu.' });
  if (valeurs.message.length < 10 || valeurs.message.length > 5000) erreurs.push({ champ: 'message', message: 'Le message doit compter entre 10 et 5000 caractères.' });
  if (texte(brut, 'consentement') !== 'oui') erreurs.push({ champ: 'consentement', message: 'Merci de cocher la case de consentement.' });
  return erreurs.length > 0 ? { ok: false, erreurs } : { ok: true, valeurs };
}
```

Run : `npm test` → PASS.

- [ ] **Étape 3 : Liste des produits**

`src/pages/api/produits.json.ts` :

```ts
import { produitsPublies } from '../../lib/catalogue';

export async function GET() {
  const produits = (await produitsPublies()).map((p) => p.id);
  return new Response(JSON.stringify({ produits }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}
```

Run : `npm run build && cat dist/api/produits.json && npm run check:worker`

Expected : `{"produits":["bocs","bankbridge","fec-analyzer","majtarifpq","linkcsvsage"]}` ; typage propre.

- [ ] **Étape 4 : Commit**

```bash
git add -A
git commit -m "feat(worker): validation des champs du formulaire et liste des produits en JSON

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3 : Turnstile, email et Brevo

**Files:**
- Create: `worker/turnstile.ts`, `worker/email.ts`, `worker/brevo.ts`, `tests/worker/turnstile.test.ts`, `tests/worker/email.test.ts`, `tests/worker/brevo.test.ts`

**Interfaces:**
- Produces:
  - `verifierTurnstile(jeton: string, secret: string, ip: string | null, fetchFn = fetch): Promise<boolean>`.
  - `construireEmail(valeurs: DonneesContact, nomsProduits: Record<string, string>): { sujet: string; texte: string; html: string }`.
  - `envoyerBrevo(options: { cle: string; de: string; a: string; repondreA: { email: string; nom: string }; sujet: string; texte: string; html: string }, fetchFn = fetch): Promise<{ ok: true } | { ok: false; statut: number }>`.

- [ ] **Étape 1 : Tests (échec attendu)**

`tests/worker/turnstile.test.ts` :

```ts
import { describe, expect, it, vi } from 'vitest';
import { verifierTurnstile } from '../../worker/turnstile';

const reponse = (corps: unknown, statut = 200) => new Response(JSON.stringify(corps), { status: statut });

describe('verifierTurnstile', () => {
  it('appelle siteverify avec le secret, le jeton et l\'adresse IP', async () => {
    const fetchFn = vi.fn(async () => reponse({ success: true }));
    const ok = await verifierTurnstile('jeton', 'secret', '203.0.113.1', fetchFn);
    expect(ok).toBe(true);
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init.method).toBe('POST');
    const corps = init.body as URLSearchParams;
    expect(corps.get('secret')).toBe('secret');
    expect(corps.get('response')).toBe('jeton');
    expect(corps.get('remoteip')).toBe('203.0.113.1');
  });

  it('refuse un jeton vide sans appel réseau', async () => {
    const fetchFn = vi.fn();
    expect(await verifierTurnstile('', 'secret', null, fetchFn)).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('refuse quand Cloudflare répond success false ou en erreur', async () => {
    expect(await verifierTurnstile('jeton', 'secret', null, vi.fn(async () => reponse({ success: false })))).toBe(false);
    expect(await verifierTurnstile('jeton', 'secret', null, vi.fn(async () => reponse({}, 500)))).toBe(false);
    expect(await verifierTurnstile('jeton', 'secret', null, vi.fn(async () => { throw new Error('réseau'); }))).toBe(false);
  });
});
```

`tests/worker/email.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { construireEmail } from '../../worker/email';

const valeurs = { nom: 'Nicolas Bresson', email: 'nicolas@exemple.fr', societe: 'Bresnik', produit: 'bankbridge', message: 'Bonjour,\nune démo ?\n<script>alert(1)</script>' };

describe('construireEmail', () => {
  it('compose un sujet avec le produit et le nom', () => {
    const email = construireEmail(valeurs, { bankbridge: 'BankBridge' });
    expect(email.sujet).toBe('[Contact] BankBridge — Nicolas Bresson');
  });

  it('compose un sujet sans produit', () => {
    const email = construireEmail({ ...valeurs, produit: '' }, {});
    expect(email.sujet).toBe('[Contact] Demande — Nicolas Bresson');
  });

  it('inclut toutes les informations dans le texte et échappe le HTML', () => {
    const email = construireEmail(valeurs, { bankbridge: 'BankBridge' });
    expect(email.texte).toContain('Nom : Nicolas Bresson');
    expect(email.texte).toContain('Email : nicolas@exemple.fr');
    expect(email.texte).toContain('Société : Bresnik');
    expect(email.texte).toContain('Produit : BankBridge');
    expect(email.texte).toContain('une démo ?');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('une démo ?<br>');
  });
});
```

`tests/worker/brevo.test.ts` :

```ts
import { describe, expect, it, vi } from 'vitest';
import { envoyerBrevo } from '../../worker/brevo';

const options = {
  cle: 'cle-test',
  de: 'site@exemple.fr',
  a: 'nicolas@exemple.fr',
  repondreA: { email: 'visiteur@exemple.fr', nom: 'Visiteur' },
  sujet: 'Sujet',
  texte: 'Texte',
  html: '<p>Texte</p>',
};

describe('envoyerBrevo', () => {
  it('poste sur l\'API Brevo avec la clé et les champs attendus', async () => {
    const fetchFn = vi.fn(async () => new Response('{"messageId":"1"}', { status: 201 }));
    expect(await envoyerBrevo(options, fetchFn)).toEqual({ ok: true });
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect((init.headers as Record<string, string>)['api-key']).toBe('cle-test');
    const corps = JSON.parse(init.body as string);
    expect(corps).toEqual({
      sender: { email: 'site@exemple.fr', name: 'Site Bresnik' },
      to: [{ email: 'nicolas@exemple.fr' }],
      replyTo: { email: 'visiteur@exemple.fr', name: 'Visiteur' },
      subject: 'Sujet',
      textContent: 'Texte',
      htmlContent: '<p>Texte</p>',
    });
  });

  it('renvoie le statut en cas d\'échec et ok false sur erreur réseau', async () => {
    expect(await envoyerBrevo(options, vi.fn(async () => new Response('{}', { status: 401 })))).toEqual({ ok: false, statut: 401 });
    expect(await envoyerBrevo(options, vi.fn(async () => { throw new Error('réseau'); }))).toEqual({ ok: false, statut: 0 });
  });
});
```

Run : `npm test` → FAIL, modules introuvables.

- [ ] **Étape 2 : Implémentations**

`worker/turnstile.ts` :

```ts
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
```

`worker/email.ts` :

```ts
import type { DonneesContact } from './validation';

export interface EmailContact {
  sujet: string;
  texte: string;
  html: string;
}

function echapper(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Email de notification envoyé à l'éditeur ; le visiteur est en réponse-à. */
export function construireEmail(valeurs: DonneesContact, nomsProduits: Record<string, string>): EmailContact {
  const produit = valeurs.produit ? (nomsProduits[valeurs.produit] ?? valeurs.produit) : '';
  const sujet = `[Contact] ${produit || 'Demande'} — ${valeurs.nom}`;
  const lignes = [
    ['Nom', valeurs.nom],
    ['Email', valeurs.email],
    ['Société', valeurs.societe || '—'],
    ['Produit', produit || '—'],
  ];
  const texte = [
    'Nouvelle demande depuis le formulaire de contact du site Bresnik.',
    '',
    ...lignes.map(([libelle, valeur]) => `${libelle} : ${valeur}`),
    '',
    'Message :',
    valeurs.message,
    '',
    'Répondez directement à cet email pour écrire au visiteur.',
  ].join('\n');
  const html = [
    '<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#faf8f4;color:#1c2331;font-family:Segoe UI,system-ui,sans-serif;font-size:16px;line-height:1.5">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2ddd2;border-radius:8px"><tr><td style="padding:28px">',
    '<p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#1f4fc7">Bresnik · Contact</p>',
    `<h1 style="margin:0 0 20px;font-size:22px">${echapper(sujet)}</h1>`,
    '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">',
    ...lignes.map(([libelle, valeur]) => `<tr><td style="padding:4px 16px 4px 0;color:#4f5868">${echapper(libelle)}</td><td style="padding:4px 0;font-weight:600">${echapper(valeur)}</td></tr>`),
    '</table>',
    `<p style="margin:20px 0 6px;color:#4f5868">Message</p><p style="margin:0;white-space:normal">${echapper(valeurs.message).replace(/\r?\n/g, '<br>')}</p>`,
    '<p style="margin:24px 0 0;font-size:13px;color:#4f5868">Répondez directement à cet email pour écrire au visiteur.</p>',
    '</td></tr></table></body></html>',
  ].join('');
  return { sujet, texte, html };
}
```

`worker/brevo.ts` :

```ts
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
```

Run : `npm test && npm run check:worker` → PASS, typage propre.

- [ ] **Étape 3 : Commit**

```bash
git add -A
git commit -m "feat(worker): vérification Turnstile, email de notification et envoi Brevo, testés

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4 : Traitement de la requête

**Files:**
- Modify: `worker/contact.ts` (remplace le stub)
- Create: `tests/worker/contact.test.ts`

**Interfaces:**
- Consumes: `validerContact`, `verifierTurnstile`, `construireEmail`, `envoyerBrevo`, `Env`.
- Produces: `traiterContact(request: Request, env: Env, deps?: { fetchFn?: typeof fetch; lireProduits?: () => Promise<{ ids: string[]; noms: Record<string, string> }> }): Promise<Response>` avec les réponses définies dans les contraintes globales ; `lireProduits` par défaut interroge `env.ASSETS` sur `/api/produits.json` et `/produits/` n'est pas nécessaire : les noms viennent d'un second point de terminaison ? Non : pour rester simple, `/api/produits.json` est enrichi en tâche 4 pour renvoyer `{ "produits": [{ "id": "bocs", "nom": "BOCS" }, …] }`, et la tâche 2 est ajustée en conséquence (voir étape 1).

- [ ] **Étape 1 : Enrichir la liste des produits**

Remplacer `src/pages/api/produits.json.ts` par :

```ts
import { produitsPublies } from '../../lib/catalogue';

export async function GET() {
  const produits = (await produitsPublies()).map((p) => ({ id: p.id, nom: p.data.nom }));
  return new Response(JSON.stringify({ produits }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}
```

- [ ] **Étape 2 : Tests (échec attendu)**

`tests/worker/contact.test.ts` :

```ts
import { describe, expect, it, vi } from 'vitest';
import { traiterContact } from '../../worker/contact';
import type { Env } from '../../worker/env';

const env = {
  ASSETS: { fetch: vi.fn() } as unknown as Fetcher,
  BREVO_API_KEY: 'cle',
  TURNSTILE_SECRET_KEY: 'secret',
  CONTACT_TO_EMAIL: 'nicolas@exemple.fr',
  CONTACT_FROM_EMAIL: 'site@exemple.fr',
} satisfies Env;

const champs = {
  nom: 'Nicolas Bresson',
  email: 'visiteur@exemple.fr',
  societe: '',
  produit: 'bocs',
  message: 'Je souhaite une démonstration de BOCS.',
  consentement: 'oui',
  site_web: '',
  'cf-turnstile-response': 'jeton',
};

const lireProduits = async () => ({ ids: ['bocs'], noms: { bocs: 'BOCS' } });

/** fetch simulé : Turnstile répond selon `turnstile`, Brevo selon `brevo`. */
const fetchSimule = (turnstile: boolean, brevo = 201) =>
  vi.fn(async (url: string | URL | Request) => {
    const adresse = String(url);
    if (adresse.includes('turnstile')) return new Response(JSON.stringify({ success: turnstile }));
    if (adresse.includes('brevo')) return new Response('{}', { status: brevo });
    throw new Error(`appel inattendu : ${adresse}`);
  });

const requeteJson = (corps: unknown, methode = 'POST') =>
  new Request('https://site.test/api/contact', {
    method: methode,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'CF-Connecting-IP': '203.0.113.1' },
    body: methode === 'POST' ? JSON.stringify(corps) : undefined,
  });

const requeteFormulaire = (corps: Record<string, string>) =>
  new Request('https://site.test/api/contact', { method: 'POST', body: new URLSearchParams(corps) });

describe('traiterContact', () => {
  it('refuse les méthodes autres que POST', async () => {
    const reponse = await traiterContact(requeteJson(null, 'GET'), env, { lireProduits });
    expect(reponse.status).toBe(405);
  });

  it('envoie l\'email et répond 200 en JSON', async () => {
    const fetchFn = fetchSimule(true);
    const reponse = await traiterContact(requeteJson(champs), env, { fetchFn, lireProduits });
    expect(reponse.status).toBe(200);
    expect(await reponse.json()).toEqual({ ok: true });
    const appelBrevo = fetchFn.mock.calls.find(([url]) => String(url).includes('brevo'));
    const corps = JSON.parse((appelBrevo?.[1] as RequestInit).body as string);
    expect(corps.to).toEqual([{ email: 'nicolas@exemple.fr' }]);
    expect(corps.replyTo).toEqual({ email: 'visiteur@exemple.fr', name: 'Nicolas Bresson' });
    expect(corps.subject).toBe('[Contact] BOCS — Nicolas Bresson');
  });

  it('répond 400 avec les erreurs de champ, sans appeler Turnstile ni Brevo', async () => {
    const fetchFn = fetchSimule(true);
    const reponse = await traiterContact(requeteJson({ ...champs, email: 'faux' }), env, { fetchFn, lireProduits });
    expect(reponse.status).toBe(400);
    expect(await reponse.json()).toEqual({ ok: false, erreurs: [{ champ: 'email', message: 'L\'adresse email n\'est pas valide.' }] });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('répond 403 quand Turnstile refuse, sans envoyer', async () => {
    const fetchFn = fetchSimule(false);
    const reponse = await traiterContact(requeteJson(champs), env, { fetchFn, lireProduits });
    expect(reponse.status).toBe(403);
    expect(fetchFn.mock.calls.some(([url]) => String(url).includes('brevo'))).toBe(false);
  });

  it('répond 502 quand Brevo échoue', async () => {
    const reponse = await traiterContact(requeteJson(champs), env, { fetchFn: fetchSimule(true, 401), lireProduits });
    expect(reponse.status).toBe(502);
    expect(await reponse.json()).toEqual({ ok: false, erreurs: [{ champ: '', message: 'L\'envoi a échoué. Réessayez dans quelques minutes.' }] });
  });

  it('redirige un envoi de formulaire classique vers la page de contact', async () => {
    const succes = await traiterContact(requeteFormulaire(champs), env, { fetchFn: fetchSimule(true), lireProduits });
    expect(succes.status).toBe(303);
    expect(succes.headers.get('Location')).toBe('https://site.test/contact/?etat=envoye');
    const echec = await traiterContact(requeteFormulaire({ ...champs, nom: 'N', consentement: '' }), env, { fetchFn: fetchSimule(true), lireProduits });
    expect(echec.status).toBe(303);
    expect(echec.headers.get('Location')).toBe('https://site.test/contact/?etat=erreur&champs=nom%2Cconsentement');
  });

  it('lit la liste des produits depuis les assets par défaut', async () => {
    const assets = { fetch: vi.fn(async () => new Response(JSON.stringify({ produits: [{ id: 'bocs', nom: 'BOCS' }] }))) };
    const reponse = await traiterContact(requeteJson(champs), { ...env, ASSETS: assets as unknown as Fetcher }, { fetchFn: fetchSimule(true) });
    expect(reponse.status).toBe(200);
    expect(String((assets.fetch.mock.calls[0] as [Request])[0].url)).toBe('https://site.test/api/produits.json');
  });
});
```

Run : `npm test` → FAIL (le stub renvoie 501).

- [ ] **Étape 3 : Implémentation**

Remplacer `worker/contact.ts` par :

```ts
import type { Env } from './env';
import { validerContact, type ErreurChamp } from './validation';
import { verifierTurnstile } from './turnstile';
import { construireEmail } from './email';
import { envoyerBrevo } from './brevo';

interface Produits {
  ids: string[];
  noms: Record<string, string>;
}

export interface DependancesContact {
  fetchFn?: typeof fetch;
  lireProduits?: () => Promise<Produits>;
}

const MESSAGE_TURNSTILE = 'La vérification anti-robot a échoué. Rechargez la page et réessayez.';
const MESSAGE_ENVOI = 'L\'envoi a échoué. Réessayez dans quelques minutes.';

async function lireCorps(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get('Content-Type') ?? '';
  if (type.includes('application/json')) {
    const json = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([cle, valeur]) => [cle, typeof valeur === 'string' ? valeur : '']));
  }
  const formulaire = await request.formData();
  return Object.fromEntries([...formulaire.entries()].map(([cle, valeur]) => [cle, typeof valeur === 'string' ? valeur : '']));
}

function attendJson(request: Request): boolean {
  return (request.headers.get('Accept') ?? '').includes('application/json');
}

function repondre(request: Request, statut: number, erreurs: ErreurChamp[]): Response {
  if (attendJson(request)) {
    return Response.json(statut === 200 ? { ok: true } : { ok: false, erreurs }, { status: statut });
  }
  const destination = new URL('/contact/', request.url);
  if (statut === 200) destination.searchParams.set('etat', 'envoye');
  else {
    destination.searchParams.set('etat', 'erreur');
    const champs = erreurs.map((e) => e.champ).filter(Boolean);
    if (champs.length > 0) destination.searchParams.set('champs', champs.join(','));
  }
  return Response.redirect(destination.toString(), 303);
}

async function produitsDepuisAssets(request: Request, env: Env): Promise<Produits> {
  const reponse = await env.ASSETS.fetch(new Request(new URL('/api/produits.json', request.url).toString()));
  const json = (await reponse.json()) as { produits: { id: string; nom: string }[] };
  return { ids: json.produits.map((p) => p.id), noms: Object.fromEntries(json.produits.map((p) => [p.id, p.nom])) };
}

export async function traiterContact(request: Request, env: Env, deps: DependancesContact = {}): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ ok: false, erreurs: [{ champ: '', message: 'Méthode non autorisée.' }] }, { status: 405, headers: { Allow: 'POST' } });
  }
  const fetchFn = deps.fetchFn ?? fetch;
  const lireProduits = deps.lireProduits ?? (() => produitsDepuisAssets(request, env));

  let brut: Record<string, string>;
  try {
    brut = await lireCorps(request);
  } catch {
    return repondre(request, 400, [{ champ: '', message: 'Requête illisible.' }]);
  }

  const produits = await lireProduits();
  const validation = validerContact(brut, produits.ids);
  if (!validation.ok) return repondre(request, 400, validation.erreurs);

  const ip = request.headers.get('CF-Connecting-IP');
  const humain = await verifierTurnstile(brut['cf-turnstile-response'] ?? '', env.TURNSTILE_SECRET_KEY, ip, fetchFn);
  if (!humain) return repondre(request, 403, [{ champ: 'cf-turnstile-response', message: MESSAGE_TURNSTILE }]);

  const email = construireEmail(validation.valeurs, produits.noms);
  const envoi = await envoyerBrevo(
    {
      cle: env.BREVO_API_KEY,
      de: env.CONTACT_FROM_EMAIL,
      a: env.CONTACT_TO_EMAIL,
      repondreA: { email: validation.valeurs.email, nom: validation.valeurs.nom },
      ...email,
    },
    fetchFn,
  );
  if (!envoi.ok) {
    console.error(`Envoi Brevo refusé (statut ${envoi.statut}).`);
    return repondre(request, 502, [{ champ: '', message: MESSAGE_ENVOI }]);
  }
  return repondre(request, 200, []);
}
```

Run : `npm test && npm run check:worker` → tous PASS, typage propre. Si `Fetcher` n'est pas reconnu dans le test (types Workers absents de la configuration Vitest), remplacer dans le test `as unknown as Fetcher` par `as unknown as Env['ASSETS']` ; le fichier `worker/env.ts` reste la seule référence à `Fetcher`.

- [ ] **Étape 4 : Vérification locale de bout en bout avec les clés de test**

Créer `.dev.vars` depuis l'exemple si absent (la clé Brevo peut rester factice ici : on teste jusqu'au 502). Run : `npm run build`, puis `npx wrangler dev --port 8788` dans un terminal et, dans un autre :

```bash
curl -s -w "\n%{http_code}\n" -X POST http://localhost:8788/api/contact -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"nom":"Test","email":"test@exemple.fr","message":"Message de test suffisamment long.","consentement":"oui","site_web":"","cf-turnstile-response":"jeton-de-test"}'
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -X POST http://localhost:8788/api/contact --data "nom=T&email=faux&message=court"
```

Expected : premier appel `502` avec le message d'échec d'envoi (Turnstile de test accepte, Brevo refuse la clé factice) ou `200` si une vraie clé est dans `.dev.vars` (un email arrive alors) ; second appel `303` vers `/contact/?etat=erreur&champs=nom,email,message,consentement`. Arrêter le serveur. Ne pas commiter `.dev.vars`.

- [ ] **Étape 5 : Commit**

```bash
git add -A
git commit -m "feat(worker): traitement complet de /api/contact avec réponses JSON et redirection

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5 : Page de contact activée

**Files:**
- Modify: `src/pages/contact.astro`, `src/content/pages/confidentialite.md`

**Interfaces:**
- Consumes: composants `Champ` (prop `erreur`), `Choix`, `GroupeChoix`, `Bouton` (`chargement`), `Alerte`, `ResumeErreurs` ; variable `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY` ; réponses du Worker (contraintes globales).
- Produces: formulaire fonctionnel avec et sans JavaScript.

- [ ] **Étape 1 : Page**

Remplacer `src/pages/contact.astro` par :

```astro
---
import Base from '../layouts/Base.astro';
import EnTetePage from '../components/EnTetePage.astro';
import Champ from '../components/Champ.astro';
import Choix from '../components/Choix.astro';
import GroupeChoix from '../components/GroupeChoix.astro';
import Bouton from '../components/Bouton.astro';
import Alerte from '../components/Alerte.astro';
import { produitsPublies } from '../lib/catalogue';

const produits = await produitsPublies();
const optionsProduits = [
  { valeur: '', libelle: 'Aucun produit en particulier' },
  ...produits.map((p) => ({ valeur: p.id, libelle: p.data.nom })),
];
const cleTurnstile = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '';
const libellesChamps: Record<string, string> = {
  nom: 'Nom',
  email: 'Email',
  societe: 'Société',
  produit: 'Produit concerné',
  message: 'Message',
  consentement: 'Consentement',
  'cf-turnstile-response': 'Vérification anti-robot',
};
---
<Base titre="Contact" description="Demandez une démonstration d'un produit Bresnik ou un échange sur votre projet Sage 100.">
  <EnTetePage eyebrow="Contact" titre="Parlons de votre projet Sage 100." sousTitre="Demandez une démonstration ou décrivez votre besoin. Réponse sous deux jours ouvrés." />
  <div class="conteneur pb-16 md:pb-20">
    <div class="flex max-w-[640px] flex-col gap-6">
      <div id="zone-etat" aria-live="polite" class="empty:hidden"></div>
      <noscript>
        <Alerte ton="information">Sans JavaScript, le formulaire fonctionne aussi : la page se recharge après l'envoi.</Alerte>
      </noscript>
      <form id="formulaire-contact" method="post" action="/api/contact" class="flex flex-col gap-5" novalidate>
        <Champ nom="nom" libelle="Nom" requis minlength="2" maxlength="100" autocomplete="name" />
        <Champ nom="email" libelle="Email" type="email" requis autocomplete="email" />
        <Champ nom="societe" libelle="Société" maxlength="100" autocomplete="organization" />
        <Champ nom="produit" libelle="Produit concerné" type="liste" options={optionsProduits} />
        <Champ nom="message" libelle="Message" type="zone" requis minlength="10" maxlength="5000" />
        <GroupeChoix id="groupe-consentement" legende="Consentement" requis>
          <Choix nom="consentement" valeur="oui" libelle="J'accepte que ces informations servent à répondre à ma demande. Elles ne sont ni stockées sur le site ni transmises à des tiers." requis />
        </GroupeChoix>
        <div class="hidden" aria-hidden="true">
          <label>Ne pas remplir <input name="site_web" type="text" tabindex="-1" autocomplete="off" /></label>
        </div>
        <div class="cf-turnstile" data-sitekey={cleTurnstile} data-language="fr" data-theme="light"></div>
        <div class="flex flex-col gap-3">
          <Bouton type="submit" id="bouton-envoyer" class="self-start max-md:w-full" fleche>Envoyer</Bouton>
          <p id="etat-formulaire" class="text-[14px] text-encre-2" role="status"></p>
        </div>
      </form>
    </div>
  </div>

  <script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

  <script define:vars={{ libellesChamps }}>
    const formulaire = document.getElementById('formulaire-contact');
    const zoneEtat = document.getElementById('zone-etat');
    const bouton = document.getElementById('bouton-envoyer');
    const etat = document.getElementById('etat-formulaire');
    const parametres = new URLSearchParams(window.location.search);

    const produitDemande = parametres.get('produit');
    const selecteur = document.querySelector('select[name="produit"]');
    if (produitDemande && selecteur) {
      const existe = Array.from(selecteur.options).some((o) => o.value === produitDemande);
      if (existe) selecteur.value = produitDemande;
    }

    const classesAlerte = {
      succes: 'border-succes bg-succes-teinte',
      erreur: 'border-erreur bg-erreur-teinte',
    };

    function afficherAlerte(ton, titre, lignes) {
      zoneEtat.replaceChildren();
      const carte = document.createElement('div');
      carte.setAttribute('role', ton === 'erreur' ? 'alert' : 'status');
      carte.tabIndex = -1;
      carte.className = `flex flex-col gap-1 rounded-carte border border-ligne border-l-4 bg-blanc px-4 py-3.5 text-[16px] leading-[1.5] text-encre ${classesAlerte[ton]}`;
      const entete = document.createElement('p');
      entete.className = 'font-semibold';
      entete.textContent = titre;
      carte.append(entete);
      if (lignes.length > 0) {
        const liste = document.createElement('ul');
        liste.className = 'flex flex-col gap-1';
        for (const { champ, message } of lignes) {
          const element = document.createElement('li');
          if (champ && champ !== 'cf-turnstile-response') {
            const lien = document.createElement('a');
            lien.href = `#champ-${champ}`;
            lien.className = 'underline underline-offset-[3px]';
            lien.textContent = `${libellesChamps[champ] ?? champ} : ${message}`;
            element.append(lien);
          } else {
            element.textContent = message;
          }
          liste.append(element);
        }
        carte.append(liste);
      }
      zoneEtat.append(carte);
      carte.focus();
    }

    function marquerErreurs(erreurs) {
      for (const controle of formulaire.querySelectorAll('[aria-invalid]')) controle.removeAttribute('aria-invalid');
      for (const message of formulaire.querySelectorAll('[data-erreur-champ]')) message.remove();
      for (const { champ, message } of erreurs) {
        const controle = formulaire.querySelector(`[name="${champ}"]`);
        if (!controle) continue;
        controle.setAttribute('aria-invalid', 'true');
        const texte = document.createElement('p');
        texte.setAttribute('data-erreur-champ', '');
        texte.className = 'text-[14px] font-semibold text-erreur';
        texte.textContent = message;
        (controle.closest('fieldset') ?? controle.closest('div'))?.append(texte);
      }
    }

    // Repli sans JavaScript : la page revient avec un état dans l'adresse.
    if (parametres.get('etat') === 'envoye') {
      afficherAlerte('succes', 'Message envoyé', [{ champ: '', message: 'Merci, votre demande est bien reçue. Réponse sous deux jours ouvrés.' }]);
      formulaire.hidden = true;
    } else if (parametres.get('etat') === 'erreur') {
      const champs = (parametres.get('champs') ?? '').split(',').filter(Boolean);
      afficherAlerte('erreur', 'Le message n\'a pas pu être envoyé', champs.length > 0
        ? champs.map((champ) => ({ champ, message: 'à corriger' }))
        : [{ champ: '', message: 'Réessayez dans quelques minutes.' }]);
    }

    formulaire.addEventListener('submit', async (evenement) => {
      evenement.preventDefault();
      const donnees = Object.fromEntries(new FormData(formulaire).entries());
      bouton.disabled = true;
      bouton.setAttribute('aria-busy', 'true');
      etat.textContent = 'Envoi en cours…';
      try {
        const reponse = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(donnees),
        });
        const resultat = await reponse.json();
        if (resultat.ok) {
          afficherAlerte('succes', 'Message envoyé', [{ champ: '', message: 'Merci, votre demande est bien reçue. Réponse sous deux jours ouvrés.' }]);
          formulaire.hidden = true;
          return;
        }
        marquerErreurs(resultat.erreurs ?? []);
        afficherAlerte('erreur', 'Le message n\'a pas pu être envoyé', resultat.erreurs ?? []);
        window.turnstile?.reset();
      } catch {
        afficherAlerte('erreur', 'Le message n\'a pas pu être envoyé', [{ champ: '', message: 'Vérifiez votre connexion et réessayez.' }]);
        window.turnstile?.reset();
      } finally {
        bouton.disabled = false;
        bouton.removeAttribute('aria-busy');
        etat.textContent = '';
      }
    });
  </script>
</Base>
```

- [ ] **Étape 2 : Politique de confidentialité**

Dans `src/content/pages/confidentialite.md`, remplacer le paragraphe de la section « Formulaire de contact » par :

```markdown
Les informations saisies dans le formulaire de contact (nom, email, société,
message) servent uniquement à répondre à votre demande, avec votre accord
exprimé par la case de consentement. Elles sont transmises par email à
l'éditeur du site via le service d'envoi Brevo (société française) et ne
sont ni stockées sur le site, ni transmises à des tiers à d'autres fins.
Le formulaire est protégé contre les robots par Cloudflare Turnstile, qui
analyse la requête sans cookie ni identifiant individuel.
```

- [ ] **Étape 3 : Vérifier**

Créer `.env` depuis `.env.example` si absent (clé de site de test). Run : `npm run check && npm run check:worker && npm test && npm run build && npm run verifier-liens && grep -c 'cf-turnstile' dist/contact/index.html && grep -c 'data-sitekey="1x00000000000000000000AA"' dist/contact/index.html && grep -c 'name="consentement"' dist/contact/index.html && grep -c 'disabled' dist/contact/index.html`

Expected : tout passe ; widget présent ; clé de test dans le HTML local (en production, la variable de build fournit la vraie clé) ; consentement présent ; `0` bouton désactivé.

Puis `npx wrangler dev --port 8788` et, dans un navigateur si disponible, ouvrir `http://localhost:8788/contact/`, envoyer le formulaire vide : les erreurs de champ s'affichent, le focus va sur l'alerte ; envoyer un formulaire complet : le widget de test valide, la réponse est `502` (clé Brevo factice) affichée en alerte d'erreur générique, ou succès avec une vraie clé dans `.dev.vars`. Sans navigateur, décrire ce qui a été vérifié par `curl` (page servie, formulaire sans `disabled`, script présent).

- [ ] **Étape 4 : Commit**

```bash
git add -A
git commit -m "feat(contact): formulaire actif avec consentement, Turnstile, envoi en fetch et repli natif

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6 : Documentation et backlog

**Files:**
- Modify: `docs/deploiement.md`, `README.md`, `docs/backlog-composants.md`, `docs/superpowers/specs/2026-09-02-bresnik-www-design.md`

- [ ] **Étape 1 : Déploiement**

Dans `docs/deploiement.md`, remplacer le paragraphe de la section « Variables et secrets d'exécution » par :

```markdown
Le formulaire de contact utilise, sur le Worker (**Settings → Variables and
Secrets**, type Secret) : `BREVO_API_KEY`, `TURNSTILE_SECRET_KEY`,
`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` ; et en variable de build
(**Settings → Builds → Build variables**) : `PUBLIC_TURNSTILE_SITE_KEY`.
`PUBLIC_CF_BEACON_TOKEN` reste facultatif pour la mesure d'audience.

En local : `.dev.vars` (copie de `.dev.vars.example`) pour `npm run cf:dev`,
`.env` (copie de `.env.example`) pour le build. Les clés de test Turnstile
valident toujours le widget. Quand `bresnik.fr` sera en ligne, ajouter ce
nom d'hôte au widget Turnstile dans le tableau de bord Cloudflare.
```

- [ ] **Étape 2 : README**

Dans `README.md`, section « Démarrer », ajouter après la ligne `npm run dev` :

```
    cp .env.example .env               # clé de site Turnstile (test)
    cp .dev.vars.example .dev.vars     # secrets du Worker en local
    npm run cf:dev                     # site + Worker sur http://localhost:8788
```

Et dans « Vérifier », après `npm run check` : `    npm run check:worker   # types du Worker`.

- [ ] **Étape 3 : Backlog et spécification**

Dans `docs/backlog-composants.md`, cocher la ligne « Gabarit d'email transactionnel » et remplacer sa note par « `worker/email.ts`, texte et HTML de la notification. ».

Dans la spécification structurelle, section 7 « Côté client », ajouter à la fin de la liste des champs : « case de consentement obligatoire (ajoutée le 2026-09-04) ». Dans « Côté serveur », point 4, remplacer « avec réponse automatique au visiteur » par « sans accusé de réception au visiteur pour l'instant (à ajouter quand `bresnik.fr` permettra un expéditeur au nom du domaine) ».

- [ ] **Étape 4 : Vérifier et commiter**

Run : `npm run build && npm run verifier-liens`

```bash
git add -A
git commit -m "docs(contact): variables, procédure locale, backlog et spécification

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Auto-revue du plan

**Couverture de la spécification §7.** Côté client : champs, produit pré-rempli, envoi en `fetch` et repli natif (T5). Côté serveur : `POST` seul, JSON ou formulaire (T4) ; validation avec bornes, produit connu, pot-de-miel (T2) ; Turnstile (T3, T4) ; email à Nicolas avec `reply-to` visiteur (T3, T4) ; réponses `200` et erreurs génériques, aucune donnée stockée (T4). Secrets nommés comme la spec §7, définis sur le Worker (T1 doc, T6). `wrangler dev` avec `.dev.vars` (T1).

**Placeholders.** Aucun « TBD ». Les valeurs de test Turnstile sont publiques et documentées par Cloudflare.

**Cohérence des noms.** `Env` (T1) utilisé en T4 ; `validerContact`, `ErreurChamp`, `DonneesContact` (T2) utilisés en T3 et T4 ; `verifierTurnstile`, `construireEmail`, `envoyerBrevo` (T3) utilisés en T4 ; format de `/api/produits.json` fixé en T4 étape 1 et consommé par `produitsDepuisAssets` ; noms de champs du formulaire (T5) identiques aux clés lues en T2 et T4 (`nom`, `email`, `societe`, `produit`, `message`, `consentement`, `site_web`, `cf-turnstile-response`) ; paramètres `etat` et `champs` produits en T4 et lus en T5.

**Écart assumé.** La spec §7 mentionnait une réponse automatique au visiteur ; elle est reportée à l'arrivée du domaine, la spécification est amendée en T6.
