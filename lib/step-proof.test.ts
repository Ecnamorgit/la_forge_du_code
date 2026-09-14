import { describe, it, expect } from "vitest";

import { getChapterData } from "./courses-registry";
import { verifyStepProof } from "./step-proof";

const CH1_ETAPE_0 = "<!DOCTYPE html>\n<html></html>";

describe("verifyStepProof", () => {
  it("revalide une vraie solution", () => {
    expect(verifyStepProof("html", "chapitre-1", 0, CH1_ETAPE_0)).toEqual({
      ok: true,
      mode: "revalidated",
    });
  });

  it("refuse le code de départ", () => {
    const depart = getChapterData("html", "chapitre-1")!.steps[0].startCode;
    expect(verifyStepProof("html", "chapitre-1", 0, depart).ok).toBe(false);
  });

  it("refuse l'absence de code", () => {
    expect(verifyStepProof("html", "chapitre-1", 0, undefined).ok).toBe(false);
  });

  it("refuse la solution d'une autre étape", () => {
    expect(verifyStepProof("html", "chapitre-1", 1, CH1_ETAPE_0).ok).toBe(false);
  });

  it("refuse une étape sans validateur", () => {
    expect(verifyStepProof("html", "chapitre-1", 99, CH1_ETAPE_0).ok).toBe(false);
  });

  it("laisse déclarées les étapes jugées sur une exécution", () => {
    expect(verifyStepProof("javascript", "chapitre-1", 0, undefined)).toEqual({
      ok: true,
      mode: "declared",
    });
  });
});
