import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass, findCallBody, isFollowedByCall, hasEmptyLengthCheck } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

// Callback de .map() qui retourne du JSX, en flèche directe (`v => <li>...`)
// ou en bloc avec return (`v => { ... return <li>...; }`).
const arrowJsxRe = /=>\s*\(?\s*<[A-Za-z]/;
const blockReturnJsxRe = /=>\s*\{[\s\S]*?return\s*\(?\s*<[A-Za-z]/;

/**
 * Vrai si au moins un appel `.map(...)` du code a un callback qui retourne du
 * JSX. Tous les appels sont examinés : un `.map()` sans rapport avec le rendu
 * ne doit pas masquer le bon.
 */
function findMapCallbackReturningJsx(code: string): boolean {
  let match = findCallBody(code, "map");
  while (match) {
    if (arrowJsxRe.test(match.body) || blockReturnJsxRe.test(match.body)) {
      return true;
    }
    match = findCallBody(code, "map", match.end);
  }
  return false;
}

export const validators: Validator[] = [
  // Étape 1 : flotte.map(...) dont le callback retourne du JSX
  (code) => {
    const c = strip(code);
    if (!findCallBody(c, "map")) {
      return fail("Utilise .map() sur le tableau flotte pour générer la liste, au lieu de recopier chaque <li> à la main.");
    }
    // Seuls les callbacks de .map() comptent : un composant sans rapport qui
    // retourne du JSX (`const Debug = () => <span/>`) ne doit pas faire passer un
    // .map() qui ne retourne que du texte.
    if (!findMapCallbackReturningJsx(c)) {
      return fail("Le callback de .map() doit retourner un élément JSX, par exemple v => <li>{v.nom}</li>.");
    }
    return pass("Flotte affichée dynamiquement.", ["o1a", "o1b"]);
  },
  // Étape 2 : une prop key={...} qui n'est pas simplement l'index
  (code) => {
    const c = strip(code);
    const keyMatches = [...c.matchAll(/key=\{([^}]*)\}/g)];
    if (keyMatches.length === 0) {
      return fail("Ajoute une prop key={...} sur l'élément racine retourné par map (ex: <li key={v.id}>).");
    }
    const usesIndexOnly = keyMatches.some((m) => /^\s*(index|i|idx)\s*$/.test(m[1]));
    if (usesIndexOnly) {
      return fail(
        "N'utilise pas l'index du tableau comme key (key={index} ou key={i}) : dès que la flotte bouge, React perd le fil. Utilise un identifiant stable comme v.id."
      );
    }
    return pass("Chaque vaisseau garde une identité stable.", ["o2a", "o2b"]);
  },
  // Étape 3 : .map() chaîné directement après un .filter(...), pas seulement
  // présent plus loin dans le fichier.
  (code) => {
    const c = strip(code);
    let filterMatch = findCallBody(c, "filter");
    if (!filterMatch) {
      return fail("Filtre le tableau avec .filter() avant de le transformer en JSX : flotte.filter(...).map(...).");
    }
    let isChained = false;
    while (filterMatch) {
      if (isFollowedByCall(c, filterMatch.end, "map")) {
        isChained = true;
        break;
      }
      filterMatch = findCallBody(c, "filter", filterMatch.end);
    }
    if (!isChained) {
      return fail("Chaîne .map() APRÈS .filter(), dans cet ordre : flotte.filter(v => ...).map(v => ...).");
    }
    return pass("Flotte filtrée puis affichée.", ["o3a", "o3b"]);
  },
  // Étape 4 : test de longueur sur la collection filtrée (`operationnels`) et
  // branche JSX alternative.
  (code) => {
    const c = strip(code);
    // `operationnels` est le nom imposé par le startCode et les objectifs de
    // l'étape. Accepter un test sur n'importe quelle variable (`flotte`, jamais
    // vide ici) validerait une branche qui ne se déclenche jamais.
    const hasLengthTest = hasEmptyLengthCheck(c, "operationnels");
    if (!hasLengthTest) {
      return fail("Teste la longueur du tableau (ex: operationnels.length === 0) pour détecter une liste vide.");
    }
    // La branche vide doit afficher un message, pas un simple `return null` :
    // on cherche un élément court (p, div, span, hN) qui contient du texte.
    const hasMessageJsx = /<(p|div|span|h[1-6])\b[^>]*>[^<]*[A-Za-z][^<]*<\/\1>/.test(c);
    if (!hasMessageJsx) {
      return fail(
        "Quand la liste est vide, affiche un message à la place (ex: <p>Aucun vaisseau operationnel.</p>), pas un return null silencieux."
      );
    }
    return pass("Flotte cartographiée, même à zéro unité.", ["o4a", "o4b"], true);
  },
];
