import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-11";

/**
 * JS chapitre 11 — fetch.
 *
 * Contrairement aux chapitres 1 a 10, ces validateurs sont STATIQUES : l'hote
 * d'API est fictif et ne resout jamais dans le sandbox, donc c'est le code
 * ecrit qui est inspecte, pas sa sortie. Aucun contexte a fournir.
 */

describe("JS chapitre 11 — etape 1 (premier appel)", () => {
  const valider = validators[0];

  it("valide un fetch chaine a un then qui logue", () => {
    const code = `fetch('https://api.codeforge.space/ping')
  .then((r) => console.log(r));`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un fetch sans then", () => {
    expect(valider(`fetch('https://api.codeforge.space/ping');`).ok).toBe(false);
  });

  it("refuse un appel vers une autre URL", () => {
    // Echec cible : l'etape nomme explicitement l'endpoint.
    const code = `fetch('https://api.codeforge.space/status')
  .then((r) => console.log(r));`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("JS chapitre 11 — etape 2 (decoder le JSON)", () => {
  const valider = validators[1];

  it("valide deux then dont un json()", () => {
    const code = `fetch('https://api.codeforge.space/vaisseau')
  .then((response) => response.json())
  .then((data) => console.log(data));`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un seul then, sans decodage", () => {
    const code = `fetch('https://api.codeforge.space/vaisseau')
  .then((response) => console.log(response));`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un json() sans second then pour l'exploiter", () => {
    // Echec cible : les donnees sont decodees puis perdues.
    const code = `fetch('https://api.codeforge.space/vaisseau')
  .then((response) => response.json());`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("JS chapitre 11 — etape 3 (passer a async/await)", () => {
  const valider = validators[2];

  it("valide un await sur le fetch et sur le json", () => {
    const code = `async function charger() {
  const response = await fetch('https://api.codeforge.space/vaisseau');
  const data = await response.json();
  console.log(data);
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un await sur le fetch seul", () => {
    // Echec cible : json() renvoie aussi une promesse, souvent oubliee.
    const code = `async function charger() {
  const response = await fetch('https://api.codeforge.space/vaisseau');
  const data = response.json();
  console.log(data);
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une fonction non async", () => {
    const code = `function charger() {
  const response = fetch('https://api.codeforge.space/vaisseau');
  console.log(response);
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("JS chapitre 11 — etape 4 (gerer la panne)", () => {
  const valider = validators[3];

  const OK = `async function charger() {
  try {
    const response = await fetch('https://api.codeforge.space/vaisseau');
    if (!response.ok) throw new Error(response.status);
    console.log(await response.json());
  } catch (e) {
    console.log('Erreur de transmission : ' + e.message);
  }
}`;

  it("valide un try/catch avec verification de response.ok", () => {
    const r = valider(OK);
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("refuse un try/catch qui ne verifie pas response.ok", () => {
    // Echec cible : fetch ne rejette pas sur un 404, seul .ok le revele.
    const code = `async function charger() {
  try {
    const response = await fetch('https://api.codeforge.space/vaisseau');
    console.log(await response.json());
  } catch (e) {
    console.log('Erreur de transmission : ' + e.message);
  }
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un catch au message different de celui demande", () => {
    const code = `async function charger() {
  try {
    const response = await fetch('https://api.codeforge.space/vaisseau');
    if (!response.ok) throw new Error(response.status);
  } catch (e) {
    console.log('Oups : ' + e.message);
  }
}`;
    expect(valider(code).ok).toBe(false);
  });
});
