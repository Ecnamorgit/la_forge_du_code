import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, countMatches, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Étape 1 : BrowserRouter et deux Route path/element
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
  // Étape 2 : import de Link et deux <Link to=...> dans une <nav>
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
  // Étape 3 : route dynamique :id et useParams
  (code) => {
    const c = strip(code);
    // La <Route path="/vaisseaux/:id"> vit dans App (indiquée en commentaire
    // dans le startCode) : le signal vérifiable ici est la lecture du paramètre.
    if (!/useParams\s*\(\s*\)/.test(c)) {
      return fail("Recupere les params de l'URL avec const { id } = useParams().");
    }
    // On retire la déstructuration avant de chercher l'affichage : elle s'écrit
    // elle-même `{ id }` et validerait un code qui ne rend jamais le paramètre.
    const sansDestructuration = c.replace(
      /(?:const|let|var)\s*\{\s*id\s*\}\s*=\s*useParams\s*\(\s*\)\s*;?/,
      ""
    );
    if (!/\{\s*id\s*\}/.test(sansDestructuration)) {
      return fail("Affiche l'id lu depuis l'URL : <div>Vaisseau : {id}</div>.");
    }
    return pass("URL decodee.", ["o3a", "o3b"]);
  },
  // Étape 4 : useNavigate et navigate('/dashboard')
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
