# bresnik-www

Site vitrine de la marque Bresnik (Astro, statique, Cloudflare Workers).

## Démarrer

    npm install
    npm run dev        # http://localhost:4321

## Vérifier

    npm run check      # types et schémas de contenu
    npm test           # tests unitaires
    npm run build      # génère dist/
    npm run verifier-liens   # liens internes de dist/ (après build)
    npm run generer-images   # favicon et image de partage (après un changement de charte)

## Déployer

Voir docs/deploiement.md. Le déploiement en production est automatique à
chaque push sur main (Cloudflare Workers Builds).

## Documentation

- Spécification : docs/superpowers/specs/
- Plans d'implémentation : docs/superpowers/plans/
