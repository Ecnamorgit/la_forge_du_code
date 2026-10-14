import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * HTML chapitre 1 — la structure minimale d'un document.
 *
 * Ce chapitre a 3 étapes, pas 4 : c'est le seul du parcours dans ce cas.
 */

describe("HTML chapitre 1 — etape 1 (doctype et enceinte html)", () => {
  const validate = validators[0];

  it("accepte un doctype suivi d'un html ouvert et ferme", () => {
    expect(validate("<!DOCTYPE html>\n<html>\n</html>").ok).toBe(true);
  });

  it("refuse un document sans doctype", () => {
    expect(validate("<html>\n</html>").ok).toBe(false);
  });

  it("refuse une balise html jamais fermee", () => {
    // Échec ciblé : le doctype est là, l'enceinte n'est pas close.
    expect(validate("<!DOCTYPE html>\n<html>").ok).toBe(false);
  });
});

describe("HTML chapitre 1 — etape 2 (head et titre)", () => {
  const validate = validators[1];

  it("accepte un head contenant un title renseigne", () => {
    expect(
      validate("<!DOCTYPE html><html><head><title>Nebula</title></head></html>").ok
    ).toBe(true);
  });

  it("refuse un title vide", () => {
    // Échec ciblé : la balise existe mais ne nomme rien.
    expect(
      validate("<!DOCTYPE html><html><head><title>   </title></head></html>").ok
    ).toBe(false);
  });

  it("refuse un title pose hors du head", () => {
    expect(validate("<!DOCTYPE html><html><title>Nebula</title></html>").ok).toBe(false);
  });
});

describe("HTML chapitre 1 — etape 3 (body et premier titre)", () => {
  const validate = validators[2];

  it("accepte un body contenant h1 Hello World", () => {
    expect(
      validate("<html><body><h1>Hello World</h1></body></html>").ok
    ).toBe(true);
  });

  it("refuse un h1 dont le texte n'est pas celui demande", () => {
    expect(validate("<html><body><h1>Bonjour</h1></body></html>").ok).toBe(false);
  });

  it("refuse un h1 pose hors du body", () => {
    expect(validate("<html><h1>Hello World</h1></html>").ok).toBe(false);
  });
});
