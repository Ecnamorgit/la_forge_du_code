import { getValidators } from "@/lib/validators";
import { isRuntimeChapter } from "@/lib/validators/runtime";

/**
 * Proof that a step was passed, verified by the server (audit EXE-01). The
 * browser sends the code that just passed the validator and the server
 * replays that validator: you have to submit a solution, not just declare
 * the step.
 *
 * Exception: chapters judged on an execution (`RUNTIME_CHAPTERS`), which
 * would have to run server-side. Their success stays declared; the residual
 * risk is described in docs/audit-securite/corrections/EXE-01.md.
 */

/** Maximum size of submitted code: bounds the cost of the validators' regular expressions. */
export const MAX_CODE_LENGTH = 20_000;

export type StepProofVerdict =
  | { ok: true; mode: "revalidated" | "declared" }
  | { ok: false; reason: string };

export function verifyStepProof(
  course: string,
  chapter: string,
  stepIndex: number,
  code: string | undefined
): StepProofVerdict {
  if (isRuntimeChapter(course, chapter)) return { ok: true, mode: "declared" };

  const validate = getValidators(course, chapter)[stepIndex];
  if (!validate) return { ok: false, reason: "Étape sans validateur." };
  if (code === undefined) return { ok: false, reason: "Solution manquante." };

  try {
    if (validate(code).ok) return { ok: true, mode: "revalidated" };
  } catch {
    // A validator that throws on arbitrary input does not count as a pass.
  }
  return { ok: false, reason: "Solution non valide pour cette étape." };
}
