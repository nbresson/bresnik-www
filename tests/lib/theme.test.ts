import { describe, expect, it } from 'vitest';
import { libelleTheme, resoudreTheme } from '../../src/lib/theme';

describe('resoudreTheme', () => {
  it('suit le système quand aucun thème n\'est forcé', () => {
    expect(resoudreTheme('system', true)).toBe('dark');
    expect(resoudreTheme('system', false)).toBe('light');
  });

  it('respecte un thème forcé quel que soit le système', () => {
    expect(resoudreTheme('dark', false)).toBe('dark');
    expect(resoudreTheme('light', true)).toBe('light');
  });
});

describe('libelleTheme', () => {
  it('nomme chaque choix en français', () => {
    expect(libelleTheme('light')).toBe('Clair');
    expect(libelleTheme('dark')).toBe('Sombre');
    expect(libelleTheme('system')).toBe('Système');
  });
});
