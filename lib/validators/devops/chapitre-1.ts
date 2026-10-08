import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "#");

export const validators: Validator[] = [
  // Étape 1 : npm run build puis preview
  (code) => {
    const c = strip(code);
    if (!/npm\s+run\s+build/.test(c)) {
      return fail("Lance le build de production : npm run build.");
    }
    if (!/(npm\s+run\s+preview|vite\s+preview)/.test(c)) {
      return fail("Teste le bundle en local : npm run preview.");
    }
    return pass("Bundle pret.", ["o1a", "o1b"]);
  },
  // Étape 2 : CLI Vercel installée globalement, puis vercel login
  (code) => {
    const c = strip(code);
    if (!/npm\s+install\s+-g\s+vercel/.test(c)) {
      return fail("Installe la CLI : npm install -g vercel.");
    }
    if (!/vercel\s+login/.test(c)) {
      return fail("Connecte-toi puis deploie (vercel login, puis vercel).");
    }
    return pass("En ligne.", ["o2a", "o2b"]);
  },
  // Étape 3 : .env, .gitignore et .env.example. Les lignes `#` sont ici des
  // libellés attendus dans la réponse, on ne les retire pas ; `.env.local`
  // n'apparaît que dans un vrai .gitignore, jamais dans les consignes.
  (code) => {
    if (!/API_URL\s*=/.test(code) || !/DB_PASSWORD\s*=/.test(code)) {
      return fail("Cree un .env avec API_URL=... et DB_PASSWORD=...");
    }
    if (!/\.env\.local/.test(code)) {
      return fail("Ignore les .env dans .gitignore (.env, .env.local, .env.*.local).");
    }
    if (!/\.env\.example/.test(code)) {
      return fail("Cree aussi un .env.example (commite) sans les vraies valeurs.");
    }
    return pass("Config securisee.", ["o3a", "o3b"]);
  },
  // Étape 4 : Dockerfile (FROM, WORKDIR, COPY/RUN, EXPOSE, CMD)
  (code) => {
    const c = strip(code);
    const dockerfileOk =
      /FROM\s+node:20-alpine/i.test(c) &&
      /WORKDIR\s+\/app/i.test(c) &&
      /EXPOSE\s+3000/i.test(c) &&
      /CMD\s*\[/i.test(c);
    if (!dockerfileOk) {
      return fail("Ecris le Dockerfile : FROM node:20-alpine, WORKDIR /app, EXPOSE 3000, CMD [...].");
    }
    if (!/COPY/i.test(c) || !/RUN\s+npm\s+(ci|install)/i.test(c)) {
      return fail("N'oublie pas COPY package*.json puis RUN npm ci, et COPY . .");
    }
    return pass("Mission accomplie.", ["o4a", "o4b"], true);
  },
];
