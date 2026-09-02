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
