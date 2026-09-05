/**
 * Réglages globaux du site, modifiables sans toucher aux pages.
 */

/** Bandeau d'annonce affiché au-dessus de l'en-tête sur toutes les pages. `null` pour le masquer. */
export const annonce: { texte: string; href?: string; libelle?: string } | null = null;

/** Adresse de repli affichée quand le formulaire de contact ne peut pas servir (sans JavaScript, envoi en échec). */
export const emailContact = 'nkobrs21@gmail.com';
