import { describe, expect, it } from 'vitest';
import { construireEmail } from '../../worker/email';

const valeurs = { nom: 'Nicolas Bresson', email: 'nicolas@exemple.fr', societe: 'Bresnik', produit: 'bankbridge', message: 'Bonjour,\nune démo ?\n<script>alert(1)</script>' };

describe('construireEmail', () => {
  it('compose un sujet avec le produit et le nom', () => {
    const email = construireEmail(valeurs, { bankbridge: 'BankBridge' });
    expect(email.sujet).toBe('[Contact] BankBridge — Nicolas Bresson');
  });

  it('compose un sujet sans produit', () => {
    const email = construireEmail({ ...valeurs, produit: '' }, {});
    expect(email.sujet).toBe('[Contact] Demande — Nicolas Bresson');
  });

  it('inclut toutes les informations dans le texte et échappe le HTML', () => {
    const email = construireEmail(valeurs, { bankbridge: 'BankBridge' });
    expect(email.texte).toContain('Nom : Nicolas Bresson');
    expect(email.texte).toContain('Email : nicolas@exemple.fr');
    expect(email.texte).toContain('Société : Bresnik');
    expect(email.texte).toContain('Produit : BankBridge');
    expect(email.texte).toContain('une démo ?');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('une démo ?<br>');
  });
});
