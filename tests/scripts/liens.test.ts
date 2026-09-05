import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { ancreDe, cheminsCandidats, estInterne, extraireLiens, possedeAncre, verifierDist } from '../../scripts/liens.mjs';

describe('extraireLiens', () => {
  it('extrait les href et src, sans doublon', () => {
    const html = '<a href="/produits/">x</a><img src="/og.png"><a href="/produits/">y</a><link href="/rss.xml">';
    expect(extraireLiens(html)).toEqual(['/produits/', '/og.png', '/rss.xml']);
  });
});

describe('estInterne', () => {
  it('ne garde que les chemins absolus du site', () => {
    expect(estInterne('/blog/')).toBe(true);
    expect(estInterne('https://exemple.fr/')).toBe(false);
    expect(estInterne('//cdn.exemple.fr/x.js')).toBe(false);
    expect(estInterne('mailto:contact@exemple.fr')).toBe(false);
    expect(estInterne('#contenu')).toBe(false);
    expect(estInterne('/api/contact')).toBe(false);
  });
});

describe('cheminsCandidats', () => {
  it('résout un dossier vers son index', () => {
    expect(cheminsCandidats('/produits/')).toEqual(['produits/index.html']);
  });

  it('résout un fichier directement, en ignorant requête et ancre', () => {
    expect(cheminsCandidats('/contact/?produit=bocs#formulaire')).toEqual(['contact/index.html']);
    expect(cheminsCandidats('/rss.xml')).toEqual(['rss.xml']);
  });

  it('accepte une page sans barre finale sous ses deux formes', () => {
    expect(cheminsCandidats('/produits')).toEqual(['produits', 'produits/index.html', 'produits.html']);
  });

  it('décode les URL avant de résoudre le chemin', () => {
    expect(cheminsCandidats('/blog/tags/%C3%A9critures/')).toEqual(['blog/tags/écritures/index.html']);
  });

  it('se rabat sur la chaîne non décodée si le décodage échoue', () => {
    expect(cheminsCandidats('/x/%E0%A4%A')).toEqual(['x/%E0%A4%A', 'x/%E0%A4%A/index.html', 'x/%E0%A4%A.html']);
  });
});

describe('verifierDist', () => {
  let dossier: string;

  afterAll(async () => {
    if (dossier) await rm(dossier, { recursive: true, force: true });
  });

  it('détecte les liens internes cassés, y compris un dossier sans index', async () => {
    dossier = await mkdtemp(join(tmpdir(), 'liens-'));
    await writeFile(
      join(dossier, 'index.html'),
      '<a href="/ok/">a</a><a href="/casse/">b</a><a href="/dossier-vide">c</a><img src="/image.png">',
    );
    await mkdir(join(dossier, 'ok'));
    await writeFile(join(dossier, 'ok', 'index.html'), 'ok');
    await mkdir(join(dossier, 'dossier-vide'));
    await writeFile(join(dossier, 'image.png'), Buffer.from([0]));

    expect(await verifierDist(dossier)).toEqual([
      { fichier: 'index.html', lien: '/casse/' },
      { fichier: 'index.html', lien: '/dossier-vide' },
    ]);
  });
});

describe('ancres', () => {
  it('extrait l\'ancre d\'un lien et la cherche comme identifiant', () => {
    expect(ancreDe('/contact/#formulaire')).toBe('formulaire');
    expect(ancreDe('#contenu')).toBe('contenu');
    expect(ancreDe('/produits/')).toBeNull();
    expect(ancreDe('/x/#')).toBeNull();
    expect(possedeAncre('<main id="contenu">', 'contenu')).toBe(true);
    expect(possedeAncre('<main data-id="contenu">', 'contenu')).toBe(false);
  });

  it('signale une ancre absente dans la page ou dans la page cible', async () => {
    const dossier = await mkdtemp(join(tmpdir(), 'ancres-'));
    try {
      await mkdir(join(dossier, 'contact'));
      await writeFile(join(dossier, 'index.html'), '<a href="#haut">x</a><a href="#absente">y</a><a href="/contact/#formulaire">z</a><a href="/contact/#nulle-part">w</a><div id="haut"></div>');
      await writeFile(join(dossier, 'contact', 'index.html'), '<form id="formulaire"></form>');
      const casses = await verifierDist(dossier);
      expect(casses.map((c) => c.lien).sort()).toEqual(['#absente', '/contact/#nulle-part']);
    } finally {
      await rm(dossier, { recursive: true, force: true });
    }
  });
});
