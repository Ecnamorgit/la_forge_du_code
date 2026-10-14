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
  const rejection = crossOriginRefusal(req);
  if (rejection) return rejection;

  // Per-IP limit: slows down random token guessing and caps the cost of
  // bcrypt.hash.
  const limit = await rateLimit(`reset:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
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
        // Receiving the link also proves ownership of the address.
        emailVerified: new Date(),
        // Revokes sessions issued before this change (audit SRV-03).
        sessionVersion: { increment: 1 },
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
