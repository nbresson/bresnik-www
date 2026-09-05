import { describe, expect, it } from 'vitest';
import { capturesVedettes, vedettesIntrouvables } from '../../src/lib/vedettes';

const capture = (fichier: string) => ({ fichier });
const produits = [
  { id: 'bocs', nom: 'BOCS', href: '/produits/bocs/', captures: [capture('demarrer.png'), capture('audit.png')] },
  { id: 'sans-capture', nom: 'Sans capture', href: '/produits/sans-capture/', captures: [] },
  { id: 'bankbridge', nom: 'BankBridge', href: '/produits/bankbridge/', captures: [capture('tableau-de-bord.png'), capture('mouvements.png')], vedette: 'mouvements.png' },
  { id: 'fec', nom: 'FEC', href: '/produits/fec/', captures: [capture('accueil.png')], vedette: 'inexistant.png' },
];

describe('capturesVedettes', () => {
  it('retient la capture nommée par vedette, sinon la première, dans l\'ordre reçu', () => {
    const resultat = capturesVedettes(produits);
    expect(resultat.map((v) => [v.id, v.capture.fichier])).toEqual([
      ['bocs', 'demarrer.png'],
      ['bankbridge', 'mouvements.png'],
      ['fec', 'accueil.png'],
    ]);
  });

  it('ignore les produits sans capture et conserve nom et lien', () => {
    const resultat = capturesVedettes(produits);
    expect(resultat[1]).toEqual({ id: 'bankbridge', nom: 'BankBridge', href: '/produits/bankbridge/', capture: { fichier: 'mouvements.png' } });
  });

  it('renvoie une liste vide sans aucune capture', () => {
    expect(capturesVedettes([{ id: 'x', nom: 'X', href: '/x/', captures: [] }])).toEqual([]);
  });
});

describe('vedettesIntrouvables', () => {
  it('signale seulement les vedettes nommées qui ne correspondent à aucune capture', () => {
    expect(vedettesIntrouvables(produits)).toEqual(['fec : vedette « inexistant.png » introuvable dans ses captures']);
  });
});
