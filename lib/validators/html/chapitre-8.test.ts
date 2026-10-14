import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-8";

/**
 * HTML chapitre 8 — médias : vidéo, audio, images responsives.
 */

describe("HTML chapitre 8 — etape 1 (video)", () => {
  const validate = validators[0];

  it("accepte une video avec controls", () => {
    expect(validate('<video src="/vol.mp4" controls></video>').ok).toBe(true);
  });

  it("refuse une video sans controls", () => {
    // Échec ciblé : sans contrôles, l'utilisateur ne peut ni lancer ni couper.
    expect(validate('<video src="/vol.mp4"></video>').ok).toBe(false);
  });

  it("refuse une balise video jamais fermee", () => {
    expect(validate('<video src="/vol.mp4" controls>').ok).toBe(false);
  });
});

describe("HTML chapitre 8 — etape 2 (audio)", () => {
  const validate = validators[1];

  it("accepte un audio avec controls", () => {
    expect(validate('<audio src="/radio.mp3" controls></audio>').ok).toBe(true);
  });

  it("refuse un audio sans controls", () => {
    expect(validate('<audio src="/radio.mp3"></audio>').ok).toBe(false);
  });

  it("refuse une video la ou un audio est attendu", () => {
    expect(validate('<video src="/vol.mp4" controls></video>').ok).toBe(false);
  });
});

describe("HTML chapitre 8 — etape 3 (image responsive)", () => {
  const validate = validators[2];

  it("accepte une image avec srcset et sizes", () => {
    const code =
      '<img src="/r.png" alt="Radar" srcset="/r-480.png 480w, /r-960.png 960w" sizes="(max-width: 600px) 480px, 960px">';
    expect(validate(code).ok).toBe(true);
  });

  it("refuse un srcset sans sizes", () => {
    // Échec ciblé : sans sizes, le navigateur ne sait pas quoi choisir.
    const code = '<img src="/r.png" alt="Radar" srcset="/r-480.png 480w, /r-960.png 960w">';
    expect(validate(code).ok).toBe(false);
  });

  it("refuse une image ordinaire", () => {
    expect(validate('<img src="/r.png" alt="Radar">').ok).toBe(false);
  });
});

describe("HTML chapitre 8 — etape 4 (element picture)", () => {
  const validate = validators[3];

  it("accepte deux source et une image de repli", () => {
    const code = `<picture>
      <source srcset="/r.avif" type="image/avif">
      <source srcset="/r.webp" type="image/webp">
      <img src="/r.png" alt="Radar">
    </picture>`;
    expect(validate(code).ok).toBe(true);
  });

  it("refuse un picture sans image de repli", () => {
    // Échec ciblé : sans <img>, rien ne s'affiche sur un navigateur ancien.
    const code = `<picture>
      <source srcset="/r.avif" type="image/avif">
      <source srcset="/r.webp" type="image/webp">
    </picture>`;
    expect(validate(code).ok).toBe(false);
  });

  it("refuse un picture avec une seule source", () => {
    const code = `<picture>
      <source srcset="/r.webp" type="image/webp">
      <img src="/r.png" alt="Radar">
    </picture>`;
    expect(validate(code).ok).toBe(false);
  });
});
