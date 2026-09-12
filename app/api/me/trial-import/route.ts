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
import { filterTrialCinematics, filterTrialSteps } from "@/lib/trial-import";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Clé sur l'utilisateur authentifié, pas sur l'IP : la route est déjà
  // authentifiée à ce stade, et l'IP se prête à un partage de bucket (proxy
  // sans en-tête normalisé -> "unknown" pour tout le monde) ou à une rotation
  // triviale par l'appelant.
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
      // Une étape refusée ne doit pas faire échouer l'onboarding. Les étapes
      // arrivent triées (filterTrialSteps) : un refus d'ordre ne vient que
      // d'un trou dans la progression d'essai, et les suivantes le suivront.
      if (err instanceof InvalidStepError || err instanceof StepOrderError) continue;
      throw err;
    }
  }

  const seenCinematics = filterTrialCinematics(
    (raw as { seenCinematics?: unknown } | null)?.seenCinematics
  );
  for (const cinematicId of seenCinematics) {
    // Idempotent (upsert) ; un échec isolé ne fait pas échouer l'onboarding.
    try {
      await markCinematicView(session.user.id, cinematicId);
    } catch {
      /* non bloquant */
    }
  }

  // On journalise à la fois le nombre reçu (avant filtrage) et le nombre
  // retenu (après allowlist) : l'écart entre les deux est le seul signal
  // qui révélerait une tentative de sonder l'endpoint.
  const rawCount = Array.isArray(rawSteps) ? rawSteps.length : 0;
  logger.info("trial_import", {
    imported,
    submittedRaw: rawCount,
    submittedFiltered: steps.length,
    cinematics: seenCinematics.length,
  });
  return NextResponse.json({ imported, cinematics: seenCinematics.length });
}
