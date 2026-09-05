import { describe, expect, it } from 'vitest';
import { fusionnerCaptures, titreDepuisFichier } from '../../src/lib/captures';

describe('titreDepuisFichier', () => {
  it('transforme un nom de fichier en titre lisible', () => {
    expect(titreDepuisFichier('tableau-de-bord.png')).toBe('Tableau de bord');
    expect(titreDepuisFichier('01-import_extraits.webp')).toBe('Import extraits');
  });
});

describe('fusionnerCaptures', () => {
  const fichiers = ['regles.png', 'tableau-de-bord.png', 'import.png'];

  it('ordonne les captures décrites en premier, dans l\'ordre des descriptions, puis les autres par nom', () => {
    const resultat = fusionnerCaptures(fichiers, [{ fichier: 'tableau-de-bord.png', alt: 'Vue générale', titre: 'Tableau de bord' }], 'BankBridge');
    expect(resultat.map((c) => c.fichier)).toEqual(['tableau-de-bord.png', 'import.png', 'regles.png']);
  });

  it('reprend la description fournie et fabrique un titre et un alt par défaut sinon', () => {
    const resultat = fusionnerCaptures(fichiers, [{ fichier: 'tableau-de-bord.png', alt: 'Vue générale' }], 'BankBridge');
    expect(resultat[0]).toEqual({ fichier: 'tableau-de-bord.png', titre: 'Tableau de bord', alt: 'Vue générale' });
    expect(resultat[1]).toEqual({ fichier: 'import.png', titre: 'Import', alt: 'Capture d\'écran de BankBridge : import' });
  });

  it('ignore une description dont le fichier n\'existe pas', () => {
    const resultat = fusionnerCaptures(fichiers, [{ fichier: 'absent.png', alt: 'x' }], 'BankBridge');
    expect(resultat).toHaveLength(3);
  });
});
