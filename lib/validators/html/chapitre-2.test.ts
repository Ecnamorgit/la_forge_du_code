import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-2";

/**
 * HTML chapitre 2 — liens externes, ancres internes et navigation.
 */

describe("HTML chapitre 2 — etape 1 (lien externe)", () => {
  const validate = validators[0];

  it("accepte un lien http avec target _blank", () => {
    expect(
      validate('<a href="https://developer.mozilla.org" target="_blank">MDN</a>').ok
    ).toBe(true);
  });

  it("refuse un lien externe sans target _blank", () => {
    expect(validate('<a href="https://developer.mozilla.org">MDN</a>').ok).toBe(false);
  });

  it("refuse un lien interne, qui n'est pas une passerelle externe", () => {
    // Échec ciblé : le href existe mais ne sort pas du site.
    expect(validate('<a href="/missions" target="_blank">Missions</a>').ok).toBe(false);
  });

  it("ignore un lien place en commentaire HTML", () => {
    expect(
      validate('<!-- <a href="https://mdn.io" target="_blank">MDN</a> -->').ok
    ).toBe(false);
  });
});

describe("HTML chapitre 2 — etape 2 (deux reperes)", () => {
  const validate = validators[1];

  it("accepte deux sections aux id distincts", () => {
    expect(
      validate('<section id="missions">A</section><section id="contact">B</section>').ok
    ).toBe(true);
  });

  it("refuse deux sections portant le meme id", () => {
    // Échec ciblé : un id doit être unique pour servir d'ancre.
    expect(
      validate('<section id="missions">A</section><section id="missions">B</section>').ok
    ).toBe(false);
  });

  it("refuse une seule section", () => {
    expect(validate('<section id="missions">A</section>').ok).toBe(false);
  });
});

describe("HTML chapitre 2 — etape 3 (liens internes)", () => {
  const validate = validators[2];

  const TARGETS = '<section id="missions">A</section><section id="contact">B</section>';

  it("accepte deux ancres pointant vers des id existants", () => {
    const code = `<a href="#missions">M</a><a href="#contact">C</a>${TARGETS}`;
    expect(validate(code).ok).toBe(true);
  });

  it("refuse une ancre qui ne correspond a aucun id", () => {
    // Échec ciblé : le lien existe mais ne mène nulle part.
    const code = `<a href="#missions">M</a><a href="#equipage">E</a>${TARGETS}`;
    expect(validate(code).ok).toBe(false);
  });

  it("refuse une seule ancre", () => {
    const code = `<a href="#missions">M</a>${TARGETS}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("HTML chapitre 2 — etape 4 (barre de navigation)", () => {
  const validate = validators[3];

  it("accepte une nav avec un lien externe et deux ancres", () => {
    const code = `<nav>
      <a href="https://developer.mozilla.org" target="_blank">MDN</a>
      <a href="#missions">Missions</a>
      <a href="#contact">Contact</a>
    </nav>`;
    expect(validate(code).ok).toBe(true);
  });

  it("refuse une nav qui a perdu le lien externe", () => {
    const code = `<nav>
      <a href="#missions">Missions</a>
      <a href="#contact">Contact</a>
      <a href="#equipage">Equipage</a>
    </nav>`;
    expect(validate(code).ok).toBe(false);
  });

  it("refuse trois liens laisses hors d'une nav", () => {
    // Échec ciblé : c'est le regroupement sémantique qu'enseigne l'étape.
    const code = `<div>
      <a href="https://developer.mozilla.org">MDN</a>
      <a href="#missions">Missions</a>
      <a href="#contact">Contact</a>
    </div>`;
    expect(validate(code).ok).toBe(false);
  });
});
