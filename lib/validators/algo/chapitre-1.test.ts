import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Algorithmique chapitre 1 — étapes 2 à 4.
 *
 * L'étape 1 est déjà couverte par `lib/validators/all-chapter-1.test.ts`.
 */

describe("Algo — etape 2 (recherche dichotomique)", () => {
  const validate = validators[1];

  it("accepte une dichotomie complete", () => {
    const code = `function rechercher(tab, cible) {
  let debut = 0, fin = tab.length - 1;
  while (debut <= fin) {
    const milieu = Math.floor((debut + fin) / 2);
    if (tab[milieu] === cible) return milieu;
    if (tab[milieu] < cible) debut = milieu + 1;
    else fin = milieu - 1;
  }
  return -1;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("refuse une recherche lineaire, sans boucle while", () => {
    const code = `function rechercher(tab, cible) {
  for (let i = 0; i < tab.length; i++) {
    if (tab[i] === cible) return i;
  }
  return -1;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("refuse une dichotomie qui ne signale pas l'absence", () => {
    // Échec ciblé : la boucle et le milieu sont là, le retour -1 manque.
    const code = `function rechercher(tab, cible) {
  let debut = 0, fin = tab.length - 1;
  while (debut <= fin) {
    const milieu = Math.floor((debut + fin) / 2);
    if (tab[milieu] === cible) return milieu;
    debut = milieu + 1;
  }
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Algo — etape 3 (tri a bulles)", () => {
  const validate = validators[2];

  it("accepte deux boucles imbriquees et un echange par destructuring", () => {
    const code = `function trier(a) {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
    }
  }
  return a;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("refuse une seule boucle", () => {
    const code = `function trier(a) {
  for (let j = 0; j < a.length - 1; j++) {
    [a[j], a[j + 1]] = [a[j + 1], a[j]];
  }
  return a;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("refuse un echange par variable temporaire", () => {
    // Échec ciblé : l'étape enseigne la déstructuration, pas le tri en général.
    const code = `function trier(a) {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - 1; j++) {
      if (a[j] > a[j + 1]) {
        const tmp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = tmp;
      }
    }
  }
  return a;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Algo — etape 4 (Fibonacci, deux versions)", () => {
  const validate = validators[3];

  const RECURSIVE = `function fiboRecursif(n) {
  if (n <= 1) return n;
  return fiboRecursif(n - 1) + fiboRecursif(n - 2);
}`;

  const ITERATIVE = `function fiboIteratif(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) { [a, b] = [b, a + b]; }
  return a;
}`;

  it("accepte les deux implementations cote a cote", () => {
    expect(validate(`${RECURSIVE}\n${ITERATIVE}`).ok).toBe(true);
  });

  it("refuse la version recursive seule", () => {
    expect(validate(RECURSIVE).ok).toBe(false);
  });

  it("refuse une version iterative sans boucle", () => {
    // Échec ciblé : la fonction existe mais n'itère pas.
    const noLoop = `function fiboIteratif(n) { return n <= 1 ? n : null; }`;
    expect(validate(`${RECURSIVE}\n${noLoop}`).ok).toBe(false);
  });
});
