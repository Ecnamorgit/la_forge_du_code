import crypto from "node:crypto";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendAccountExistsEmail, sendVerificationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { createToken } from "@/lib/tokens";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

const signupSchema = z.object({
  email: z.string().email().max(254),
  username: z
    .string()
    .min(2)
    .max(16)
    .regex(/^[a-zA-Z0-9_-]+$/, "Lettres, chiffres, _ et - uniquement"),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre")
    .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre"),
});

/** Même réponse que l'adresse soit libre ou déjà inscrite (audit SRV-05). */
function reponseInscription(mail: { ok: boolean; error?: string }) {
  return NextResponse.json({
    ok: true,
    emailSent: mail.ok,
    emailError: mail.ok ? null : mail.error ?? "Envoi du mail impossible",
  });
}

export async function POST(request: Request) {
  const refus = crossOriginRefusal(request);
  if (refus) return refus;

  // Limite par IP contre les inscriptions en masse.
  const limit = await rateLimit(`signup:${getClientIp(request)}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Données invalides", field: first?.path[0] },
      { status: 400 }
    );
  }

  const { email, username, password } = parsed.data;
  const emailLower = email.toLowerCase();

  // Adresse déjà inscrite : le titulaire reçoit un e-mail « tu as déjà un
  // compte » et la réponse est celle d'une inscription réussie. Le hachage est
  // calculé quand même pour que le temps de réponse ne trahisse rien.
  const dejaInscrit = await prisma.user.findUnique({
    where: { email: emailLower },
    select: { id: true },
  });
  if (dejaInscrit) {
    await bcrypt.hash(password, 12);
    // Au plus 3 avis par adresse et par jour, pour ne pas inonder la boîte
    // d'un tiers. La clé est une empreinte : l'adresse n'apparaît pas dans le
    // limiteur.
    const empreinte = crypto.createHash("sha256").update(emailLower).digest("hex");
    const avis = await rateLimit(`signup-exists:${empreinte}`, {
      limit: 3,
      windowMs: 24 * 60 * 60 * 1000,
    });
    const mailRes = avis.ok ? await sendAccountExistsEmail({ to: emailLower }) : { ok: true };
    logger.info("signup_existing_email", { noticeSent: avis.ok });
    return reponseInscription(mailRes);
  }

  // Les pseudos sont publics (classement) : dire qu'un pseudo est pris ne
  // révèle rien.
  const pseudoPris = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (pseudoPris) {
    return NextResponse.json(
      { error: "Ce pseudo est déjà pris", field: "username" },
      { status: 409 }
    );
  }

  // Coût 12, valeur recommandée en 2026 (aussi enseignée dans le cours de
  // sécurité).
  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: emailLower,
      username,
      password: hashed,
      name: username,
      // Pas de `lastVisit` : le champ désigne le dernier jour actif, et
      // s'inscrire n'en est pas un. Le semer fausserait la liaison affichée
      // après la première étape.
    },
    select: { id: true, email: true },
  });

  const token = await createToken({ userId: user.id, kind: "email_verify" });
  const mailRes = await sendVerificationEmail({ to: user.email, token });

  // Comptage anonyme, qui ne doit pas faire échouer l'inscription.
  await prisma.trackEvent.create({ data: { name: "inscription" } }).catch(() => {});

  return reponseInscription(mailRes);
}
