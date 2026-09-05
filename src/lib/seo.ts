/**
 * Données structurées (JSON-LD, vocabulaire schema.org) et règles de
 * référencement. Fonctions pures : elles reçoivent des URL absolues ou une
 * base `site` et renvoient des objets prêts à sérialiser.
 */

export const NOM_ORGANISATION = 'Bresnik';
export const NOM_PERSONNE = 'Nicolas Bresson';
export const FONCTION_PERSONNE = 'Consultant Sage 100, éditeur de logiciels';

type Jsonld = Record<string, unknown>;

const absolue = (chemin: string, site: URL): string => new URL(chemin, site).href;

/** Organisation et fondateur, pour l'accueil. */
export function organisation(site: URL): Jsonld {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absolue('/#organisation', site),
    name: NOM_ORGANISATION,
    url: site.href,
    logo: absolue('/apple-touch-icon.png', site),
    founder: personne(site),
    description: "Logiciels complémentaires pour l'écosystème Sage 100 et conseil Sage, par un consultant indépendant.",
  };
}

/** Nicolas Bresson, rattaché à l'organisation. */
export function personne(site: URL): Jsonld {
  return {
    '@type': 'Person',
    '@id': absolue('/#personne', site),
    name: NOM_PERSONNE,
    jobTitle: FONCTION_PERSONNE,
    worksFor: { '@id': absolue('/#organisation', site) },
  };
}

/** Site web avec son nom, pour l'accueil. */
export function siteWeb(site: URL): Jsonld {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: NOM_ORGANISATION,
    url: site.href,
    inLanguage: 'fr',
    publisher: { '@id': absolue('/#organisation', site) },
  };
}

export interface LogicielProps {
  nom: string;
  description: string;
  chemin: string;
  image?: string;
  categorie?: string;
}

/** Fiche produit : application métier pour Windows, éditée par Bresnik. Sans prix tant qu'il n'est pas public. */
export function logicielApplication({ nom, description, chemin, image, categorie = 'BusinessApplication' }: LogicielProps, site: URL): Jsonld {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: nom,
    description,
    url: absolue(chemin, site),
    applicationCategory: categorie,
    operatingSystem: 'Windows',
    inLanguage: 'fr',
    ...(image ? { image: absolue(image, site) } : {}),
    author: { '@id': absolue('/#organisation', site) },
    publisher: { '@id': absolue('/#organisation', site) },
  };
}

export interface ElementFilAriane {
  libelle: string;
  href?: string;
}

/** Fil d'Ariane : chaque élément prend sa position ; le dernier peut ne pas avoir de lien (page courante). */
export function filAriane(elements: ElementFilAriane[], site: URL, cheminCourant: string): Jsonld {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: elements.map((element, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: element.libelle,
      item: absolue(element.href ?? cheminCourant, site),
    })),
  };
}

export interface ArticleProps {
  titre: string;
  description: string;
  chemin: string;
  datePublication: Date;
  dateModification?: Date;
  image?: string;
}

/** Article de blog signé par Nicolas Bresson. */
export function article({ titre, description, chemin, datePublication, dateModification, image }: ArticleProps, site: URL): Jsonld {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: titre,
    description,
    url: absolue(chemin, site),
    mainEntityOfPage: absolue(chemin, site),
    datePublished: datePublication.toISOString(),
    dateModified: (dateModification ?? datePublication).toISOString(),
    inLanguage: 'fr',
    ...(image ? { image: absolue(image, site) } : {}),
    author: personne(site),
    publisher: { '@id': absolue('/#organisation', site) },
  };
}

/** Longueurs conseillées pour les moteurs de recherche. */
export const LONGUEUR_TITRE_MAX = 60;
export const LONGUEUR_DESCRIPTION = { min: 100, max: 160 };

export function titreTropLong(titre: string): boolean {
  return titre.length > LONGUEUR_TITRE_MAX;
}

export function descriptionHorsBornes(description: string): boolean {
  return description.length < LONGUEUR_DESCRIPTION.min || description.length > LONGUEUR_DESCRIPTION.max;
}
