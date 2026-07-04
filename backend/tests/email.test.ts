// ==========================================
// TESTS - Service Email (templates)
// ==========================================
import {
  buildPasswordResetSubject,
  buildPasswordResetText,
  buildPasswordResetHtml,
} from '../src/services/email.service';

describe('buildPasswordResetSubject', () => {
  it('contient le nom de l\'application', () => {
    const subject = buildPasswordResetSubject();
    expect(subject).toContain('NutriSense');
  });

  it('indique une réinitialisation de mot de passe', () => {
    const subject = buildPasswordResetSubject();
    expect(subject.toLowerCase()).toContain('réinitialisation');
  });
});

describe('buildPasswordResetText', () => {
  it('inclut le nom de l\'utilisateur', () => {
    const text = buildPasswordResetText('Sirine', '123456');
    expect(text).toContain('Sirine');
    expect(text).toContain('Bonjour');
  });

  it('inclut le code de vérification', () => {
    const text = buildPasswordResetText('Sirine', '654321');
    expect(text).toContain('654321');
  });

  it('mentionne la durée de validité (15 minutes)', () => {
    const text = buildPasswordResetText('Sirine', '000000');
    expect(text).toContain('15 minutes');
  });

  it('signale que le code est ignorable si non demandé', () => {
    const text = buildPasswordResetText('Sirine', '000000');
    expect(text.toLowerCase()).toContain('ignore');
  });

  it('contient la signature NutriSense', () => {
    const text = buildPasswordResetText('Sirine', '000000');
    expect(text).toContain("L'équipe NutriSense");
  });
});

describe('buildPasswordResetHtml', () => {
  it('est un HTML valide', () => {
    const html = buildPasswordResetHtml('Sirine', '123456');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('inclut le nom en gras', () => {
    const html = buildPasswordResetHtml('Sirine', '123456');
    expect(html).toContain('<strong>Sirine</strong>');
  });

  it('inclut le code de vérification', () => {
    const html = buildPasswordResetHtml('Sirine', '789012');
    expect(html).toContain('789012');
  });

  it('utilise la couleur verte NutriSense (#1b5e3f)', () => {
    const html = buildPasswordResetHtml('Sirine', '123456');
    expect(html).toContain('#1b5e3f');
  });

  it('contient un titre H1', () => {
    const html = buildPasswordResetHtml('Sirine', '123456');
    expect(html).toContain('<h1');
    expect(html).toContain('Réinitialisation');
  });

  it('mentionne la durée de validité', () => {
    const html = buildPasswordResetHtml('Sirine', '123456');
    expect(html).toContain('15 minutes');
  });

  it('gère les caractères spéciaux dans le nom (accents)', () => {
    const html = buildPasswordResetHtml('Amélie', '123456');
    expect(html).toContain('Amélie');
  });
});
