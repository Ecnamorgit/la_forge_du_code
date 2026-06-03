import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: BrowserRouter + two Route path/element
  (code) => {
    const c = strip(code);
    if (!/<BrowserRouter>/.test(c)) {
      return fail("Englobe ton app dans <BrowserRouter>.");
    }
    if (countMatches(c, /<Route\s+path=/) < 2 || !/element=\{/.test(c)) {
      return fail("Definis deux <Route path='...' element={...} /> (Accueil et APropos).");
    }
    return pass("Routes actives.", ["o1a", "o1b"]);
  },
  // Step 2: import Link + two <Link to=> in <nav>
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
  // Step 3: dynamic route :id + useParams
  (code) => {
    const c = strip(code);
    if (!/path=['"][^'"]*:id['"]/.test(c)) {
      return fail("Definis une route dynamique avec :id (path='/vaisseaux/:id').");
    }
    if (!/useParams\s*\(\s*\)/.test(c) || !/\{\s*id\s*\}/.test(c)) {
      return fail("Lis l'id avec const { id } = useParams() et affiche-le.");
    }
    return pass("URL decodee.", ["o3a", "o3b"]);
  },
  // Step 4: useNavigate + navigate('/dashboard')
  (code) => {
    const c = strip(code);
    if (!/useNavigate\s*\(\s*\)/.test(c)) {
      return fail("Recupere la fonction via const navigate = useNavigate();");
    }
    if (!/navigate\s*\(\s*['"]\/dashboard['"]\s*\)/.test(c)) {
      return fail("Au clic, redirige avec navigate('/dashboard').");
    }
    return pass("SPA maitrisee.", ["o4a", "o4b"], true);
  },
];
