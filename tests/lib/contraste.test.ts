import { describe, expect, it } from 'vitest';
import { ratioContraste } from '../../src/lib/contraste';

describe('ratioContraste', () => {
  it('vaut 21 entre noir et blanc, dans les deux sens', () => {
    expect(ratioContraste('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(ratioContraste('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });

  it('vaut 1 entre deux couleurs identiques', () => {
    expect(ratioContraste('#1f4fc7', '#1f4fc7')).toBeCloseTo(1, 3);
  });

  it('retrouve les ratios de la charte', () => {
    expect(ratioContraste('#1c2331', '#faf8f4')).toBeCloseTo(14.8, 1);
    expect(ratioContraste('#8f620f', '#fbf1dd')).toBeCloseTo(4.8, 1);
  });
});
