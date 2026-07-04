// SERVICE - Envoi d'emails (Resend / Gmail / Console)

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail(opts: EmailOptions): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  // Mode "console" : n'envoie pas réellement, affiche dans le terminal
  // Parfait pour le dev / la démo jury sans setup
  if (provider === 'console') {
    console.log('');
    console.log('════════════════════════════════════════════════');
    console.log('📧 EMAIL (mode console - non envoyé réellement)');
    console.log('════════════════════════════════════════════════');
    console.log(`À        : ${opts.to}`);
    console.log(`Sujet    : ${opts.subject}`);
    console.log(`Contenu  :`);
    console.log(opts.text);
    console.log('════════════════════════════════════════════════');
    console.log('');
    return;
  }

  // Mode Resend (recommandé)
  if (provider === 'resend') {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      await resend.emails.send({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      console.log(`✅ Email envoyé à ${opts.to} via Resend`);
    } catch (err: any) {
      console.error('❌ Erreur envoi email (Resend) :', err.message);
      throw new Error("Impossible d'envoyer l'email");
    }
    return;
  }

  // Mode Gmail SMTP
  if (provider === 'gmail') {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      console.log(`✅ Email envoyé à ${opts.to} via Gmail`);
    } catch (err: any) {
      console.error('❌ Erreur envoi email (Gmail) :', err.message);
      throw new Error("Impossible d'envoyer l'email");
    }
    return;
  }
}

export function buildPasswordResetSubject(): string {
  return 'NutriSense - Réinitialisation de ton mot de passe 🔑';
}

export function buildPasswordResetText(name: string, code: string): string {
  return `Bonjour ${name},

Tu as demandé à réinitialiser ton mot de passe sur NutriSense.

Voici ton code de vérification :

    ${code}

Ce code est valable 15 minutes.

Si tu n'as pas fait cette demande, ignore cet email et ton mot de passe restera inchangé.

À bientôt,
L'équipe NutriSense`;
}

export function buildPasswordResetHtml(name: string, code: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background: #e8f5e9; padding: 16px; border-radius: 16px;">
        <span style="font-size: 40px;">🥗</span>
      </div>
    </div>
    <h1 style="color: #1a1a1a; text-align: center; font-size: 22px; margin: 0 0 8px;">Réinitialisation du mot de passe</h1>
    <p style="color: #666; text-align: center; margin: 0 0 24px;">Bonjour <strong>${name}</strong>,</p>
    <p style="color: #444; line-height: 1.6;">
      Tu as demandé à réinitialiser ton mot de passe. Utilise ce code dans l'app :
    </p>
    <div style="background: #1b5e3f; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
      <div style="font-size: 32px; letter-spacing: 8px; font-weight: 800;">${code}</div>
    </div>
    <p style="color: #666; font-size: 14px; text-align: center;">
      Ce code est valable <strong>15 minutes</strong>.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      Si tu n'as pas demandé cette réinitialisation, ignore cet email.<br>
      Ton mot de passe restera inchangé.
    </p>
  </div>
  <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
    NutriSense — Ton coach nutrition
  </p>
</body>
</html>`;
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  code: string
): Promise<void> {
  const subject = buildPasswordResetSubject();
  const text = buildPasswordResetText(name, code);
  const html = buildPasswordResetHtml(name, code);
  await sendEmail({ to: email, subject, html, text });
}
