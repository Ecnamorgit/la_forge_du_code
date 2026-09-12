import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

// Hash factice au format bcrypt, calculé une fois au chargement du module. On
// le compare lorsque l'email n'existe pas, pour que le temps de réponse soit le
// même qu'avec un compte réel : sans ça, l'absence de `bcrypt.compare` créerait
// un écart de timing permettant d'énumérer les adresses enregistrées.
const DUMMY_HASH = bcrypt.hashSync("check-verification-timing-guard", 12);

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
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { password: true, emailVerified: true },
  });

  if (!user || !user.password) {
    // Compte inexistant : on effectue quand même un compare bcrypt (temps
    // constant) avant de répondre, pour ne pas trahir l'existence de l'adresse.
    await bcrypt.compare(password, DUMMY_HASH);
    return NextResponse.json({ unverified: false });
  }

  const passOk = await bcrypt.compare(password, user.password);
  if (!passOk) {
    return NextResponse.json({ unverified: false });
  }

  return NextResponse.json({ unverified: !user.emailVerified });
}
