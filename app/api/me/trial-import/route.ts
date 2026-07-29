import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { InvalidStepError, completeStep } from "@/lib/me-server";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { filterTrialSteps } from "@/lib/trial-import";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const limit = await rateLimit(`trial-import:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const steps = filterTrialSteps((raw as { steps?: unknown } | null)?.steps);

  let imported = 0;
  for (const step of steps) {
    try {
      const result = await completeStep(
        session.user.id,
        step.course,
        step.chapter,
        step.stepIndex
      );
      if (!result.alreadyDone) imported += 1;
    } catch (err) {
      // Une étape refusée ne doit pas faire échouer l'onboarding.
      if (err instanceof InvalidStepError) continue;
      throw err;
    }
  }

  logger.info("trial_import", { imported, submitted: steps.length });
  return NextResponse.json({ imported });
}
