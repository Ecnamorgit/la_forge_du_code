import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-7";
import type { ValidatorContext } from "@/data/courses/html/types";

/**
 * JS chapitre 7 — manipulation du DOM.
 */

const ctx = (logs: string[], error: string | null = null): ValidatorContext => ({
  logs,
  error,
  lastValue: undefined,
});

describe("JS chapitre 7 — etape 1 (creer et inserer)", () => {
  const valider = validators[0];

  const CODE = `const bloc = document.createElement("div");
bloc.textContent = "Centre de commande";
document.body.appendChild(bloc);
console.log(document.body.innerHTML);`;

  it("valide une creation suivie d'une insertion", () => {
    expect(valider(CODE, ctx(["<div>Centre de commande</div>"])).ok).toBe(true);
  });

  it("refuse un innerHTML ecrit directement, sans createElement", () => {
    // Échec ciblé : le rendu est identique, la méthode enseignée est absente.
    const code = `document.body.innerHTML = "<div>Centre de commande</div>";
console.log(document.body.innerHTML);`;
    expect(valider(code, ctx(["<div>Centre de commande</div>"])).ok).toBe(false);
  });

  it("refuse un element cree mais jamais insere", () => {
    const code = `const bloc = document.createElement("div");
bloc.textContent = "Centre de commande";
console.log(bloc.outerHTML);`;
    expect(valider(code, ctx(["<div>Centre de commande</div>"])).ok).toBe(false);
  });
});

describe("JS chapitre 7 — etape 2 (liste de missions)", () => {
  const valider = validators[1];

  const CODE = `const ul = document.createElement("ul");
["A", "B", "C"].forEach((t) => {
  const li = document.createElement("li");
  li.textContent = t;
  ul.appendChild(li);
});
document.body.appendChild(ul);
console.log(document.querySelectorAll("li").length);`;

  it("valide un ul de trois li comptes en console", () => {
    expect(valider(CODE, ctx(["3"])).ok).toBe(true);
  });

  it("refuse un compte different de trois", () => {
    expect(valider(CODE, ctx(["2"])).ok).toBe(false);
  });

  it("refuse une liste construite en innerHTML", () => {
    const code = `document.body.innerHTML = "<ul><li>A</li><li>B</li><li>C</li></ul>";
console.log(document.querySelectorAll("li").length);`;
    expect(valider(code, ctx(["3"])).ok).toBe(false);
  });
});

describe("JS chapitre 7 — etape 3 (classe et contenu)", () => {
  const valider = validators[2];

  it("valide une modification de className", () => {
    const code = `const bloc = document.querySelector("div");
bloc.className = "alerte";
bloc.textContent = "ALERTE";
console.log(bloc.textContent);`;
    expect(valider(code, ctx(["ALERTE"])).ok).toBe(true);
  });

  it("accepte classList.add comme equivalent", () => {
    const code = `const bloc = document.querySelector("div");
bloc.classList.add("alerte");
bloc.textContent = "ALERTE";
console.log(bloc.textContent);`;
    expect(valider(code, ctx(["ALERTE"])).ok).toBe(true);
  });

  it("refuse un texte change sans toucher a la classe", () => {
    // Échec ciblé : l'étape porte sur la classe autant que sur le contenu.
    const code = `const bloc = document.querySelector("div");
bloc.textContent = "ALERTE";
console.log(bloc.textContent);`;
    expect(valider(code, ctx(["ALERTE"])).ok).toBe(false);
  });
});

describe("JS chapitre 7 — etape 4 (parcourir le DOM)", () => {
  const valider = validators[3];

  const CODE = `document.querySelectorAll("span").forEach((s) => console.log(s.textContent));`;

  it("valide un parcours qui logue trois spans et marque l'etape finale", () => {
    const r = valider(CODE, ctx(["A", "B", "C"]));
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse un parcours incomplet", () => {
    expect(valider(CODE, ctx(["A", "B"])).ok).toBe(false);
  });

  it("refuse un querySelector simple, qui ne prend que le premier", () => {
    const code = `console.log(document.querySelector("span").textContent);`;
    expect(valider(code, ctx(["A", "B", "C"])).ok).toBe(false);
  });
});
