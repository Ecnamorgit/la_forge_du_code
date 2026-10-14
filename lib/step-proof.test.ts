import { describe, it, expect } from "vitest";

import { getChapterData } from "./courses-registry";
import { verifyStepProof } from "./step-proof";

const CH1_STEP_0 = "<!DOCTYPE html>\n<html></html>";

describe("verifyStepProof", () => {
  it("revalidates a real solution", () => {
    expect(verifyStepProof("html", "chapitre-1", 0, CH1_STEP_0)).toEqual({
      ok: true,
      mode: "revalidated",
    });
  });

  it("rejects the starter code", () => {
    const starterCode = getChapterData("html", "chapitre-1")!.steps[0].startCode;
    expect(verifyStepProof("html", "chapitre-1", 0, starterCode).ok).toBe(false);
  });

  it("rejects missing code", () => {
    expect(verifyStepProof("html", "chapitre-1", 0, undefined).ok).toBe(false);
  });

  it("rejects the solution of another step", () => {
    expect(verifyStepProof("html", "chapitre-1", 1, CH1_STEP_0).ok).toBe(false);
  });

  it("rejects a step without a validator", () => {
    expect(verifyStepProof("html", "chapitre-1", 99, CH1_STEP_0).ok).toBe(false);
  });

  it("leaves runtime-judged steps as declared", () => {
    expect(verifyStepProof("javascript", "chapitre-1", 0, undefined)).toEqual({
      ok: true,
      mode: "declared",
    });
  });
});
