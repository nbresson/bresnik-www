// Échoue si une page de dist/ pointe vers une cible interne absente.
import { fileURLToPath } from 'node:url';
import { verifierDist } from './liens.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const casses = await verifierDist(dist);

if (casses.length > 0) {
  console.error(`${casses.length} lien(s) interne(s) cassé(s) :`);
  for (const { fichier, lien } of casses) console.error(`  ${fichier} → ${lien}`);
  process.exit(1);
}
console.log('Liens internes : aucun lien cassé.');
