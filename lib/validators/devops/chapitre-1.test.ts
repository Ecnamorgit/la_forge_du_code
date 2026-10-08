import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * DevOps chapitre 1 — étapes 2 à 4.
 *
 * L'étape 1 est déjà couverte par `lib/validators/all-chapter-1.test.ts`.
 *
 * L'étape 3 ne retire pas les commentaires `#` : dans un .gitignore, ce sont
 * des libellés de section qui font partie de la réponse. Les tests l'exercent
 * avec de vrais commentaires.
 */

describe("DevOps — etape 2 (deploiement Vercel)", () => {
  const valider = validators[1];

  it("accepte l'installation de la CLI suivie du login", () => {
    expect(valider("npm install -g vercel\nvercel login\nvercel").ok).toBe(true);
  });

  it("refuse un deploiement sans installer la CLI", () => {
    expect(valider("vercel login\nvercel").ok).toBe(false);
  });

  it("refuse une installation locale au lieu de globale", () => {
    // Échec ciblé : l'étape enseigne l'installation globale (-g).
    expect(valider("npm install vercel\nvercel login").ok).toBe(false);
  });
});

describe("DevOps — etape 3 (variables d'environnement)", () => {
  const valider = validators[2];

  it("accepte un .env, un .gitignore et un .env.example", () => {
    const code = `# .env
API_URL=https://api.codeforge.space
DB_PASSWORD=secret

# .gitignore
.env
.env.local
.env.*.local

# .env.example
API_URL=
DB_PASSWORD=`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un .env non ignore par git", () => {
    // Échec ciblé : c'est l'oubli qui fait fuiter les secrets.
    const code = `# .env
API_URL=https://api.codeforge.space
DB_PASSWORD=secret

# .env.example
API_URL=
DB_PASSWORD=`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse l'absence de .env.example", () => {
    const code = `# .env
API_URL=https://api.codeforge.space
DB_PASSWORD=secret

# .gitignore
.env
.env.local`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("DevOps — etape 4 (Dockerfile)", () => {
  const valider = validators[3];

  const COMPLET = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`;

  it("accepte un Dockerfile complet", () => {
    expect(valider(COMPLET).ok).toBe(true);
  });

  it("refuse un Dockerfile sans installation des dependances", () => {
    // Échec ciblé : toutes les directives sont là sauf le RUN npm ci.
    const code = `FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un Dockerfile qui n'expose aucun port", () => {
    const code = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]`;
    expect(valider(code).ok).toBe(false);
  });
});
