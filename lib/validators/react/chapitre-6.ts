import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

// ---------------------------------------------------------------------------
// Helpers locaux, scopes a ce fichier.
//
// _static-utils expose des helpers pour des APPELS de methode (`.map(...)`),
// mais rien pour une prop JSX (`onChange={...}`) : la syntaxe est differente
// (accolades, pas parentheses) et une prop peut contenir une fleche qui
// embarque elle-meme un `=>`, donc un `>` — un `[^>]*` naif couperait la
// balise en plein milieu de `(e) => setNom(...)`. D'ou les deux scanners
// ci-dessous, qui equilibrent les accolades et ignorent les chaines, plutot
// qu'une regex globale sur tout le fichier.
// ---------------------------------------------------------------------------

function skipString(code: string, start: number, quote: string): number {
  let i = start + 1;
  while (i < code.length) {
    if (code[i] === "\\") {
      i += 2;
      continue;
    }
    if (code[i] === quote) return i;
    i++;
  }
  return i;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Localise une balise JSX `<tagName ...>` (ouvrante ou auto-fermante) et
 * renvoie le texte de ses attributs, en equilibrant les accolades `{ }` (et
 * en ignorant '..' , "..", `..`) pour qu'un `>` a l'interieur d'une fleche
 * (`onChange={(e) => ...}`) ne termine pas la balise trop tot.
 *
 * Limite : un scanner heuristique, pas un parseur JSX. Ne gere pas un enfant
 * JSX passe en valeur de prop avant la fin de la balise ciblee. Suffisant
 * pour reperer LA balise <input>/<form>/<button> unique de ces exercices.
 */
function findJsxTagAttrs(
  code: string,
  tagName: string,
  fromIndex = 0
): { body: string; start: number; end: number } | null {
  const openRe = new RegExp(`<${tagName}\\b`);
  const rel = code.slice(fromIndex).search(openRe);
  if (rel === -1) return null;
  const start = fromIndex + rel;
  let i = start + tagName.length + 1;
  let depth = 0;
  while (i < code.length) {
    const ch = code[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipString(code, i, ch) + 1;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (ch === ">" && depth === 0) {
      return { body: code.slice(start, i + 1), start, end: i + 1 };
    }
    i++;
  }
  return null;
}

/**
 * Extrait le contenu entre accolades d'une prop JSX `attrName={ ... }`, en
 * equilibrant les accolades internes (fleche avec corps bloc, objet litteral
 * imbrique...). Renvoie null si la prop est absente de `tagBody`.
 */
function extractAttrValue(tagBody: string, attrName: string): string | null {
  const marker = new RegExp(`\\b${escapeRegExp(attrName)}\\s*=\\s*\\{`);
  const m = marker.exec(tagBody);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < tagBody.length && depth > 0) {
    const ch = tagBody[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipString(tagBody, i, ch) + 1;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  return tagBody.slice(start, i - 1);
}

/**
 * Trouve la prochaine occurrence d'un appel de fonction BARE (pas de `.` qui
 * precede, contrairement a `findCallBody` de _static-utils qui cible
 * specifiquement `.methodName(...)`) — utile ici pour `setFormulaire(...)`,
 * qui est un appel de fonction directe, pas une methode d'objet. Equilibre
 * les parentheses et ignore les chaines, pour capturer tout l'argument meme
 * s'il contient lui-meme des parentheses (ex: une fleche `(prev) => ({...})`).
 *
 * Appeler avec `fromIndex = match.end` pour iterer sur toutes les occurrences,
 * comme pour `findCallBody`.
 */
function findBareCallBody(
  code: string,
  fnName: string,
  fromIndex = 0
): { body: string; start: number; end: number } | null {
  const nameRe = new RegExp(`\\b${escapeRegExp(fnName)}\\s*\\(`);
  let searchFrom = fromIndex;
  while (searchFrom <= code.length) {
    const rel = code.slice(searchFrom).search(nameRe);
    if (rel === -1) return null;
    const m = nameRe.exec(code.slice(searchFrom));
    const start = searchFrom + rel;
    const openIdx = start + (m ? m[0].length - 1 : 0);
    let depth = 0;
    let i = openIdx;
    let closeIdx = -1;
    for (; i < code.length; i++) {
      const ch = code[i];
      if (ch === "'" || ch === '"' || ch === "`") {
        i = skipString(code, i, ch);
        continue;
      }
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          closeIdx = i;
          break;
        }
      }
    }
    if (closeIdx === -1) {
      searchFrom = openIdx + 1;
      continue;
    }
    return { body: code.slice(openIdx + 1, closeIdx), start, end: closeIdx + 1 };
  }
  return null;
}

/**
 * Retrouve le corps d'une fonction NOMMEE (declaration `function nom(...) {}`
 * ou `const nom = (...) => {}` / `const nom = function(...) {}`), en
 * equilibrant les accolades. Sert a suivre `onSubmit={handleSubmit}` jusqu'a
 * la definition de `handleSubmit` quand la prop ne contient qu'un identifiant
 * plutot qu'une fleche inline.
 *
 * Limite : ne resout qu'UN niveau d'indirection (pas de handler qui renvoie
 * lui-meme une autre fonction), et suppose un corps de bloc `{ ... }` — un
 * corps expression sans accolades (`const f = (e) => e.preventDefault()`)
 * n'est pas suivi par ce helper.
 */
function findNamedFunctionBody(code: string, name: string): string | null {
  const n = escapeRegExp(name);
  let m = new RegExp(`function\\s+${n}\\s*\\([^)]*\\)\\s*\\{`).exec(code);
  if (!m) {
    m = new RegExp(
      `(?:const|let|var)\\s+${n}\\s*=\\s*(?:function\\s*)?\\([^)]*\\)\\s*(?:=>)?\\s*\\{`
    ).exec(code);
  }
  if (!m) return null;
  const braceStart = m.index + m[0].length - 1;
  let depth = 0;
  let i = braceStart;
  for (; i < code.length; i++) {
    const ch = code[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipString(code, i, ch);
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  return code.slice(braceStart + 1, i);
}

export const validators: Validator[] = [
  // Step 1 (piege Spectre): <input value={...} onChange={...}> avec un
  // setter appele DANS le handler onChange (pas juste "value= et onChange=
  // presents quelque part dans le fichier").
  (code) => {
    const c = strip(code);
    const tag = findJsxTagAttrs(c, "input");
    if (!tag || !/\bvalue\s*=\s*\{/.test(tag.body)) {
      return fail(
        "Garde l'input controle par React : value={nom} doit rester branche sur l'etat."
      );
    }
    const onChangeValue = extractAttrValue(tag.body, "onChange");
    if (onChangeValue === null) {
      return fail(
        "Le Spectre a coupe l'ecoute du clavier : ajoute onChange={(e) => setNom(e.target.value)} sur l'input."
      );
    }
    if (!/\bset[A-Z]\w*\s*\(/.test(onChangeValue)) {
      return fail(
        "Ton onChange existe mais ne met a jour aucun etat : appelle le setter (ex: setNom(e.target.value)) a l'interieur."
      );
    }
    return pass("Console de saisie restauree.", ["o1a", "o1b"]);
  },

  // Step 2: useState({ ... }) + mise a jour par spread, avec soit une cle
  // calculee ([name]: value), soit les deux champs geres separement (mais
  // toujours via spread, jamais en ecrasant l'objet).
  (code) => {
    const c = strip(code);
    if (!/useState\s*\(\s*\{/.test(c)) {
      return fail(
        "Regroupe nom et email dans un seul etat objet : useState({ nom: '', email: '' })."
      );
    }
    let match = findBareCallBody(c, "setFormulaire");
    if (!match) {
      return fail(
        "Mets a jour l'etat via le setter de l'objet (setFormulaire({ ...formulaire, ... }))."
      );
    }
    let hasSpread = false;
    let hasComputedKey = false;
    const literalKeys = new Set<string>();
    while (match) {
      if (/\.\.\.\s*[A-Za-z_$][\w$]*/.test(match.body)) hasSpread = true;
      if (/\[\s*[\w.]+\s*\]\s*:/.test(match.body)) hasComputedKey = true;
      for (const m of match.body.matchAll(/\b(nom|email)\s*:/g)) {
        literalKeys.add(m[1]);
      }
      match = findBareCallBody(c, "setFormulaire", match.end);
    }
    if (!hasSpread) {
      return fail(
        "Mets a jour l'etat par copie : setFormulaire({ ...formulaire, ... }), jamais en ecrasant l'objet entier."
      );
    }
    if (!hasComputedKey && literalKeys.size < 2) {
      return fail(
        "Mets a jour le bon champ : une cle calculee ([e.target.name]: valeur), ou nom et email geres separement."
      );
    }
    return pass("Etat regroupe dans un seul objet.", ["o2a", "o2b"]);
  },

  // Step 3: onSubmit doit etre sur le <form> (pas onClick sur le bouton), et
  // le handler qu'il designe (inline ou par reference nommee) doit appeler
  // e.preventDefault().
  (code) => {
    const c = strip(code);
    const formTag = findJsxTagAttrs(c, "form");
    if (!formTag || !/\bonSubmit\s*=\s*\{/.test(formTag.body)) {
      return fail(
        "Attache le gestionnaire de soumission sur le <form> lui-meme (onSubmit={...}), pas sur le bouton."
      );
    }
    const onSubmitValue = extractAttrValue(formTag.body, "onSubmit") ?? "";
    let handlerSource = onSubmitValue;
    const identMatch = /^\s*([A-Za-z_$][\w$]*)\s*$/.exec(onSubmitValue);
    if (identMatch) {
      const fnBody = findNamedFunctionBody(c, identMatch[1]);
      if (fnBody !== null) handlerSource = fnBody;
    }
    if (!/\.preventDefault\s*\(\s*\)/.test(handlerSource)) {
      return fail(
        "Empeche le rechargement de la page : appelle e.preventDefault() dans le gestionnaire attache a onSubmit."
      );
    }
    return pass("Transmission maitrisee.", ["o3a", "o3b"]);
  },

  // Step 4: disabled doit etre une expression derivee de l'etat formulaire,
  // pas une valeur figee (true/false ou toute autre valeur arbitraire).
  (code) => {
    const c = strip(code);
    const buttonTag = findJsxTagAttrs(c, "button");
    if (!buttonTag || !/\bdisabled\s*=\s*\{/.test(buttonTag.body)) {
      return fail("Ajoute un attribut disabled={...} sur le bouton d'envoi.");
    }
    const value = (extractAttrValue(buttonTag.body, "disabled") ?? "").trim();
    if (/^(true|false)$/.test(value)) {
      return fail(
        "disabled={false} (ou {true}) est fige : calcule la condition a partir de l'etat, ex: disabled={!formulaire.nom || !formulaire.email}."
      );
    }
    if (!/\bformulaire\b/.test(value)) {
      return fail(
        "La condition de disabled doit deriver de l'etat du formulaire (formulaire.nom, formulaire.email...), pas d'une valeur arbitraire."
      );
    }
    return pass("Console verrouillee tant que le formulaire est incomplet.", ["o4a", "o4b"], true);
  },
];
