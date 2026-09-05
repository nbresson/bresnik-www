// Usage : npm run build && npm run verifier-seo
import { join } from 'node:path';
import { verifierDossier } from './seo.mjs';

const { lignes, total } = verifierDossier(join(process.cwd(), 'dist'));
for (const ligne of lignes) console.log(ligne);
process.exit(total === 0 ? 0 : 1);
