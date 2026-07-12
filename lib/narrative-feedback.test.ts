import { describe, it, expect } from "vitest";
import {
  getErrorHeader,
  getSuccessHeader,
  getSpectreTaunt,
  inferToneFromError,
  SPECTRE_TAUNT_THRESHOLD,
} from "./narrative-feedback";

describe("getErrorHeader", () => {
  it("renvoie un en-tête dédié pour chaque tonalité connue", () => {
    expect(getErrorHeader("structure")).toBe("DECOMPRESSION SECTEUR");
    expect(getErrorHeader("logic")).toBe("SURCHAUFFE REACTEUR");
    expect(getErrorHeader("syntax")).toBe("SIGNAL BROUILLE");
  });

  it("retombe sur l'en-tête générique quand la tonalité est absente", () => {
    expect(getErrorHeader()).toBe("BRECHE DETECTEE");
    expect(getErrorHeader("generic")).toBe("BRECHE DETECTEE");
  });

  it("retombe sur le générique pour une valeur inconnue", () => {
    // @ts-expect-error — on vérifie la robustesse au runtime.
    expect(getErrorHeader("inconnu")).toBe("BRECHE DETECTEE");
  });
});

describe("getSuccessHeader", () => {
  it("renvoie l'en-tête de succès par défaut", () => {
    expect(getSuccessHeader()).toBe("SYSTEME EN LIGNE");
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
