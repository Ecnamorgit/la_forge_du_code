import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Algorithmique chapitre 1 — etapes 2 a 4.
 *
 * L'etape 1 est deja couverte par `lib/validators/all-chapter-1.test.ts`.
 */

describe("Algo — etape 2 (recherche dichotomique)", () => {
  const valider = validators[1];

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
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une recherche lineaire, sans boucle while", () => {
    const code = `function rechercher(tab, cible) {
  for (let i = 0; i < tab.length; i++) {
    if (tab[i] === cible) return i;
  }
  return -1;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une dichotomie qui ne signale pas l'absence", () => {
    // Echec cible : la boucle et le milieu sont la, le retour -1 manque.
    const code = `function rechercher(tab, cible) {
  let debut = 0, fin = tab.length - 1;
  while (debut <= fin) {
    const milieu = Math.floor((debut + fin) / 2);
    if (tab[milieu] === cible) return milieu;
    debut = milieu + 1;
  }
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("Algo — etape 3 (tri a bulles)", () => {
  const valider = validators[2];

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
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une seule boucle", () => {
    const code = `function trier(a) {
  for (let j = 0; j < a.length - 1; j++) {
    [a[j], a[j + 1]] = [a[j + 1], a[j]];
  }
  return a;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un echange par variable temporaire", () => {
    // Echec cible : l'etape enseigne le destructuring, pas le tri en general.
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
    expect(valider(code).ok).toBe(false);
  });
});

describe("Algo — etape 4 (Fibonacci, deux versions)", () => {
  const valider = validators[3];

  const RECURSIF = `function fiboRecursif(n) {
  if (n <= 1) return n;
  return fiboRecursif(n - 1) + fiboRecursif(n - 2);
}`;

  const ITERATIF = `function fiboIteratif(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) { [a, b] = [b, a + b]; }
  return a;
}`;

  it("accepte les deux implementations cote a cote", () => {
    expect(valider(`${RECURSIF}\n${ITERATIF}`).ok).toBe(true);
  });

  it("refuse la version recursive seule", () => {
    expect(valider(RECURSIF).ok).toBe(false);
  });

  it("refuse une version iterative sans boucle", () => {
    // Echec cible : la fonction existe mais n'itere pas.
    const sansBoucle = `function fiboIteratif(n) { return n <= 1 ? n : null; }`;
    expect(valider(`${RECURSIF}\n${sansBoucle}`).ok).toBe(false);
  });
});
