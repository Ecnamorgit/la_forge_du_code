import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-12";

/**
 * JS chapitre 12 — CRUD complet sur une API REST.
 *
 * Validateurs statiques, comme au chapitre 11 : l'hôte est fictif.
 */

describe("JS chapitre 12 — etape 1 (lire la flotte)", () => {
  const valider = validators[0];

  it("valide un GET verifie et logue", () => {
    const code = `const response = await fetch('https://api.codeforge.space/vaisseaux');
if (response.ok) {
  console.log(await response.json());
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un GET explicite avec des options", () => {
    // Échec ciblé : l'étape enseigne que GET est le comportement par défaut.
    const code = `const response = await fetch('https://api.codeforge.space/vaisseaux', { method: 'GET' });
if (response.ok) {
  console.log(await response.json());
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un appel dont on ne verifie pas le statut", () => {
    const code = `const response = await fetch('https://api.codeforge.space/vaisseaux');
console.log(await response.json());`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("JS chapitre 12 — etape 2 (creer)", () => {
  const valider = validators[1];

  it("valide un POST complet", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nom: 'Phoenix', classe: 'cargo' }),
});`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un body non serialise", () => {
    // Échec ciblé : un objet brut en body ne part pas en JSON.
    const code = `await fetch('https://api.codeforge.space/vaisseaux', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: { nom: 'Phoenix', classe: 'cargo' },
});`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un POST sans headers", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux', {
  method: 'POST',
  body: JSON.stringify({ nom: 'Phoenix', classe: 'cargo' }),
});`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("JS chapitre 12 — etape 3 (mettre a jour)", () => {
  const valider = validators[2];

  it("valide un PUT sur la ressource ciblee", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux/42', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nom: 'Phoenix II', classe: 'combat' }),
});`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un PUT sur la collection au lieu de la ressource", () => {
    // Échec ciblé : sans l'id dans l'URL, on ne sait pas quoi remplacer.
    const code = `await fetch('https://api.codeforge.space/vaisseaux', {
  method: 'PUT',
  body: JSON.stringify({ nom: 'Phoenix II', classe: 'combat' }),
});`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un POST la ou un PUT est attendu", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux/42', {
  method: 'POST',
  body: JSON.stringify({ nom: 'Phoenix II', classe: 'combat' }),
});`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("JS chapitre 12 — etape 4 (supprimer)", () => {
  const valider = validators[3];

  const OK = `const response = await fetch('https://api.codeforge.space/vaisseaux/7', {
  method: 'DELETE',
});
if (response.ok) {
  console.log('Vaisseau retire de la flotte');
}`;

  it("valide un DELETE confirme et marque l'etape finale", () => {
    const r = valider(OK);
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse une suppression dont on ne verifie pas le succes", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux/7', { method: 'DELETE' });
console.log('Vaisseau retire de la flotte');`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une suppression sur un autre identifiant", () => {
    const code = `const response = await fetch('https://api.codeforge.space/vaisseaux/8', {
  method: 'DELETE',
});
if (response.ok) {
  console.log('Vaisseau retire de la flotte');
}`;
    expect(valider(code).ok).toBe(false);
  });
});
