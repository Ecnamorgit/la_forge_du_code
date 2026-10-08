import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { compteVerrouille, hashFactice, noterEchecConnexion } from "@/lib/login-guard";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  // Même compteur que la connexion : cette route confirme un mot de passe
  // correct, et un compteur séparé doublerait le budget de force brute.
  const limit = await rateLimit(`login:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });
  if (!limit.ok) return NextResponse.json({ unverified: false });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ unverified: false });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ unverified: false });
  }

  const { email, password } = parsed.data;

  // Même verrou par compte que la connexion (audit SRV-07), sinon cette route
  // permettrait d'essayer des mots de passe sur un compte verrouillé.
  if (await compteVerrouille(email)) {
    await bcrypt.compare(password, await hashFactice());
    return NextResponse.json({ unverified: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { password: true, emailVerified: true },
  });

  if (!user || !user.password) {
    // Comparaison factice : le temps de réponse ne trahit pas l'existence de
    // l'adresse.
    await bcrypt.compare(password, await hashFactice());
    return NextResponse.json({ unverified: false });
  }

  const passOk = await bcrypt.compare(password, user.password);
  if (!passOk) {
    // La page de connexion appelle cette route après un échec déjà compté par
    // `authorize` : on ne compte que le cas où la réponse apprend quelque chose
    // (compte non vérifié).
    if (!user.emailVerified) await noterEchecConnexion(email);
    return NextResponse.json({ unverified: false });
  }

  return NextResponse.json({ unverified: !user.emailVerified });
}
