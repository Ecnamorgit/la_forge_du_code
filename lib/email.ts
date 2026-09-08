import "server-only";

import { Resend } from "resend";

let cachedClient: Resend | null = null;

function getClient(): Resend {
  if (cachedClient) return cachedClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY manquante. Configure-la dans .env (https://resend.com/api-keys)."
    );
  }
  cachedClient = new Resend(key);
  return cachedClient;
}

function getFrom(): string {
  return (
    process.env.RESEND_FROM_EMAIL ?? "Nebula Command <onboarding@resend.dev>"
  );
}

function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

interface SendResult {
  ok: boolean;
  error?: string;
}

async function send(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  try {
    const res = await getClient().emails.send({
      from: getFrom(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if (res.error) {
      return { ok: false, error: res.error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur d'envoi",
    };
  }
}

/** Shared frame for transactional emails. Inline styles only — most mail
 *  clients strip <style> tags or class names. */
function frame(args: { title: string; body: string; cta: { href: string; label: string } }): string {
  const { title, body, cta } = args;
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — Nebula Command</title>
  </head>
  <body style="margin:0;padding:0;background:#03060d;font-family:'Helvetica Neue',Arial,sans-serif;color:#c8d6e5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#03060d;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:520px;background:#0a1628;border:1px solid rgba(0,240,255,0.4);border-radius:4px;padding:32px;">
          <tr><td style="text-align:left;">
            <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#3d7eff;margin-bottom:12px;">◈ Nebula Command</div>
            <h1 style="margin:0 0 16px 0;font-family:'Courier New',monospace;font-size:22px;letter-spacing:2px;color:#00f0ff;">${title}</h1>
            <div style="font-size:15px;line-height:1.6;color:#c8d6e5;">${body}</div>
            <p style="margin:28px 0 0 0;">
              <a href="${cta.href}" style="display:inline-block;background:#00f0ff;color:#03060d;font-family:'Courier New',monospace;font-weight:bold;text-decoration:none;padding:12px 24px;letter-spacing:2px;text-transform:uppercase;font-size:13px;border-radius:3px;">${cta.label}</a>
            </p>
            <p style="margin:24px 0 0 0;font-size:12px;color:#6b7d99;">Ou copie ce lien dans ton navigateur :<br /><span style="word-break:break-all;color:#00ff88;">${cta.href}</span></p>
          </td></tr>
        </table>
        <p style="margin:16px 0 0 0;font-size:11px;line-height:1.5;color:#3a4a66;">Nebula Command — Plateforme d'apprentissage du code · laforgeducode.fr<br />Tu reçois ce message parce que cette adresse a été utilisée sur Nebula Command. Aucune action n'est requise si tu n'es pas concerné.</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export async function sendVerificationEmail(args: {
  to: string;
  token: string;
}): Promise<SendResult> {
  const link = `${appUrl()}/verify-email/${args.token}`;
  const html = frame({
    // Casse normale et accents : un titre tout en majuscules est un signal
    // classique pour les filtres anti-spam (observé sur Hotmail, 2026-09-08).
    title: "Vérifie ton email",
    body:
      "<p>Bienvenue à bord, Cadet.</p>" +
      "<p>Une dernière formalité avant de décoller : confirme ton adresse en cliquant sur le bouton ci-dessous. Le lien expire dans <strong>24h</strong>.</p>" +
      "<p>Si tu n'es pas à l'origine de cette inscription, ignore simplement ce message.</p>",
    cta: { href: link, label: "> Confirmer mon email" },
  });
  const text = [
    "Bienvenue à bord, Cadet.",
    "",
    "Une dernière formalité avant de décoller : confirme ton adresse en ouvrant ce lien (valable 24 h) :",
    link,
    "",
    "Si tu n'es pas à l'origine de cette inscription, ignore simplement ce message.",
    "",
    "Nebula Command — Plateforme d'apprentissage du code · laforgeducode.fr",
  ].join("\n");
  return send({ to: args.to, subject: "Nebula Command — Confirme ton email", html, text });
}

export async function sendPasswordResetEmail(args: {
  to: string;
  token: string;
}): Promise<SendResult> {
  const link = `${appUrl()}/reset-password/${args.token}`;
  const html = frame({
    title: "Réinitialisation de ton mot de passe",
    body:
      "<p>Une demande de réinitialisation de mot de passe a été reçue pour ton compte.</p>" +
      "<p>Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe. Le lien expire dans <strong>1h</strong>.</p>" +
      "<p>Si tu n'es pas à l'origine de cette demande, ignore ce message — ton mot de passe actuel reste inchangé.</p>",
    cta: { href: link, label: "> Nouveau mot de passe" },
  });
  const text = [
    "Une demande de réinitialisation de mot de passe a été reçue pour ton compte Nebula Command.",
    "",
    "Choisis un nouveau mot de passe en ouvrant ce lien (valable 1 h) :",
    link,
    "",
    "Si tu n'es pas à l'origine de cette demande, ignore ce message : ton mot de passe actuel reste inchangé.",
    "",
    "Nebula Command — Plateforme d'apprentissage du code · laforgeducode.fr",
  ].join("\n");
  return send({
    to: args.to,
    subject: "Nebula Command — Réinitialisation de ton mot de passe",
    html,
    text,
  });
}
