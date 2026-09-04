import type { DonneesContact } from './validation';

export interface EmailContact {
  sujet: string;
  texte: string;
  html: string;
}

function echapper(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Email de notification envoyé à l'éditeur ; le visiteur est en réponse-à. */
export function construireEmail(valeurs: DonneesContact, nomsProduits: Record<string, string>): EmailContact {
  const produit = valeurs.produit ? (nomsProduits[valeurs.produit] ?? valeurs.produit) : '';
  const sujet = `[Contact] ${produit || 'Demande'} — ${valeurs.nom}`;
  const lignes = [
    ['Nom', valeurs.nom],
    ['Email', valeurs.email],
    ['Société', valeurs.societe || '—'],
    ['Produit', produit || '—'],
  ];
  const texte = [
    'Nouvelle demande depuis le formulaire de contact du site Bresnik.',
    '',
    ...lignes.map(([libelle, valeur]) => `${libelle} : ${valeur}`),
    '',
    'Message :',
    valeurs.message,
    '',
    'Répondez directement à cet email pour écrire au visiteur.',
  ].join('\n');
  const html = [
    '<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#faf8f4;color:#1c2331;font-family:Segoe UI,system-ui,sans-serif;font-size:16px;line-height:1.5">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2ddd2;border-radius:8px"><tr><td style="padding:28px">',
    '<p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#1f4fc7">Bresnik · Contact</p>',
    `<h1 style="margin:0 0 20px;font-size:22px">${echapper(sujet)}</h1>`,
    '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">',
    ...lignes.map(([libelle, valeur]) => `<tr><td style="padding:4px 16px 4px 0;color:#4f5868">${echapper(libelle)}</td><td style="padding:4px 0;font-weight:600">${echapper(valeur)}</td></tr>`),
    '</table>',
    `<p style="margin:20px 0 6px;color:#4f5868">Message</p><p style="margin:0;white-space:normal">${echapper(valeurs.message).replace(/\r?\n/g, '<br>')}</p>`,
    '<p style="margin:24px 0 0;font-size:13px;color:#4f5868">Répondez directement à cet email pour écrire au visiteur.</p>',
    '</td></tr></table></body></html>',
  ].join('');
  return { sujet, texte, html };
}
