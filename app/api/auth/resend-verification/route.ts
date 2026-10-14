import { NextResponse, after } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { createToken } from "@/lib/tokens";
import { logger } from "@/lib/logger";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  email: z.string().email().max(254),
});

/**
 * Resends the verification email. The response is the same whether the address
 * exists, is already verified or not, so as not to reveal accounts.
 */
export async function POST(req: Request) {
  const rejection = crossOriginRefusal(req);
  if (rejection) return rejection;

  // Guards against mass sending of verification emails.
  const limit = await rateLimit(`resend:${getClientIp(req)}`, {
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
    select: { id: true, email: true, emailVerified: true },
  });

  if (user && !user.emailVerified) {
    // After the response, so its delay does not reveal the account. A sending
    // error is not reported to the client.
    after(async () => {
      try {
        const token = await createToken({ userId: user.id, kind: "email_verify" });
        const sendResult = await sendVerificationEmail({ to: user.email, token });
        if (!sendResult.ok) logger.warn("resend-verification: échec de l'envoi", { error: sendResult.error });
      } catch (err) {
        logger.error("resend-verification: échec de la création du jeton", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });
  }

  return NextResponse.json({ ok: true });
}
