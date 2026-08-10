import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-8";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 8 — evenements : clic, delegation, saisie, soumission.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 8 — etape 1 (ecouter un clic)", () => {
  const valider = validators[0];

  const CODE = `const bouton = document.querySelector("button");
bouton.addEventListener("click", () => console.log("PEW"));
bouton.click();
bouton.click();`;

  it("valide un listener declenche deux fois", () => {
    expect(valider(CODE, ctx(["PEW", "PEW"])).ok).toBe(true);
  });

  it("refuse un seul declenchement", () => {
    // Echec cible : l'etape demande de prouver que le listener rejoue.
    expect(valider(CODE, ctx(["PEW"])).ok).toBe(false);
  });

  it("refuse un onclick en attribut, sans addEventListener", () => {
    const code = `const bouton = document.querySelector("button");
bouton.onclick = () => console.log("PEW");
bouton.click();
bouton.click();`;
    expect(valider(code, ctx(["PEW", "PEW"])).ok).toBe(false);
  });
});

describe("JS chapitre 8 — etape 2 (identifier la source)", () => {
  const valider = validators[1];

  const CODE = `document.querySelectorAll("button").forEach((b) => {
  b.addEventListener("click", (e) => console.log(e.target.id));
});
document.getElementById("b2").click();`;

  it("valide un clic sur b2 qui logue son identifiant", () => {
    expect(valider(CODE, ctx(["b2"])).ok).toBe(true);
  });

  it("refuse une sortie qui n'est pas l'identifiant clique", () => {
    expect(valider(CODE, ctx(["b1"])).ok).toBe(false);
  });

  it("refuse l'absence de listener click", () => {
    const code = `console.log("b2");`;
    expect(valider(code, ctx(["b2"])).ok).toBe(false);
  });
});

describe("JS chapitre 8 — etape 3 (suivre la saisie)", () => {
  const valider = validators[2];

  const CODE = `const champ = document.querySelector("input");
champ.addEventListener("input", (e) => console.log("Salut " + e.target.value));
champ.value = "Luna";
champ.dispatchEvent(new Event("input"));`;

  it("valide un listener input qui reprend la valeur saisie", () => {
    expect(valider(CODE, ctx(["Salut Luna"])).ok).toBe(true);
  });

  it("refuse un listener click a la place d'input", () => {
    // Echec cible : ce n'est pas le meme evenement, ni le meme moment.
    const code = `const champ = document.querySelector("input");
champ.addEventListener("click", () => console.log("Salut Luna"));
champ.click();`;
    expect(valider(code, ctx(["Salut Luna"])).ok).toBe(false);
  });

  it("refuse une sortie qui ne reprend pas la saisie", () => {
    expect(valider(CODE, ctx(["Salut"])).ok).toBe(false);
  });
});

describe("JS chapitre 8 — etape 4 (soumission maitrisee)", () => {
  const valider = validators[3];

  const CODE = `const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Code : secret");
});
form.dispatchEvent(new Event("submit"));`;

  it("valide un submit intercepte et marque l'etape finale", () => {
    const r = valider(CODE, ctx(["Code : secret"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse un submit sans preventDefault", () => {
    // Echec cible : sans lui, la page se recharge et le JS ne sert a rien.
    const code = `const form = document.querySelector("form");
form.addEventListener("submit", () => console.log("Code : secret"));
form.dispatchEvent(new Event("submit"));`;
    expect(valider(code, ctx(["Code : secret"])).ok).toBe(false);
  });

  it("refuse un listener click a la place de submit", () => {
    const code = `const bouton = document.querySelector("button");
bouton.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Code : secret");
});
bouton.click();`;
    expect(valider(code, ctx(["Code : secret"])).ok).toBe(false);
  });
});
