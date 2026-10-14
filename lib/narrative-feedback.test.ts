import { describe, it, expect } from "vitest";
import {
  getErrorHeader,
  getSuccessHeader,
  getSpectreTaunt,
  inferToneFromError,
  resolveErrorTone,
  SPECTRE_TAUNT_THRESHOLD,
} from "./narrative-feedback";

describe("getErrorHeader", () => {
  it("returns a dedicated header for each known tone", () => {
    expect(getErrorHeader("structure")).toBe("DÉCOMPRESSION SECTEUR");
    expect(getErrorHeader("logic")).toBe("SURCHAUFFE RÉACTEUR");
    expect(getErrorHeader("syntax")).toBe("SIGNAL BROUILLÉ");
  });

  it("falls back to the generic header when the tone is missing", () => {
    expect(getErrorHeader()).toBe("BRÈCHE DÉTECTÉE");
    expect(getErrorHeader("generic")).toBe("BRÈCHE DÉTECTÉE");
  });

  it("falls back to the generic header for an unknown value", () => {
    // @ts-expect-error — checks robustness at runtime.
    expect(getErrorHeader("inconnu")).toBe("BRÈCHE DÉTECTÉE");
  });
});

describe("getSuccessHeader", () => {
  it("returns the default success header", () => {
    expect(getSuccessHeader()).toBe("SYSTÈME EN LIGNE");
  });
});

describe("getSpectreTaunt", () => {
  it("stays silent below the threshold (1st error = system feedback only)", () => {
    expect(getSpectreTaunt(0)).toBeNull();
    expect(getSpectreTaunt(1)).toBeNull();
    expect(getSpectreTaunt(SPECTRE_TAUNT_THRESHOLD - 1)).toBeNull();
  });

  it("appears at the threshold and returns a non-empty taunt", () => {
    const taunt = getSpectreTaunt(SPECTRE_TAUNT_THRESHOLD);
    expect(taunt).toBeTypeOf("string");
    expect(taunt).not.toBe("");
  });

  it("is deterministic: same rank → same line", () => {
    expect(getSpectreTaunt(4)).toBe(getSpectreTaunt(4));
  });

  it("cycles through the pool without crashing for a very high rank", () => {
    expect(getSpectreTaunt(999)).toBeTypeOf("string");
  });

  it("ignores a non-finite value", () => {
    expect(getSpectreTaunt(Number.NaN)).toBeNull();
  });
});

describe("inferToneFromError", () => {
  it("classifies a timeout / infinite loop as logic", () => {
    expect(
      inferToneFromError(
        "Execution interrompue apres 3s. Verifie une boucle infinie ou un script bloque."
      )
    ).toBe("logic");
  });

  it("classifies a SyntaxError as syntax", () => {
    expect(inferToneFromError("SyntaxError: Unexpected token ')'")).toBe("syntax");
  });

  it("returns undefined for other errors or when there is no error", () => {
    expect(inferToneFromError("TypeError: x is not a function")).toBeUndefined();
    expect(inferToneFromError(null)).toBeUndefined();
  });
});

describe("resolveErrorTone", () => {
  it("prioritizes the tone provided by the validator", () => {
    expect(resolveErrorTone("syntax", null, "html")).toBe("syntax");
    expect(resolveErrorTone("syntax", "SyntaxError: x", "javascript")).toBe("syntax");
  });

  it("uses inference from the JS error when the validator set nothing", () => {
    expect(
      resolveErrorTone(undefined, "Execution interrompue apres 3s (boucle infinie).", "javascript")
    ).toBe("logic");
  });

  it("falls back to the language default: HTML (and CSS served as html) → structure", () => {
    expect(resolveErrorTone(undefined, null, "html")).toBe("structure");
  });

  it("leaves JS/SQL generic (undefined) with no tone and no inference", () => {
    expect(resolveErrorTone(undefined, null, "javascript")).toBeUndefined();
    expect(resolveErrorTone(undefined, null, "sql")).toBeUndefined();
  });
});
