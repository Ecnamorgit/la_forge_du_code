import { getValidators } from "@/lib/validators";
import { isRuntimeChapter } from "@/lib/validators/runtime";

/**
 * Preuve de réussite d'une étape, vérifiée par le serveur (constat EXE-01 de
 * l'audit de sécurité du 2026-09-12).
 *
 * Le navigateur envoie le code qui vient de passer le validateur ; le serveur
 * rejoue ce même validateur. Une étape ne se déclare donc plus : il faut
 * soumettre une solution qui la valide, comme le fait l'apprenant.
 *
 * Exception : les chapitres jugés sur une exécution (`RUNTIME_CHAPTERS`). Les
 * revalider demanderait d'exécuter le code de l'apprenant sur le serveur, ce
 * que l'architecture exclut. Leur réussite reste déclarée : risque résiduel
 * documenté dans docs/audit-securite/corrections/EXE-01.md.
 */

/** Taille maximale du code soumis : borne le coût des expressions régulières des validateurs. */
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

  const valider = getValidators(course, chapter)[stepIndex];
  if (!valider) return { ok: false, reason: "Étape sans validateur." };
  if (code === undefined) return { ok: false, reason: "Solution manquante." };

  try {
    if (valider(code).ok) return { ok: true, mode: "revalidated" };
  } catch {
    // Un validateur qui lève sur une entrée arbitraire ne vaut pas réussite.
  }
  return { ok: false, reason: "Solution non valide pour cette étape." };
}
