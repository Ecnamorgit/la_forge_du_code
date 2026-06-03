import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { createToken } from "@/lib/tokens";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email().max(254),
});

/**
 * Always returns 200 — never leaks whether the email exists in the system.
 */
export async function POST(req: Request) {
  // Throttle to prevent password-reset email spam / enumeration probing.
  const limit = rateLimit(`forgot:${getClientIp(req)}`, {
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
    select: { id: true, email: true, password: true },
  });

  // Only send if the user exists AND has a credentials-based password.
  if (user && user.password) {
    const token = await createToken({ userId: user.id, kind: "password_reset" });
    await sendPasswordResetEmail({ to: user.email, token }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
