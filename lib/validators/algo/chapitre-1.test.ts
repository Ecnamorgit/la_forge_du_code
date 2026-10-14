import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Algorithms chapter 1 — steps 2 to 4.
 *
 * Step 1 is already covered by `lib/validators/all-chapter-1.test.ts`.
 */

describe("Algo — step 2 (binary search)", () => {
  const validate = validators[1];

  it("accepts a complete binary search", () => {
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

  it("rejects a linear search, with no while loop", () => {
    const code = `function rechercher(tab, cible) {
  for (let i = 0; i < tab.length; i++) {
    if (tab[i] === cible) return i;
  }
  return -1;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a binary search that does not report a missing target", () => {
    // Targeted failure: the loop and the midpoint are there, the return -1 is missing.
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

describe("Algo — step 3 (bubble sort)", () => {
  const validate = validators[2];

  it("accepts two nested loops and a swap by destructuring", () => {
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

  it("rejects a single loop", () => {
    const code = `function trier(a) {
  for (let j = 0; j < a.length - 1; j++) {
    [a[j], a[j + 1]] = [a[j + 1], a[j]];
  }
  return a;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a swap through a temporary variable", () => {
    // Targeted failure: the step teaches destructuring, not sorting in general.
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

describe("Algo — step 4 (Fibonacci, two versions)", () => {
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

  it("accepts both implementations side by side", () => {
    expect(validate(`${RECURSIVE}\n${ITERATIVE}`).ok).toBe(true);
  });

  it("rejects the recursive version alone", () => {
    expect(validate(RECURSIVE).ok).toBe(false);
  });

  it("rejects an iterative version without a loop", () => {
    // Targeted failure: the function exists but does not iterate.
    const noLoop = `function fiboIteratif(n) { return n <= 1 ? n : null; }`;
    expect(validate(`${RECURSIVE}\n${noLoop}`).ok).toBe(false);
  });
});
