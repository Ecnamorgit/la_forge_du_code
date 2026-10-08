import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-5";

/**
 * HTML chapitre 5 — formulaires : champs, types, envoi, menu déroulant.
 */

/** Enveloppe le contenu donné dans un <form>. */
function form(inner: string): string {
  return `<form action="/envoyer" method="post">${inner}</form>`;
}

describe("HTML chapitre 5 — etape 1 (champ etiquete)", () => {
  const valider = validators[0];

  it("accepte un input text dont l'id correspond au label", () => {
    const code = form('<label for="nom">Nom</label><input type="text" id="nom">');
    expect(valider(code).ok).toBe(true);
  });

  it("accepte un input sans attribut type, qui vaut text par defaut", () => {
    const code = form('<label for="nom">Nom</label><input id="nom">');
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un label qui pointe vers un id inexistant", () => {
    // Échec ciblé : l'association est le sujet de l'étape, pas les deux balises.
    const code = form('<label for="pilote">Nom</label><input type="text" id="nom">');
    expect(valider(code).ok).toBe(false);
  });

  it("refuse des champs laisses hors d'un form", () => {
    expect(valider('<label for="nom">Nom</label><input type="text" id="nom">').ok).toBe(
      false
    );
  });
});

describe("HTML chapitre 5 — etape 2 (types specialises)", () => {
  const valider = validators[1];

  it("accepte un champ email et un champ password", () => {
    const code = form('<input type="email" id="e"><input type="password" id="p">');
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un email saisi dans un champ texte", () => {
    // Échec ciblé : c'est le type qui apporte validation et clavier adapté.
    const code = form('<input type="text" id="e"><input type="password" id="p">');
    expect(valider(code).ok).toBe(false);
  });

  it("refuse l'absence du champ mot de passe", () => {
    expect(valider(form('<input type="email" id="e">')).ok).toBe(false);
  });
});

describe("HTML chapitre 5 — etape 3 (zone de texte et envoi)", () => {
  const valider = validators[2];

  it("accepte un textarea et un bouton submit", () => {
    const code = form(
      '<textarea id="rapport"></textarea><button type="submit">Transmettre</button>'
    );
    expect(valider(code).ok).toBe(true);
  });

  it("accepte un bouton sans type, qui soumet par défaut", () => {
    const code = form('<textarea id="rapport"></textarea><button>Transmettre</button>');
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un bouton qui n'envoie pas le formulaire", () => {
    for (const type of ["button", "reset"]) {
      const code = form(
        `<textarea id="rapport"></textarea><button type="${type}">Transmettre</button>`
      );
      const r = valider(code);
      expect(r.ok).toBe(false);
      expect(r.msg).toMatch(/type="submit"/);
    }
  });

  it("refuse l'absence de bouton", () => {
    expect(valider(form('<textarea id="rapport"></textarea>')).ok).toBe(false);
  });

  it("refuse un input texte a la place du textarea", () => {
    const code = form(
      '<input type="text" id="rapport"><button type="submit">Transmettre</button>'
    );
    expect(valider(code).ok).toBe(false);
  });
});

describe("HTML chapitre 5 — etape 4 (menu deroulant)", () => {
  const valider = validators[3];

  it("accepte un select proposant deux options", () => {
    const code = form(
      '<select id="secteur"><option>Alpha</option><option>Beta</option></select>'
    );
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un select a une seule option", () => {
    // Échec ciblé : un menu d'un seul choix n'en est pas un.
    const code = form('<select id="secteur"><option>Alpha</option></select>');
    expect(valider(code).ok).toBe(false);
  });

  it("refuse des options laissees hors du select", () => {
    const code = form("<option>Alpha</option><option>Beta</option>");
    expect(valider(code).ok).toBe(false);
  });
});
