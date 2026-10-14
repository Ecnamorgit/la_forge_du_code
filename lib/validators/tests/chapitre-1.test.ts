import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * "Tests" course chapter 1 — steps 2 to 4.
 *
 * Step 1 is already covered by `lib/validators/all-chapter-1.test.ts`.
 *
 * The code the learner submits is itself test code: the strings below
 * are tests written by the learner, not tests of this file.
 */

describe("Tests — step 2 (edge case and toEqual)", () => {
  const validate = validators[1];

  it("accepts two cases including the empty array, compared with toEqual", () => {
    const code = `describe('filtrerActifs', () => {
  it('garde les actifs', () => {
    expect(filtrerActifs([{ actif: true }])).toEqual([{ actif: true }]);
  });
  it('gere le tableau vide', () => {
    expect(filtrerActifs([])).toEqual([]);
  });
});`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a single case, without the empty array", () => {
    const code = `describe('filtrerActifs', () => {
  it('garde les actifs', () => {
    expect(filtrerActifs([{ actif: true }])).toEqual([{ actif: true }]);
  });
});`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects toBe for comparing arrays of objects", () => {
    // Targeted failure: toBe compares references, never contents.
    const code = `describe('filtrerActifs', () => {
  it('garde les actifs', () => {
    expect(filtrerActifs([{ actif: true }]).length).toBe(1);
  });
  it('gere le tableau vide', () => {
    expect(filtrerActifs([]).length).toBe(0);
  });
});`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Tests — step 3 (component and interaction)", () => {
  const validate = validators[2];

  it("accepts a render followed by a verified click", () => {
    const code = `it('incremente', () => {
  render(<Compteur />);
  fireEvent.click(getByText('+'));
  expect(getByText('Score : 1')).toBeInTheDocument();
});`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a render without interaction", () => {
    // Targeted failure: the step is about simulating a click.
    const code = `it('affiche', () => {
  render(<Compteur />);
  expect(getByText('Score : 0')).toBeInTheDocument();
});`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a click whose result is not checked", () => {
    const code = `it('incremente', () => {
  render(<Compteur />);
  getByText('+');
  fireEvent.click(getByText('+'));
});`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("Tests — step 4 (end-to-end flow)", () => {
  const validate = validators[3];

  it("accepts a navigation, a click and a URL check", () => {
    const code = `test('navigue vers le dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Connexion');
  await expect(page).toHaveURL(/dashboard/);
});`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a visit with neither click nor check", () => {
    const code = `test('ouvre la page', async ({ page }) => {
  await page.goto('http://localhost:3000');
});`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a click without checking the resulting URL", () => {
    // Targeted failure: without an assertion, the test proves nothing.
    const code = `test('clique', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Connexion');
});`;
    expect(validate(code).ok).toBe(false);
  });
});
