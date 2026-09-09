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
  it("renvoie un en-tête dédié pour chaque tonalité connue", () => {
    expect(getErrorHeader("structure")).toBe("DÉCOMPRESSION SECTEUR");
    expect(getErrorHeader("logic")).toBe("SURCHAUFFE RÉACTEUR");
    expect(getErrorHeader("syntax")).toBe("SIGNAL BROUILLÉ");
  });

  it("retombe sur l'en-tête générique quand la tonalité est absente", () => {
    expect(getErrorHeader()).toBe("BRÈCHE DÉTECTÉE");
    expect(getErrorHeader("generic")).toBe("BRÈCHE DÉTECTÉE");
  });

  it("retombe sur le générique pour une valeur inconnue", () => {
    // @ts-expect-error — on vérifie la robustesse au runtime.
    expect(getErrorHeader("inconnu")).toBe("BRÈCHE DÉTECTÉE");
  });
});

describe("getSuccessHeader", () => {
  it("renvoie l'en-tête de succès par défaut", () => {
    expect(getSuccessHeader()).toBe("SYSTÈME EN LIGNE");
  });
});

describe("getSpectreTaunt", () => {
  it("reste silencieux sous le seuil (1re erreur = feedback système seul)", () => {
    expect(getSpectreTaunt(0)).toBeNull();
    expect(getSpectreTaunt(1)).toBeNull();
    expect(getSpectreTaunt(SPECTRE_TAUNT_THRESHOLD - 1)).toBeNull();
  });

  it("apparaît au seuil et renvoie une raillerie non vide", () => {
    const taunt = getSpectreTaunt(SPECTRE_TAUNT_THRESHOLD);
    expect(taunt).toBeTypeOf("string");
    expect(taunt).not.toBe("");
  });

  it("est déterministe : même rang → même réplique", () => {
    expect(getSpectreTaunt(4)).toBe(getSpectreTaunt(4));
  });

  it("tourne sur le pool sans planter pour un rang très élevé", () => {
    expect(getSpectreTaunt(999)).toBeTypeOf("string");
  });

  it("ignore une valeur non finie", () => {
    expect(getSpectreTaunt(Number.NaN)).toBeNull();
  });
});

describe("inferToneFromError", () => {
  it("classe un timeout / boucle infinie en logic", () => {
    expect(
      inferToneFromError(
        "Execution interrompue apres 3s. Verifie une boucle infinie ou un script bloque."
      )
    ).toBe("logic");
  });

  it("classe une SyntaxError en syntax", () => {
    expect(inferToneFromError("SyntaxError: Unexpected token ')'")).toBe("syntax");
  });

  it("renvoie undefined pour les autres erreurs ou l'absence d'erreur", () => {
    expect(inferToneFromError("TypeError: x is not a function")).toBeUndefined();
    expect(inferToneFromError(null)).toBeUndefined();
  });
});

describe("resolveErrorTone", () => {
  it("priorise la tonalité fournie par le validateur", () => {
    expect(resolveErrorTone("syntax", null, "html")).toBe("syntax");
    expect(resolveErrorTone("syntax", "SyntaxError: x", "javascript")).toBe("syntax");
  });

  it("utilise l'inférence depuis l'erreur JS quand le validateur n'a rien fixé", () => {
    expect(
      resolveErrorTone(undefined, "Execution interrompue apres 3s (boucle infinie).", "javascript")
    ).toBe("logic");
  });

  it("retombe sur le défaut du langage : HTML (et CSS servi en html) → structure", () => {
    expect(resolveErrorTone(undefined, null, "html")).toBe("structure");
  });

  it("laisse JS/SQL en générique (undefined) sans tonalité ni inférence", () => {
    expect(resolveErrorTone(undefined, null, "javascript")).toBeUndefined();
    expect(resolveErrorTone(undefined, null, "sql")).toBeUndefined();
  });
});
