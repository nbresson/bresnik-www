# bresnik-www

Site vitrine de la marque Bresnik (Astro, statique, Cloudflare Workers).

## Démarrer

    npm install
    npm run dev        # http://localhost:4321
    cp .env.example .env               # clé de site Turnstile (test)
    cp .dev.vars.example .dev.vars     # secrets du Worker en local
    npm run cf:dev                     # site + Worker sur http://localhost:8788

## Vérifier

    npm run check      # types et schémas de contenu
    npm run check:worker   # types du Worker
    npm test           # tests unitaires
    npm run build      # génère dist/
    npm run verifier-liens   # liens internes de dist/ (après build)
    npm run generer-images   # favicon et images de partage : défaut, une par produit, une par article (après un changement de charte, de produit ou d'article)

## Charte vivante

La page `/charte/` (non indexée, hors sitemap, jamais liée depuis la
navigation) montre chaque composant avec des données d'exemple. Tout nouveau
composant doit y être ajouté.

Le thème sombre suit le système ; le sélecteur de l'en-tête force clair,
sombre ou système.

## Déployer

Voir docs/deploiement.md. Le déploiement en production est automatique à
chaque push sur main (Cloudflare Workers Builds).

## Documentation

- Spécification : docs/superpowers/specs/
- Plans d'implémentation : docs/superpowers/plans/
