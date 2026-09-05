import { describe, expect, it } from 'vitest';
import { article, descriptionHorsBornes, filAriane, logicielApplication, organisation, siteWeb, titreTropLong } from '../../src/lib/seo';

const site = new URL('https://bresnik.fr');

describe('organisation et site', () => {
  it('décrit Bresnik avec son fondateur et des URL absolues', () => {
    const o = organisation(site);
    expect(o['@type']).toBe('Organization');
    expect(o.url).toBe('https://bresnik.fr/');
    expect(o.logo).toBe('https://bresnik.fr/apple-touch-icon.png');
    expect((o.founder as { name: string; worksFor: { '@id': string } }).name).toBe('Nicolas Bresson');
    expect((o.founder as { worksFor: { '@id': string } }).worksFor['@id']).toBe('https://bresnik.fr/#organisation');
    expect(siteWeb(site)).toMatchObject({ '@type': 'WebSite', name: 'Bresnik', inLanguage: 'fr' });
  });
});

describe('logicielApplication', () => {
  it('produit une application Windows éditée par Bresnik, image absolue quand elle existe', () => {
    const l = logicielApplication({ nom: 'BankBridge', description: 'Intégration bancaire.', chemin: '/produits/bankbridge/', image: '/_astro/logo.png' }, site);
    expect(l).toMatchObject({
      '@type': 'SoftwareApplication',
      name: 'BankBridge',
      url: 'https://bresnik.fr/produits/bankbridge/',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Windows',
      image: 'https://bresnik.fr/_astro/logo.png',
    });
    expect(l).not.toHaveProperty('offers');
    expect(logicielApplication({ nom: 'X', description: 'x', chemin: '/x/' }, site)).not.toHaveProperty('image');
  });
});

describe('filAriane', () => {
  it('numérote les éléments et donne à la page courante son propre chemin', () => {
    const f = filAriane([{ libelle: 'Accueil', href: '/' }, { libelle: 'Produits', href: '/produits/' }, { libelle: 'BOCS' }], site, '/produits/bocs/');
    expect(f.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://bresnik.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Produits', item: 'https://bresnik.fr/produits/' },
      { '@type': 'ListItem', position: 3, name: 'BOCS', item: 'https://bresnik.fr/produits/bocs/' },
    ]);
  });
});

describe('article', () => {
  it('reprend la date de publication comme date de modification par défaut et signe Nicolas Bresson', () => {
    const a = article({ titre: 'T', description: 'D', chemin: '/blog/t/', datePublication: new Date('2026-09-01T00:00:00Z') }, site);
    expect(a.datePublished).toBe('2026-09-01T00:00:00.000Z');
    expect(a.dateModified).toBe('2026-09-01T00:00:00.000Z');
    expect((a.author as { name: string }).name).toBe('Nicolas Bresson');
    const b = article({ titre: 'T', description: 'D', chemin: '/blog/t/', datePublication: new Date('2026-09-01T00:00:00Z'), dateModification: new Date('2026-09-03T00:00:00Z') }, site);
    expect(b.dateModified).toBe('2026-09-03T00:00:00.000Z');
  });
});

describe('bornes de longueur', () => {
  it('signale un titre de plus de 60 caractères et une description hors 100 à 160', () => {
    expect(titreTropLong('a'.repeat(60))).toBe(false);
    expect(titreTropLong('a'.repeat(61))).toBe(true);
    expect(descriptionHorsBornes('a'.repeat(99))).toBe(true);
    expect(descriptionHorsBornes('a'.repeat(100))).toBe(false);
    expect(descriptionHorsBornes('a'.repeat(160))).toBe(false);
    expect(descriptionHorsBornes('a'.repeat(161))).toBe(true);
  });
});
