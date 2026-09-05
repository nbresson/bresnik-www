// Usage : npm run build && npm run verifier-csp
import { join } from 'node:path';
import { verifierDossier } from './csp.mjs';

const { lignes, total } = verifierDossier(join(process.cwd(), 'dist'));
for (const ligne of lignes) console.log(ligne);
process.exit(total === 0 ? 0 : 1);
