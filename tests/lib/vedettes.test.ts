import { describe, expect, it } from 'vitest';
import { capturesVedettes } from '../../src/lib/vedettes';

const produits = [
  { id: 'bocs', nom: 'BOCS', href: '/produits/bocs/', captures: ['demarrer.png', 'audit.png'] },
  { id: 'sans-capture', nom: 'Sans capture', href: '/produits/sans-capture/', captures: [] },
  { id: 'bankbridge', nom: 'BankBridge', href: '/produits/bankbridge/', captures: ['tableau-de-bord.png'] },
];

describe('capturesVedettes', () => {
  it('retient la première capture de chaque produit, dans l\'ordre reçu', () => {
    const resultat = capturesVedettes(produits);
    expect(resultat.map((v) => [v.id, v.capture])).toEqual([
      ['bocs', 'demarrer.png'],
      ['bankbridge', 'tableau-de-bord.png'],
    ]);
  });

  it('ignore les produits sans capture et conserve nom et lien', () => {
    const resultat = capturesVedettes(produits);
    expect(resultat).toHaveLength(2);
    expect(resultat[1]).toEqual({ id: 'bankbridge', nom: 'BankBridge', href: '/produits/bankbridge/', capture: 'tableau-de-bord.png' });
  });

  it('renvoie une liste vide sans aucune capture', () => {
    expect(capturesVedettes([{ id: 'x', nom: 'X', href: '/x/', captures: [] }])).toEqual([]);
  });
});
