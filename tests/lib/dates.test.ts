import { describe, expect, it } from 'vitest';
import { formaterDate, dateIso } from '../../src/lib/dates';

describe('formaterDate', () => {
  it('formate une date en français long', () => {
    expect(formaterDate(new Date('2026-09-02T12:00:00Z'))).toBe('2 septembre 2026');
  });

  it('formate le premier jour du mois avec le chiffre 1', () => {
    expect(formaterDate(new Date('2026-01-01T12:00:00Z'))).toBe('1 janvier 2026');
  });
});

describe('dateIso', () => {
  it('retourne une date au format ISO 8601 (YYYY-MM-DD)', () => {
    expect(dateIso(new Date('2026-09-02T12:00:00Z'))).toBe('2026-09-02');
  });

  it('retourne le premier jour du mois au format ISO', () => {
    expect(dateIso(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-01');
  });
});
