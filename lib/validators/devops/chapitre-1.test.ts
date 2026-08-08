import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * DevOps chapitre 1 — etapes 2 a 4.
 *
 * L'etape 1 est deja couverte par `lib/validators/all-chapter-1.test.ts`.
 *
 * Attention : l'etape 3 ne retire PAS les commentaires `#`, car dans un
 * .gitignore ce sont des libelles de section qui font partie de la reponse
 * attendue. Les tests l'exercent avec de vrais commentaires.
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
    // Echec cible : l'etape enseigne l'installation globale (-g).
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
    // Echec cible : c'est l'oubli qui fuite les secrets.
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
    // Echec cible : toutes les directives sont la sauf le RUN npm ci.
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
