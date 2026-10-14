import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import {
  InvalidStepError,
  StepOrderError,
  completeStep,
  markCinematicView,
} from "@/lib/me-server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";
import { filterTrialCinematics, filterTrialSteps } from "@/lib/trial-import";

export async function POST(req: Request) {
  const rejection = crossOriginRefusal(req);
  if (rejection) return rejection;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Keyed on the user rather than the IP, which can be shared
  // ("unknown" behind some proxies) or changed by the caller.
  const limit = await rateLimit(`trial-import:${session.user.id}`, {
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

  const rawSteps = (raw as { steps?: unknown } | null)?.steps;
  const steps = filterTrialSteps(rawSteps);

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
      // A rejected step does not fail the onboarding. Steps arrive
      // sorted: an order rejection signals a gap in the trial progress,
      // and the following ones will be rejected too.
      if (err instanceof InvalidStepError || err instanceof StepOrderError) continue;
      throw err;
    }
  }

  const seenCinematics = filterTrialCinematics(
    (raw as { seenCinematics?: unknown } | null)?.seenCinematics
  );
  for (const cinematicId of seenCinematics) {
    // Idempotent (upsert).
    try {
      await markCinematicView(session.user.id, cinematicId);
    } catch {
      /* non-blocking */
    }
  }

  // A gap between the number received and the number kept by the allowlist
  // would reveal an attempt to probe the route.
  const rawCount = Array.isArray(rawSteps) ? rawSteps.length : 0;
  logger.info("trial_import", {
    imported,
    submittedRaw: rawCount,
    submittedFiltered: steps.length,
    cinematics: seenCinematics.length,
  });
  return NextResponse.json({ imported, cinematics: seenCinematics.length });
}
