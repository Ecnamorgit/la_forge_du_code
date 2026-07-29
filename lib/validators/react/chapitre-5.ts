import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: flotte.map(...) whose callback returns JSX (arrow body or block + return)
  (code) => {
    const c = strip(code);
    if (!/\.map\s*\(/.test(c)) {
      return fail("Utilise .map() sur le tableau flotte pour generer la liste, au lieu de recopier chaque <li> a la main.");
    }
    const arrowJsx = /=>\s*\(?\s*<[A-Za-z]/.test(c);
    const blockReturnJsx = /=>\s*\{[\s\S]*?return\s*\(?\s*<[A-Za-z]/.test(c);
    if (!arrowJsx && !blockReturnJsx) {
      return fail("Le callback de .map() doit retourner un element JSX, par exemple v => <li>{v.nom}</li>.");
    }
    return pass("Flotte affichee dynamiquement.", ["o1a", "o1b"]);
  },
  // Step 2: key={...} present, and not the bare index/i as the key expression
  (code) => {
    const c = strip(code);
    const keyMatches = [...c.matchAll(/key=\{([^}]*)\}/g)];
    if (keyMatches.length === 0) {
      return fail("Ajoute une prop key={...} sur l'element racine retourne par map (ex: <li key={v.id}>).");
    }
    const usesIndexOnly = keyMatches.some((m) => /^\s*(index|i|idx)\s*$/.test(m[1]));
    if (usesIndexOnly) {
      return fail(
        "N'utilise pas l'index du tableau comme key (key={index} ou key={i}) : des que la flotte bouge, React perd le fil. Utilise un identifiant stable comme v.id."
      );
    }
    return pass("Chaque vaisseau garde une identite stable.", ["o2a", "o2b"]);
  },
  // Step 3: .filter( ) must appear before .map( ) in the source
  (code) => {
    const c = strip(code);
    const filterIdx = c.search(/\.filter\s*\(/);
    if (filterIdx === -1) {
      return fail("Filtre le tableau avec .filter() avant de le transformer en JSX : flotte.filter(...).map(...).");
    }
    const mapIdx = c.search(/\.map\s*\(/);
    if (mapIdx === -1 || mapIdx < filterIdx) {
      return fail("Chaine .map() APRES .filter(), dans cet ordre : flotte.filter(v => ...).map(v => ...).");
    }
    return pass("Flotte filtree puis affichee.", ["o3a", "o3b"]);
  },
  // Step 4: a length test (=== 0 or !length) AND a distinct alternative JSX branch
  (code) => {
    const c = strip(code);
    const hasLengthTest = /\.length\s*===\s*0/.test(c) || /!\s*[\w.]+\.length\b/.test(c);
    if (!hasLengthTest) {
      return fail("Teste la longueur du tableau (ex: operationnels.length === 0) pour detecter une liste vide.");
    }
    // The empty-state branch must actually render a message, not just bail out
    // (return null). Heuristic: a short JSX element (p/div/span/hN) that wraps
    // some text, distinct from the <li> the .map() produces.
    const hasMessageJsx = /<(p|div|span|h[1-6])\b[^>]*>[^<]*[A-Za-z][^<]*<\/\1>/.test(c);
    if (!hasMessageJsx) {
      return fail(
        "Quand la liste est vide, affiche un message a la place (ex: <p>Aucun vaisseau operationnel.</p>), pas un return null silencieux."
      );
    }
    return pass("Flotte cartographiee, meme a zero unite.", ["o4a", "o4b"], true);
  },
];
