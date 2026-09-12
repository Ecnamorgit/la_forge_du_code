import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { TokenError, consumeToken } from "@/lib/tokens";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  token: z.string().min(20).max(200),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre")
    .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre"),
});

export async function POST(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  // Throttle par IP : empêche de marteler des tokens au hasard, et borne le
  // coût des bcrypt.hash déclenchés par cette route.
  const limit = await rateLimit(`reset:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000, // 10 tentatives / 15 min / IP
  });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  try {
    const { userId } = await consumeToken({
      token: parsed.data.token,
      kind: "password_reset",
    });
    const hashed = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
        // Resetting the password also confirms email ownership.
        emailVerified: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof TokenError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
