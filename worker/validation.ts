export interface ErreurChamp {
  champ: string;
  message: string;
}

export interface DonneesContact {
  nom: string;
  email: string;
  societe: string;
  produit: string;
  message: string;
}

export type ResultatValidation = { ok: true; valeurs: DonneesContact } | { ok: false; erreurs: ErreurChamp[] };

const MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOTIF_CONTROLE = /[\x00-\x1f\x7f]/;

const texte = (brut: Record<string, string>, cle: string) => (brut[cle] ?? '').trim();

export function validerContact(brut: Record<string, string>, produitsConnus: string[]): ResultatValidation {
  if (texte(brut, 'site_web') !== '') {
    return { ok: false, erreurs: [{ champ: '', message: 'Envoi impossible.' }] };
  }
  const valeurs: DonneesContact = {
    nom: texte(brut, 'nom'),
    email: texte(brut, 'email'),
    societe: texte(brut, 'societe'),
    produit: texte(brut, 'produit'),
    message: texte(brut, 'message'),
  };
  const erreurs: ErreurChamp[] = [];
  if (valeurs.nom.length < 2 || valeurs.nom.length > 100) erreurs.push({ champ: 'nom', message: 'Le nom doit compter entre 2 et 100 caractères.' });
  else if (MOTIF_CONTROLE.test(valeurs.nom)) erreurs.push({ champ: 'nom', message: 'Le nom contient des caractères non autorisés.' });
  if (!MOTIF_EMAIL.test(valeurs.email) || valeurs.email.length > 254) erreurs.push({ champ: 'email', message: 'L\'adresse email n\'est pas valide.' });
  if (valeurs.societe.length > 100) erreurs.push({ champ: 'societe', message: 'Le nom de société doit compter 100 caractères au plus.' });
  else if (MOTIF_CONTROLE.test(valeurs.societe)) erreurs.push({ champ: 'societe', message: 'Le nom de société contient des caractères non autorisés.' });
  if (valeurs.produit !== '' && !produitsConnus.includes(valeurs.produit)) erreurs.push({ champ: 'produit', message: 'Le produit sélectionné est inconnu.' });
  if (valeurs.message.length < 10 || valeurs.message.length > 5000) erreurs.push({ champ: 'message', message: 'Le message doit compter entre 10 et 5000 caractères.' });
  if (texte(brut, 'consentement') !== 'oui') erreurs.push({ champ: 'consentement', message: 'Merci de cocher la case de consentement.' });
  return erreurs.length > 0 ? { ok: false, erreurs } : { ok: true, valeurs };
}
