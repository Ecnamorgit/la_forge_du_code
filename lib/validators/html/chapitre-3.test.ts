import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-3";

/**
 * HTML chapitre 3 — images : source, dimensions, lien, legende.
 */

describe("HTML chapitre 3 — etape 1 (image accessible)", () => {
  const valider = validators[0];

  it("accepte une image avec src et alt", () => {
    expect(valider('<img src="/radar.png" alt="Ecran radar">').ok).toBe(true);
  });

  it("refuse une image sans alt", () => {
    // Echec cible : l'alt est le sujet de l'etape, pas un detail.
    expect(valider('<img src="/radar.png">').ok).toBe(false);
  });

  it("refuse un alt vide", () => {
    expect(valider('<img src="/radar.png" alt="">').ok).toBe(false);
  });

  it("refuse une image sans src", () => {
    expect(valider('<img alt="Ecran radar">').ok).toBe(false);
  });
});

describe("HTML chapitre 3 — etape 2 (dimensions)", () => {
  const valider = validators[1];

  it("accepte width et height sur l'image", () => {
    expect(
      valider('<img src="/radar.png" alt="Radar" width="640" height="360">').ok
    ).toBe(true);
  });

  it("refuse width seul", () => {
    expect(valider('<img src="/radar.png" alt="Radar" width="640">').ok).toBe(false);
  });

  it("refuse une dimension non numerique", () => {
    // Echec cible : l'attribut HTML attend un nombre de pixels, pas une unite.
    expect(
      valider('<img src="/radar.png" alt="Radar" width="auto" height="360">').ok
    ).toBe(false);
  });
});

describe("HTML chapitre 3 — etape 3 (image cliquable)", () => {
  const valider = validators[2];

  it("accepte une image enveloppee dans un lien", () => {
    expect(
      valider('<a href="/mission"><img src="/radar.png" alt="Radar"></a>').ok
    ).toBe(true);
  });

  it("refuse une image posee a cote du lien", () => {
    // Echec cible : c'est l'imbrication qui rend l'image cliquable.
    expect(
      valider('<a href="/mission">Mission</a><img src="/radar.png" alt="Radar">').ok
    ).toBe(false);
  });

  it("refuse un lien sans href autour de l'image", () => {
    expect(valider('<a><img src="/radar.png" alt="Radar"></a>').ok).toBe(false);
  });
});

describe("HTML chapitre 3 — etape 4 (figure et legende)", () => {
  const valider = validators[3];

  it("accepte une figure contenant l'image et sa legende", () => {
    const code = `<figure>
      <img src="/radar.png" alt="Radar">
      <figcaption>Balayage du secteur 7</figcaption>
    </figure>`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une figcaption vide", () => {
    const code = `<figure>
      <img src="/radar.png" alt="Radar">
      <figcaption>  </figcaption>
    </figure>`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une image laissee hors de la figure", () => {
    // Echec cible : la legende doit etre rattachee a l'image.
    const code = `<img src="/radar.png" alt="Radar">
    <figure><figcaption>Balayage du secteur 7</figcaption></figure>`;
    expect(valider(code).ok).toBe(false);
  });
});
