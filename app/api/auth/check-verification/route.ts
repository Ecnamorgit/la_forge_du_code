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

  // On partage le bucket du login (`login:${ip}`) plutôt qu'un compteur dédié :
  // cet endpoint accepte email+password et confirme un mot de passe correct pour
  // un compte non vérifié. Un bucket séparé doublerait le budget de brute-force
  // disponible pour un attaquant qui alterne entre les deux routes.
  const limit = await rateLimit(`login:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000, // 10 tentatives / 5 min / IP, partagé avec le login
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

  // Même verrou par compte que la connexion (constat SRV-07) : sans lui, cette
  // route permettrait de continuer à essayer des mots de passe sur un compte
  // verrouillé. La comparaison factice garde un temps de réponse constant.
  if (await compteVerrouille(email)) {
    await bcrypt.compare(password, await hashFactice());
    return NextResponse.json({ unverified: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { password: true, emailVerified: true },
  });

  if (!user || !user.password) {
    // Compte inexistant : on effectue quand même un compare bcrypt (temps
    // constant) avant de répondre, pour ne pas trahir l'existence de l'adresse.
    await bcrypt.compare(password, await hashFactice());
    return NextResponse.json({ unverified: false });
  }

  const passOk = await bcrypt.compare(password, user.password);
  if (!passOk) {
    // La page de connexion appelle cette route après chaque échec de
    // connexion, déjà compté par `authorize` : on ne compte ici que le seul
    // cas où la réponse apprend quelque chose (compte non vérifié), sinon une
    // faute de frappe compterait double.
    if (!user.emailVerified) await noterEchecConnexion(email);
    return NextResponse.json({ unverified: false });
  }

  return NextResponse.json({ unverified: !user.emailVerified });
}
