import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import {
  InvalidStepError,
  StepOrderError,
  UserNotFoundError,
  completeStep,
} from "@/lib/me-server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";
import { MAX_CODE_LENGTH, verifyStepProof } from "@/lib/step-proof";

const bodySchema = z.object({
  course: z.string().min(1).max(32),
  chapter: z.string().min(1).max(64),
  stepIndex: z.number().int().min(0).max(999),
  // Code qui vient de passer le validateur dans le navigateur : le serveur le
  // rejoue (lib/step-proof.ts). Facultatif pour les étapes jugées sur exécution.
  code: z.string().max(MAX_CODE_LENGTH).optional(),
});

export async function POST(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  // Par compte, avant toute lecture du corps : chaque appel compte, valide ou
  // non. Un apprenant met des dizaines de secondes à réussir une étape ; 20 par
  // minute ne gêne qu'un script (constat EXE-01).
  const limit = await rateLimit(`step:${userId}`, { limit: 20, windowMs: 60_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }
  const { course, chapter, stepIndex, code } = parsed.data;

  // Une étape ne se déclare pas : il faut la solution qui la valide.
  const preuve = verifyStepProof(course, chapter, stepIndex, code);
  if (!preuve.ok) {
    logger.warn("step_refused", { reason: "proof", course, chapter, stepIndex });
    return NextResponse.json({ error: preuve.reason }, { status: 422 });
  }

  try {
    const result = await completeStep(userId, course, chapter, stepIndex);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof InvalidStepError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof StepOrderError) {
      logger.warn("step_refused", { reason: "order", course, chapter, stepIndex });
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
