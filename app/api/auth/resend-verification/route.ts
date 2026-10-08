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
 * Renvoie l'e-mail de vérification. La réponse est la même que l'adresse
 * existe, soit déjà vérifiée ou non, pour ne pas révéler les comptes.
 */
export async function POST(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  // Contre l'envoi massif d'e-mails de vérification.
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
    // Après la réponse, pour que son délai ne révèle pas le compte. Une erreur
    // d'envoi n'est pas remontée au client.
    after(async () => {
      try {
        const token = await createToken({ userId: user.id, kind: "email_verify" });
        const envoi = await sendVerificationEmail({ to: user.email, token });
        if (!envoi.ok) logger.warn("resend-verification: échec de l'envoi", { error: envoi.error });
      } catch (err) {
        logger.error("resend-verification: échec de la création du jeton", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });
  }

  return NextResponse.json({ ok: true });
}
