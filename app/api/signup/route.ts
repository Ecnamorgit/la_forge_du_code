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

/** Same response whether the address is free or already registered (audit SRV-05). */
function signupResponse(mail: { ok: boolean; error?: string }) {
  return NextResponse.json({
    ok: true,
    emailSent: mail.ok,
    emailError: mail.ok ? null : mail.error ?? "Envoi du mail impossible",
  });
}

export async function POST(request: Request) {
  const rejection = crossOriginRefusal(request);
  if (rejection) return rejection;

  // Per-IP limit against mass sign-ups.
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

  // Address already registered: the owner gets a "tu as déjà un compte"
  // (you already have an account) email and the response is that of a
  // successful sign-up. The hash is still computed so the response time
  // gives nothing away.
  const existingUser = await prisma.user.findUnique({
    where: { email: emailLower },
    select: { id: true },
  });
  if (existingUser) {
    await bcrypt.hash(password, 12);
    // At most 3 notices per address per day, so as not to flood a third
    // party's inbox. The key is a hash: the address does not appear in the
    // limiter.
    const emailHash = crypto.createHash("sha256").update(emailLower).digest("hex");
    const notice = await rateLimit(`signup-exists:${emailHash}`, {
      limit: 3,
      windowMs: 24 * 60 * 60 * 1000,
    });
    const mailRes = notice.ok ? await sendAccountExistsEmail({ to: emailLower }) : { ok: true };
    logger.info("signup_existing_email", { noticeSent: notice.ok });
    return signupResponse(mailRes);
  }

  // Usernames are public (leaderboard): saying a username is taken reveals
  // nothing.
  const usernameTaken = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (usernameTaken) {
    return NextResponse.json(
      { error: "Ce pseudo est déjà pris", field: "username" },
      { status: 409 }
    );
  }

  // Cost 12, the recommended value in 2026 (also taught in the security
  // course).
  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: emailLower,
      username,
      password: hashed,
      name: username,
      // No `lastVisit`: the field means the last active day, and signing up
      // is not one. Seeding it would skew the liaison shown after the first
      // step.
    },
    select: { id: true, email: true },
  });

  const token = await createToken({ userId: user.id, kind: "email_verify" });
  const mailRes = await sendVerificationEmail({ to: user.email, token });

  // Anonymous counting, which must not make the sign-up fail.
  await prisma.trackEvent.create({ data: { name: "inscription" } }).catch(() => {});

  return signupResponse(mailRes);
}
