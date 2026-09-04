export type Disponibilite = 'contact' | 'telechargement' | 'essai';

export interface ActionProduit {
  libelle: string;
  href: string | null;
  actif: boolean;
  mention: string | null;
}

const MENTION_A_VENIR = 'Bientôt disponible';

export function actionProduit(disponibilite: Disponibilite, slug: string): ActionProduit {
  switch (disponibilite) {
    case 'contact':
      return {
        libelle: 'Demander une démo',
        href: `/contact/?produit=${encodeURIComponent(slug)}`,
        actif: true,
        mention: null,
      };
    case 'telechargement':
      return { libelle: 'Télécharger', href: null, actif: false, mention: MENTION_A_VENIR };
    case 'essai':
      return { libelle: 'Essayer gratuitement', href: null, actif: false, mention: MENTION_A_VENIR };
  }
}

export type Cible = 'consultant' | 'entreprise';

export function libelleCible(cible: Cible): string {
  return cible === 'consultant' ? 'Consultants Sage' : 'Entreprises';
}

export function tonCible(cible: Cible): 'cobalt' | 'ambre' {
  return cible === 'consultant' ? 'ambre' : 'cobalt';
}

export function libelleAcces(disponibilite: Disponibilite): string {
  switch (disponibilite) {
    case 'contact':
      return 'Sur démonstration';
    case 'telechargement':
      return 'Téléchargement';
    case 'essai':
      return 'Essai gratuit';
  }
}

export function produitsMemeFamille<T extends { id: string; data: { cible: string; ordre: number } }>(
  produits: T[],
  courant: T,
  max = 3,
): T[] {
  return produits
    .filter((p) => p.id !== courant.id && p.data.cible === courant.data.cible)
    .sort((a, b) => a.data.ordre - b.data.ordre)
    .slice(0, max);
}
