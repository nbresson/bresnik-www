import { describe, expect, it } from 'vitest';
import { validerContact } from '../../worker/validation';

const produits = ['bocs', 'bankbridge'];
const valide = {
  nom: 'Nicolas Bresson',
  email: 'nicolas@exemple.fr',
  societe: 'Bresnik',
  produit: 'bankbridge',
  message: 'Je souhaite une démonstration de BankBridge.',
  consentement: 'oui',
  site_web: '',
};

describe('validerContact', () => {
  it('accepte une demande complète et normalise les espaces', () => {
    const resultat = validerContact({ ...valide, nom: '  Nicolas Bresson  ' }, produits);
    expect(resultat).toEqual({ ok: true, valeurs: { nom: 'Nicolas Bresson', email: 'nicolas@exemple.fr', societe: 'Bresnik', produit: 'bankbridge', message: valide.message } });
  });

  it('accepte une demande sans société ni produit', () => {
    const resultat = validerContact({ ...valide, societe: '', produit: '' }, produits);
    expect(resultat.ok).toBe(true);
  });

  it('refuse un nom trop court, un email invalide, un message trop court', () => {
    const resultat = validerContact({ ...valide, nom: 'N', email: 'nicolas@', message: 'Bonjour' }, produits);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) expect(resultat.erreurs.map((e) => e.champ)).toEqual(['nom', 'email', 'message']);
  });

  it('refuse un produit inconnu et un message trop long', () => {
    const resultat = validerContact({ ...valide, produit: 'inconnu', message: 'a'.repeat(5001) }, produits);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) expect(resultat.erreurs.map((e) => e.champ)).toEqual(['produit', 'message']);
  });

  it('exige le consentement', () => {
    const resultat = validerContact({ ...valide, consentement: '' }, produits);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) expect(resultat.erreurs).toEqual([{ champ: 'consentement', message: 'Merci de cocher la case de consentement.' }]);
  });

  it('refuse silencieusement un pot-de-miel rempli, sous forme d\'erreur générique', () => {
    const resultat = validerContact({ ...valide, site_web: 'http://spam.example' }, produits);
    expect(resultat).toEqual({ ok: false, erreurs: [{ champ: '', message: 'Envoi impossible.' }] });
  });

  it('refuse un nom contenant des caractères de contrôle', () => {
    const resultat = validerContact({ ...valide, nom: 'Nicolas\r\nBresson' }, produits);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) expect(resultat.erreurs).toContainEqual({ champ: 'nom', message: 'Le nom contient des caractères non autorisés.' });
  });

  it('tolère des champs absents', () => {
    const resultat = validerContact({}, produits);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) expect(resultat.erreurs.map((e) => e.champ)).toEqual(['nom', 'email', 'message', 'consentement']);
  });
});
