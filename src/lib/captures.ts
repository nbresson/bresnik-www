/**
 * Captures d'écran des produits : tout fichier image placé dans
 * `src/content/produits/captures/<slug>/` appartient au produit `<slug>`.
 * Les descriptions facultatives du frontmatter (`captures`) fixent l'ordre,
 * le titre et le texte alternatif ; les autres captures suivent par nom de
 * fichier avec un titre déduit du nom.
 */

export interface DescriptionCapture {
  fichier: string;
  alt: string;
  titre?: string;
}

export interface CaptureDecrite {
  fichier: string;
  titre: string;
  alt: string;
}

const collation = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });

/** « tableau-de-bord.png » → « Tableau de bord » ; un préfixe numérique d'ordre est ignoré. */
export function titreDepuisFichier(fichier: string): string {
  const base = fichier.replace(/\.[^.]+$/, '').replace(/^\d+[-_]?/, '');
  const mots = base.split(/[-_]+/).filter(Boolean).join(' ');
  return mots.charAt(0).toUpperCase() + mots.slice(1);
}

export function fusionnerCaptures(fichiers: string[], descriptions: DescriptionCapture[], nomProduit: string): CaptureDecrite[] {
  const existants = new Set(fichiers);
  const decrites = descriptions
    .filter((d) => existants.has(d.fichier))
    .map((d) => ({ fichier: d.fichier, titre: d.titre ?? titreDepuisFichier(d.fichier), alt: d.alt }));
  const dejaVus = new Set(decrites.map((d) => d.fichier));
  const restants = fichiers
    .filter((f) => !dejaVus.has(f))
    .sort((a, b) => collation.compare(a, b))
    .map((fichier) => {
      const titre = titreDepuisFichier(fichier);
      return { fichier, titre, alt: `Capture d'écran de ${nomProduit} : ${titre.toLowerCase()}` };
    });
  return [...decrites, ...restants];
}
