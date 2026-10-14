import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * DevOps chapter 1 — steps 2 to 4.
 *
 * Step 1 is already covered by `lib/validators/all-chapter-1.test.ts`.
 *
 * Step 3 does not strip `#` comments: in a .gitignore, they are section
 * labels that are part of the answer. The tests exercise it with real
 * comments.
 */

describe("DevOps — step 2 (Vercel deployment)", () => {
  const validate = validators[1];

  it("accepts installing the CLI followed by login", () => {
    expect(validate("npm install -g vercel\nvercel login\nvercel").ok).toBe(true);
  });

  it("rejects a deployment without installing the CLI", () => {
    expect(validate("vercel login\nvercel").ok).toBe(false);
  });

  it("rejects a local install instead of a global one", () => {
    // Targeted failure: the step teaches the global install (-g).
    expect(validate("npm install vercel\nvercel login").ok).toBe(false);
  });
});

describe("DevOps — step 3 (environment variables)", () => {
  const validate = validators[2];

  it("accepts a .env, a .gitignore and a .env.example", () => {
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
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a .env not ignored by git", () => {
    // Targeted failure: this is the omission that leaks secrets.
    const code = `# .env
API_URL=https://api.codeforge.space
DB_PASSWORD=secret

# .env.example
API_URL=
DB_PASSWORD=`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a missing .env.example", () => {
    const code = `# .env
API_URL=https://api.codeforge.space
DB_PASSWORD=secret

# .gitignore
.env
.env.local`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("DevOps — step 4 (Dockerfile)", () => {
  const validate = validators[3];

  const COMPLETE = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`;

  it("accepts a complete Dockerfile", () => {
    expect(validate(COMPLETE).ok).toBe(true);
  });

  it("rejects a Dockerfile that does not install dependencies", () => {
    // Targeted failure: every directive is there except RUN npm ci.
    const code = `FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a Dockerfile that exposes no port", () => {
    const code = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]`;
    expect(validate(code).ok).toBe(false);
  });
});
