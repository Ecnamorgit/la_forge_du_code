import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Node.js chapter 1 — steps 2 to 4.
 *
 * Step 1 is already covered by `lib/validators/all-chapter-1.test.ts`.
 */

describe("Node.js — step 2 (GET /ping route)", () => {
  const validate = validators[1];

  it("accepts a /ping route that responds with JSON", () => {
    const code = `app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a /ping route that responds with plain text", () => {
    // Targeted failure: the route exists, but the response is not the one requested.
    const code = `app.get('/ping', (req, res) => {
  res.send('ok');
});`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a route on another path", () => {
    const code = `app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Node.js — step 3 (JSON middleware and POST)", () => {
  const validate = validators[2];

  it("accepts express.json() and a POST that responds 201", () => {
    const code = `app.use(express.json());
app.post('/vaisseaux', (req, res) => {
  res.status(201).json(req.body);
});`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a POST without the middleware that reads the body", () => {
    const code = `app.post('/vaisseaux', (req, res) => {
  res.status(201).json(req.body);
});`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a POST that responds 200 instead of 201", () => {
    // Targeted failure: creating a resource is signalled with a 201.
    const code = `app.use(express.json());
app.post('/vaisseaux', (req, res) => {
  res.status(200).json(req.body);
});`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Node.js — step 4 (dynamic route and 404)", () => {
  const validate = validators[3];

  it("accepts a parameterised route that handles a missing item", () => {
    const code = `app.get('/vaisseaux/:id', (req, res) => {
  const v = trouver(req.params.id);
  if (!v) return res.status(404).json({ erreur: 'inconnu' });
  res.json(v);
});`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a parameterised route with no missing-item case", () => {
    // Targeted failure: the 404 is what sets a correct API apart.
    const code = `app.get('/vaisseaux/:id', (req, res) => {
  res.json(trouver(req.params.id));
});`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a fixed route, with no parameter", () => {
    const code = `app.get('/vaisseaux', (req, res) => {
  res.status(404).json({ erreur: 'inconnu' });
});`;
    expect(validate(code).ok).toBe(false);
  });
});
