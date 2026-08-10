import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-4";

/**
 * HTML chapitre 4 — listes et tableaux.
 */

describe("HTML chapitre 4 — etape 1 (liste non ordonnee)", () => {
  const valider = validators[0];

  it("accepte une ul de trois elements", () => {
    expect(valider("<ul><li>A</li><li>B</li><li>C</li></ul>").ok).toBe(true);
  });

  it("refuse une ul de deux elements", () => {
    expect(valider("<ul><li>A</li><li>B</li></ul>").ok).toBe(false);
  });

  it("refuse des li laisses hors de toute liste", () => {
    // Echec cible : les items existent, le conteneur manque.
    expect(valider("<li>A</li><li>B</li><li>C</li>").ok).toBe(false);
  });
});

describe("HTML chapitre 4 — etape 2 (liste ordonnee)", () => {
  const valider = validators[1];

  it("accepte une ol de trois elements", () => {
    expect(valider("<ol><li>A</li><li>B</li><li>C</li></ol>").ok).toBe(true);
  });

  it("refuse une ul la ou l'ordre compte", () => {
    // Echec cible : l'etape porte sur la sequence, donc sur <ol>.
    expect(valider("<ul><li>A</li><li>B</li><li>C</li></ul>").ok).toBe(false);
  });

  it("refuse une ol de deux elements", () => {
    expect(valider("<ol><li>A</li><li>B</li></ol>").ok).toBe(false);
  });
});

describe("HTML chapitre 4 — etape 3 (tableau)", () => {
  const valider = validators[2];

  it("accepte deux lignes de deux cellules", () => {
    const code = `<table>
      <tr><td>Lia</td><td>5</td></tr>
      <tr><td>Max</td><td>3</td></tr>
    </table>`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une ligne qui n'a qu'une cellule", () => {
    // Echec cible : une grille suppose au moins deux colonnes partout.
    const code = `<table>
      <tr><td>Lia</td><td>5</td></tr>
      <tr><td>Max</td></tr>
    </table>`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un tableau d'une seule ligne", () => {
    expect(valider("<table><tr><td>Lia</td><td>5</td></tr></table>").ok).toBe(false);
  });
});

describe("HTML chapitre 4 — etape 4 (en-tetes de tableau)", () => {
  const valider = validators[3];

  it("accepte un thead contenant deux th", () => {
    const code = `<table>
      <thead><tr><th>Pilote</th><th>Niveau</th></tr></thead>
      <tr><td>Lia</td><td>5</td></tr>
    </table>`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse des th poses hors du thead", () => {
    // Echec cible : l'etape enseigne la zone d'en-tete, pas la balise seule.
    const code = `<table>
      <tr><th>Pilote</th><th>Niveau</th></tr>
      <tr><td>Lia</td><td>5</td></tr>
    </table>`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un thead qui n'a qu'un seul th", () => {
    const code = `<table>
      <thead><tr><th>Pilote</th></tr></thead>
      <tr><td>Lia</td><td>5</td></tr>
    </table>`;
    expect(valider(code).ok).toBe(false);
  });
});
