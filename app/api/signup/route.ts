import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { createToken } from "@/lib/tokens";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

const signupSchema = z.object({
  email: z.string().email().max(254),
  username: z
    .string()
    .min(2)
    .max(16)
    .regex(/^[a-zA-Z0-9_-]+$/, "Lettres, chiffres, _ et - uniquement"),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  // Throttle account creation per IP to curb spam / mass signups.
  const limit = rateLimit(`signup:${getClientIp(request)}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 5 accounts / hour / IP
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

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailLower }, { username }],
    },
    select: { email: true, username: true },
  });

  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.email === emailLower
            ? "Cet email est déjà utilisé"
            : "Ce pseudo est déjà pris",
        field: existing.email === emailLower ? "email" : "username",
      },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: emailLower,
      username,
      password: hashed,
      name: username,
      lastVisit: new Date().toISOString().slice(0, 10),
    },
    select: { id: true, email: true },
  });

  const token = await createToken({ userId: user.id, kind: "email_verify" });
  const mailRes = await sendVerificationEmail({ to: user.email, token });

  return NextResponse.json({
    ok: true,
    emailSent: mailRes.ok,
    emailError: mailRes.ok ? null : mailRes.error ?? "Envoi du mail impossible",
  });
}
