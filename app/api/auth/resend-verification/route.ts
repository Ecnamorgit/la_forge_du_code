import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { createToken } from "@/lib/tokens";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  email: z.string().email().max(254),
});

/**
 * Re-send a verification email. Always returns 200 with the same shape
 * regardless of whether the email exists or is already verified — this avoids
 * leaking the user database via response timing/content.
 */
export async function POST(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  // Throttle to prevent verification-email spam.
  const limit = await rateLimit(`resend:${getClientIp(req)}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 5 requests / 15 min / IP
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
    select: { id: true, email: true, emailVerified: true },
  });

  if (user && !user.emailVerified) {
    const token = await createToken({ userId: user.id, kind: "email_verify" });
    // Fire-and-forget: don't expose send errors to the client (no enumeration).
    await sendVerificationEmail({ to: user.email, token }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
