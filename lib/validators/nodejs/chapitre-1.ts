import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Étape 1 : app express qui écoute le port 3000
  (code) => {
    const c = strip(code);
    if (!/(import\s+express|require\s*\(\s*['"]express['"]\s*\))/.test(c) || !/express\s*\(\s*\)/.test(c)) {
      return fail("Importe express et cree une app : const app = express();");
    }
    if (!/\.listen\s*\(\s*3000/.test(c)) {
      return fail("Fais ecouter le serveur sur le port 3000 : app.listen(3000, ...).");
    }
    return pass("Serveur en ligne.", ["o1a", "o1b"]);
  },
  // Étape 2 : GET /ping qui répond res.json({ status: 'ok' })
  (code) => {
    const c = strip(code);
    if (!/\.get\s*\(\s*['"]\/ping['"]/.test(c)) {
      return fail("Definis une route GET sur /ping : app.get('/ping', ...).");
    }
    if (!/res\.json\s*\(\s*\{[^}]*status[^}]*['"]ok['"]/.test(c)) {
      return fail("Reponds avec res.json({ status: 'ok' }).");
    }
    return pass("Ping actif.", ["o2a", "o2b"]);
  },
  // Étape 3 : middleware express.json() et POST /vaisseaux en 201
  (code) => {
    const c = strip(code);
    if (!/app\.use\s*\(\s*express\.json\s*\(\s*\)/.test(c)) {
      return fail("Active le middleware : app.use(express.json());");
    }
    if (!/\.post\s*\(\s*['"]\/vaisseaux['"]/.test(c) || !/status\s*\(\s*201\s*\)/.test(c)) {
      return fail("Ajoute app.post('/vaisseaux', ...) et reponds avec status(201).");
    }
    return pass("Requete traitee.", ["o3a", "o3b"]);
  },
  // Étape 4 : GET /vaisseaux/:id via req.params, avec un cas 404
  (code) => {
    const c = strip(code);
    if (!/\.get\s*\(\s*['"]\/vaisseaux\/:id['"]/.test(c)) {
      return fail("Definis une route dynamique : app.get('/vaisseaux/:id', ...).");
    }
    if (!/req\.params/.test(c) || !/status\s*\(\s*404\s*\)/.test(c)) {
      return fail("Lis req.params.id et renvoie un status(404) si l'id est inconnu.");
    }
    return pass("API operationnelle.", ["o4a", "o4b"], true);
  },
];
