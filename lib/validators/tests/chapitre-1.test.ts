import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Cursus « Tests » chapitre 1 — étapes 2 à 4.
 *
 * L'étape 1 est déjà couverte par `lib/validators/all-chapter-1.test.ts`.
 *
 * Le code soumis par l'apprenant est lui-même du code de test : les chaînes
 * ci-dessous sont des tests écrits par l'apprenant, pas des tests de ce fichier.
 */

describe("Tests — etape 2 (cas limite et toEqual)", () => {
  const valider = validators[1];

  it("accepte deux cas dont le tableau vide, compares avec toEqual", () => {
    const code = `describe('filtrerActifs', () => {
  it('garde les actifs', () => {
    expect(filtrerActifs([{ actif: true }])).toEqual([{ actif: true }]);
  });
  it('gere le tableau vide', () => {
    expect(filtrerActifs([])).toEqual([]);
  });
});`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un seul cas, sans le tableau vide", () => {
    const code = `describe('filtrerActifs', () => {
  it('garde les actifs', () => {
    expect(filtrerActifs([{ actif: true }])).toEqual([{ actif: true }]);
  });
});`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse toBe pour comparer des tableaux d'objets", () => {
    // Échec ciblé : toBe compare les références, jamais le contenu.
    const code = `describe('filtrerActifs', () => {
  it('garde les actifs', () => {
    expect(filtrerActifs([{ actif: true }]).length).toBe(1);
  });
  it('gere le tableau vide', () => {
    expect(filtrerActifs([]).length).toBe(0);
  });
});`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("Tests — etape 3 (composant et interaction)", () => {
  const valider = validators[2];

  it("accepte un rendu suivi d'un clic verifie", () => {
    const code = `it('incremente', () => {
  render(<Compteur />);
  fireEvent.click(getByText('+'));
  expect(getByText('Score : 1')).toBeInTheDocument();
});`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un rendu sans interaction", () => {
    // Échec ciblé : l'étape porte sur la simulation d'un clic.
    const code = `it('affiche', () => {
  render(<Compteur />);
  expect(getByText('Score : 0')).toBeInTheDocument();
});`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un clic dont le resultat n'est pas verifie", () => {
    const code = `it('incremente', () => {
  render(<Compteur />);
  getByText('+');
  fireEvent.click(getByText('+'));
});`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("Tests — etape 4 (parcours de bout en bout)", () => {
  const valider = validators[3];

  it("accepte une navigation, un clic et une verification d'URL", () => {
    const code = `test('navigue vers le dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Connexion');
  await expect(page).toHaveURL(/dashboard/);
});`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une visite sans clic ni verification", () => {
    const code = `test('ouvre la page', async ({ page }) => {
  await page.goto('http://localhost:3000');
});`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un clic sans verification de l'URL atteinte", () => {
    // Échec ciblé : sans assertion, le test ne prouve rien.
    const code = `test('clique', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Connexion');
});`;
    expect(valider(code).ok).toBe(false);
  });
});
