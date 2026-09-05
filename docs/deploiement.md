# Déploiement du site vitrine

## Production : Cloudflare Workers Builds

Le site est un Worker Cloudflare nommé `bresnik-www` qui sert le dossier
`dist/` en assets statiques. Le déploiement est automatique depuis GitHub.

### Connexion initiale (une seule fois, dans le tableau de bord Cloudflare)

1. Ouvrir https://dash.cloudflare.com → **Workers & Pages** → **Create** →
   **Import a repository**.
2. Autoriser Cloudflare à accéder au compte GitHub, puis choisir le dépôt
   `bresnik-www`.
3. Renseigner :
   - **Worker name** : `bresnik-www` (doit être identique au champ `name`
     de `wrangler.jsonc`, sinon le build échoue) ;
   - **Production branch** : `main` ;
   - **Build command** : `npm run build` ;
   - **Deploy command** : `npx wrangler deploy` (valeur par défaut) ;
   - **Non-production branch deploy command** : `npx wrangler versions upload`
     (valeur par défaut) ;
   - **Root directory** : laisser vide.
4. **Save and Deploy**. Le premier build dure une à deux minutes.
5. Noter l'URL affichée, de la forme
   `https://bresnik-www.<sous-domaine>.workers.dev`, et la reporter dans
   `site` de `astro.config.mjs`.

L'image de build Cloudflare lit la version de Node dans `.nvmrc` (24). Si ce
n'est pas le cas, ajouter une variable de build `NODE_VERSION=24` dans
**Settings → Builds → Build variables**.

### Fonctionnement au quotidien

- Push sur `main` → build → déploiement en production.
- Push sur une autre branche → build → version de prévisualisation avec une
  URL `<version>-bresnik-www.<sous-domaine>.workers.dev`, visible dans
  **Deployments**.
- Les logs de build sont dans **Settings → Builds** et **Deployments**.
- Aucun hôte `*.workers.dev` n'est indexable : le Worker ajoute
  `X-Robots-Tag: noindex, nofollow` à toutes ses réponses sur ces hôtes
  (`worker/indexation.ts`). Le robots.txt reste ouvert, sinon les moteurs ne
  pourraient pas lire la directive. Le domaine public sera indexable sans
  rien changer.

### Variables et secrets d'exécution

Le formulaire de contact utilise, sur le Worker (**Settings → Variables and
Secrets**, type Secret) : `BREVO_API_KEY`, `TURNSTILE_SECRET_KEY`,
`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` ; et en variable de build
(**Settings → Builds → Build variables**) : `PUBLIC_TURNSTILE_SITE_KEY`.
`PUBLIC_CF_BEACON_TOKEN` reste facultatif pour la mesure d'audience.
Les builds de prévisualisation (branches autres que `main`) n'ont pas accès aux
variables de build de production : la page de contact y utilise
automatiquement la clé de site Turnstile de test, et le widget n'y fonctionne
pas. Le formulaire se teste sur le site principal après fusion.

En local : `.dev.vars` (copie de `.dev.vars.example`) pour `npm run cf:dev`,
`.env` (copie de `.env.example`) pour le build. Les clés de test Turnstile
valident toujours le widget. Quand `bresnik.fr` sera en ligne, ajouter ce
nom d'hôte au widget Turnstile dans le tableau de bord Cloudflare.

Limitation de débit : aucune dans le code, Turnstile suffit au lancement. Si
nécessaire, ajouter depuis le tableau de bord une règle WAF de limitation sur
`POST /api/contact` (par exemple 5 requêtes par minute et par adresse), sans
changement de code.

## Mesure d'audience

1. **Web Analytics** → **Add a site** → saisir le nom d'hôte du site.
2. Dans **Manage site**, copier le jeton du script (`token`).
3. L'ajouter en variable de build `PUBLIC_CF_BEACON_TOKEN` dans Workers
   Builds, puis relancer un déploiement. Le layout n'insère le script que si
   cette variable existe.

## Quand le domaine bresnik.fr sera acheté

1. Ajouter le domaine à Cloudflare (DNS chez Cloudflare) et faire pointer les
   serveurs de noms du registrar vers ceux fournis par Cloudflare.
2. Dans le Worker `bresnik-www` : **Settings → Domains & Routes → Add →
   Custom domain** : `bresnik.fr`, puis `www.bresnik.fr`.
3. Créer une règle de redirection `www.bresnik.fr/*` → `https://bresnik.fr/$1`
   (301) dans **Rules → Redirect Rules**.
4. Remplacer `site` dans `astro.config.mjs` par `https://bresnik.fr`,
   commiter, pousser.
5. Compléter les mentions légales (SIRET, forme juridique, adresse) avant
   cette bascule.
6. Vérifier avec `curl -I https://bresnik.fr/` que l'en-tête `X-Robots-Tag`
   est absent, et qu'il est toujours présent sur l'URL workers.dev.

## Déploiement manuel de secours

    npm run build
    npx wrangler login
    npm run deploy

## Qualité avant fusion

- `npm run check`, `npm test`, `npm run build` puis `npm run verifier-liens`
  (exécuté aussi par le CI) : aucun lien interne cassé.
- Lighthouse, manuel : `npm run build && npx astro preview`, puis
  `npx lighthouse http://localhost:4321/ --preset=desktop` sur l'accueil, une
  fiche produit et un article de blog (ou la page conseil tant qu'aucun
  article n'est publié). Objectif : 95 ou plus dans les quatre catégories.
- Lighthouse se joue dans les deux thèmes. Le site suit le thème du système
  par défaut (aucun `localStorage.setItem('bresnik-theme', …)` mémorisé) :
  c'est donc la préférence système émulée par Chrome/Edge qui détermine le
  rendu, pas l'audit lui-même. Forcer explicitement chaque rendu avec le
  drapeau vérifié `--chrome-flags="--blink-settings=preferredColorScheme=1"`
  (clair) ou `=0` (sombre) — ne pas se fier au thème du système de la machine
  qui lance l'audit, qui peut être sombre et fausser un audit « clair » sans
  drapeau explicite.
- Après un changement de charte (couleurs, polices), relancer
  `npm run generer-images` et commiter les fichiers de `public/`.
- Les polices sont téléchargées depuis le CDN Fontsource au moment du build
  (API Fonts d'Astro). Une indisponibilité du CDN fait échouer le build :
  relancer le déploiement plus tard. Le CI met ce cache en mémoire ; Workers
  Builds retélécharge à chaque build.
