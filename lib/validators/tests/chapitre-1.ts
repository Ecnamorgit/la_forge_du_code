import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: describe + it + expect(additionner(2,3)).toBe(5)
  (code) => {
    const c = strip(code);
    if (!/describe\s*\(/.test(c) || !/\bit\s*\(/.test(c)) {
      return fail("Structure ton test avec describe(...) et it(...).");
    }
    if (!/expect\s*\(\s*additionner\s*\(\s*2\s*,\s*3\s*\)\s*\)\s*\.toBe\s*\(\s*5\s*\)/.test(c)) {
      return fail("Verifie le resultat : expect(additionner(2, 3)).toBe(5).");
    }
    return pass("Test au vert.", ["o1a", "o1b"]);
  },
  // Step 2: two tests including empty-array case + toEqual
  (code) => {
    const c = strip(code);
    if (countMatches(c, /\bit\s*\(/) < 2 || !/filtrerActifs\s*\(\s*\[\s*\]\s*\)/.test(c)) {
      return fail("Ecris un test pour le cas du tableau vide : filtrerActifs([]).");
    }
    if (!/\.toEqual\s*\(/.test(c)) {
      return fail("Compare les tableaux d'objets avec toEqual(...) (pas toBe).");
    }
    return pass("Robustesse prouvee.", ["o2a", "o2b"]);
  },
  // Step 3: render + getByText + fireEvent.click
  (code) => {
    const c = strip(code);
    if (!/render\s*\(\s*<Compteur/.test(c) || !/getByText\s*\(/.test(c)) {
      return fail("Rends le composant avec render(<Compteur />) et cherche du texte avec getByText.");
    }
    if (!/fireEvent\.click\s*\(/.test(c) || !/Score : 1/.test(c)) {
      return fail("Simule un clic avec fireEvent.click et verifie 'Score : 1'.");
    }
    return pass("Interaction verifiee.", ["o3a", "o3b"]);
  },
  // Step 4: Playwright goto + click + toHaveURL
  (code) => {
    const c = strip(code);
    if (!/page\.goto\s*\(/.test(c)) {
      return fail("Visite l'URL avec await page.goto('http://localhost:3000').");
    }
    if (!/page\.click\s*\(/.test(c) || !/toHaveURL\s*\(/.test(c)) {
      return fail("Clique puis verifie l'URL avec await expect(page).toHaveURL(...).");
    }
    return pass("Pipeline complet.", ["o4a", "o4b"], true);
  },
];
