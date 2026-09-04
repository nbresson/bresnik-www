export interface Robustesse {
  score: 0 | 1 | 2 | 3 | 4;
  libelle: string;
  criteres: { longueur: boolean; majuscule: boolean; chiffre: boolean; symbole: boolean };
}

const LIBELLES: Record<number, string> = { 0: 'Trop faible', 1: 'Trop faible', 2: 'Faible', 3: 'Correct', 4: 'Robuste' };

/** Robustesse d'un mot de passe selon quatre critères simples, sans transmission réseau. */
export function evaluerRobustesse(motDePasse: string): Robustesse {
  const criteres = {
    longueur: motDePasse.length >= 8,
    majuscule: /\p{Lu}/u.test(motDePasse),
    chiffre: /\p{Nd}/u.test(motDePasse),
    symbole: /[^\p{L}\p{N}\s]/u.test(motDePasse),
  };
  const score = Object.values(criteres).filter(Boolean).length as Robustesse['score'];
  return { score, libelle: motDePasse.length === 0 ? 'Vide' : LIBELLES[score], criteres };
}
