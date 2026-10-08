import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { createToken } from "@/lib/tokens";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  email: z.string().email().max(254),
});

/** Répond 200 que l'adresse soit inscrite ou non, pour ne pas la révéler. */
export async function POST(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  const limit = await rateLimit(`forgot:${getClientIp(req)}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true },
  });

  if (user && user.password) {
    const token = await createToken({ userId: user.id, kind: "password_reset" });
    await sendPasswordResetEmail({ to: user.email, token }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
