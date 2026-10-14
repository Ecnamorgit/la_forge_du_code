import { NextResponse, after } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { createToken } from "@/lib/tokens";
import { logger } from "@/lib/logger";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  email: z.string().email().max(254),
});

/** Responds 200 whether or not the address is registered, so as not to reveal it. */
export async function POST(req: Request) {
  const rejection = crossOriginRefusal(req);
  if (rejection) return rejection;

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
    // After the response: waiting for the email to be sent would slow the response
    // for a registered address, and the delay would reveal the account.
    after(async () => {
      try {
        const token = await createToken({ userId: user.id, kind: "password_reset" });
        const sendResult = await sendPasswordResetEmail({ to: user.email, token });
        if (!sendResult.ok) logger.warn("forgot-password: échec de l'envoi", { error: sendResult.error });
      } catch (err) {
        logger.error("forgot-password: échec de la création du jeton", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });
  }

  return NextResponse.json({ ok: true });
}
