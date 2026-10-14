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
  // Code validated in the browser, which the server replays (lib/step-proof.ts).
  // Optional for steps judged on execution.
  code: z.string().max(MAX_CODE_LENGTH).optional(),
});

export async function POST(req: Request) {
  const rejection = crossOriginRefusal(req);
  if (rejection) return rejection;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  // Per account, before reading the body, so every call counts (audit
  // EXE-01). 20 per minute only hinders a script.
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

  // A step cannot just be claimed: it takes the solution that validates it.
  const proof = verifyStepProof(course, chapter, stepIndex, code);
  if (!proof.ok) {
    logger.warn("step_refused", { reason: "proof", course, chapter, stepIndex });
    return NextResponse.json({ error: proof.reason }, { status: 422 });
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
