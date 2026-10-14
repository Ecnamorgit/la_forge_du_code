import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: BrowserRouter and two Route path/element
  (code) => {
    const c = strip(code);
    if (!/<BrowserRouter>/.test(c)) {
      return fail("Englobe ton app dans <BrowserRouter>.");
    }
    if (countMatches(c, /<Route\s+path=/) < 2 || !/element=\{/.test(c)) {
      return fail("Définis deux <Route path='...' element={...} /> (Accueil et APropos).");
    }
    return pass("Routes actives.", ["o1a", "o1b"]);
  },
  // Step 2: Link import and two <Link to=...> inside a <nav>
  (code) => {
    const c = strip(code);
    if (!/import\s*\{[^}]*\bLink\b[^}]*\}\s*from\s*['"]react-router-dom['"]/.test(c)) {
      return fail("Importe Link depuis 'react-router-dom'.");
    }
    if (!/<nav>/.test(c) || countMatches(c, /<Link\s+to=/) < 2) {
      return fail("Ajoute deux <Link to='...'> dans un <nav> (pas de <a href>).");
    }
    return pass("Navigation fluide.", ["o2a", "o2b"]);
  },
  // Step 3: dynamic :id route and useParams
  (code) => {
    const c = strip(code);
    // The <Route path="/vaisseaux/:id"> lives in App (shown as a comment
    // in the startCode): the signal we can check here is reading the param.
    if (!/useParams\s*\(\s*\)/.test(c)) {
      return fail("Récupère les params de l'URL avec const { id } = useParams().");
    }
    // Remove the destructuring before looking for the display: it is itself
    // written `{ id }` and would pass code that never renders the param.
    const withoutDestructuring = c.replace(
      /(?:const|let|var)\s*\{\s*id\s*\}\s*=\s*useParams\s*\(\s*\)\s*;?/,
      ""
    );
    if (!/\{\s*id\s*\}/.test(withoutDestructuring)) {
      return fail("Affiche l'id lu depuis l'URL : <div>Vaisseau : {id}</div>.");
    }
    return pass("URL décodée.", ["o3a", "o3b"]);
  },
  // Step 4: useNavigate and navigate('/dashboard')
  (code) => {
    const c = strip(code);
    if (!/useNavigate\s*\(\s*\)/.test(c)) {
      return fail("Récupère la fonction via const navigate = useNavigate();");
    }
    if (!/navigate\s*\(\s*['"]\/dashboard['"]\s*\)/.test(c)) {
      return fail("Au clic, redirige avec navigate('/dashboard').");
    }
    return pass("SPA maîtrisée.", ["o4a", "o4b"], true);
  },
];
