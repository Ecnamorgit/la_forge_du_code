import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Node.js chapitre 1 — etapes 2 a 4.
 *
 * L'etape 1 est deja couverte par `lib/validators/all-chapter-1.test.ts`.
 */

describe("Node.js — etape 2 (route GET /ping)", () => {
  const valider = validators[1];

  it("accepte une route /ping qui repond en JSON", () => {
    const code = `app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une route /ping qui repond en texte brut", () => {
    // Echec cible : la route existe, la reponse n'est pas celle demandee.
    const code = `app.get('/ping', (req, res) => {
  res.send('ok');
});`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une route sur un autre chemin", () => {
    const code = `app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("Node.js — etape 3 (middleware JSON et POST)", () => {
  const valider = validators[2];

  it("accepte express.json() et un POST qui repond 201", () => {
    const code = `app.use(express.json());
app.post('/vaisseaux', (req, res) => {
  res.status(201).json(req.body);
});`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un POST sans le middleware qui lit le corps", () => {
    const code = `app.post('/vaisseaux', (req, res) => {
  res.status(201).json(req.body);
});`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un POST qui repond 200 au lieu de 201", () => {
    // Echec cible : creer une ressource se signale par un 201.
    const code = `app.use(express.json());
app.post('/vaisseaux', (req, res) => {
  res.status(200).json(req.body);
});`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("Node.js — etape 4 (route dynamique et 404)", () => {
  const valider = validators[3];

  it("accepte une route parametree qui gere l'absence", () => {
    const code = `app.get('/vaisseaux/:id', (req, res) => {
  const v = trouver(req.params.id);
  if (!v) return res.status(404).json({ erreur: 'inconnu' });
  res.json(v);
});`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une route parametree sans cas d'absence", () => {
    // Echec cible : c'est le 404 qui distingue une API correcte.
    const code = `app.get('/vaisseaux/:id', (req, res) => {
  res.json(trouver(req.params.id));
});`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une route figee, sans parametre", () => {
    const code = `app.get('/vaisseaux', (req, res) => {
  res.status(404).json({ erreur: 'inconnu' });
});`;
    expect(valider(code).ok).toBe(false);
  });
});
