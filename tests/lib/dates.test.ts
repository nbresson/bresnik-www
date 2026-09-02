import { describe, expect, it } from 'vitest';
import { formaterDate } from '../../src/lib/dates';

describe('formaterDate', () => {
  it('formate une date en français long', () => {
    expect(formaterDate(new Date('2026-09-02T12:00:00Z'))).toBe('2 septembre 2026');
  });

  it('formate le premier jour du mois avec le chiffre 1', () => {
    expect(formaterDate(new Date('2026-01-01T12:00:00Z'))).toBe('1 janvier 2026');
  });
});
