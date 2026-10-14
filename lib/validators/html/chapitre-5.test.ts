import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-5";

/**
 * HTML chapter 5 — forms: fields, types, submission, dropdown menu.
 */

/** Wraps the given content in a <form>. */
function form(inner: string): string {
  return `<form action="/envoyer" method="post">${inner}</form>`;
}

describe("HTML chapter 5 — step 1 (labeled field)", () => {
  const validate = validators[0];

  it("accepts a text input whose id matches the label", () => {
    const code = form('<label for="nom">Nom</label><input type="text" id="nom">');
    expect(validate(code).ok).toBe(true);
  });

  it("accepts an input without a type attribute, which defaults to text", () => {
    const code = form('<label for="nom">Nom</label><input id="nom">');
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a label that points to a non-existent id", () => {
    // Targeted failure: the association is the point of the step, not the two tags.
    const code = form('<label for="pilote">Nom</label><input type="text" id="nom">');
    expect(validate(code).ok).toBe(false);
  });

  it("rejects fields left outside a form", () => {
    expect(validate('<label for="nom">Nom</label><input type="text" id="nom">').ok).toBe(
      false
    );
  });
});

describe("HTML chapter 5 — step 2 (specialized types)", () => {
  const validate = validators[1];

  it("accepts an email field and a password field", () => {
    const code = form('<input type="email" id="e"><input type="password" id="p">');
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an email entered in a text field", () => {
    // Targeted failure: the type is what brings validation and a suitable keyboard.
    const code = form('<input type="text" id="e"><input type="password" id="p">');
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a missing password field", () => {
    expect(validate(form('<input type="email" id="e">')).ok).toBe(false);
  });
});

describe("HTML chapter 5 — step 3 (text area and submission)", () => {
  const validate = validators[2];

  it("accepts a textarea and a submit button", () => {
    const code = form(
      '<textarea id="rapport"></textarea><button type="submit">Transmettre</button>'
    );
    expect(validate(code).ok).toBe(true);
  });

  it("accepts a button without a type, which submits by default", () => {
    const code = form('<textarea id="rapport"></textarea><button>Transmettre</button>');
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a button that does not submit the form", () => {
    for (const type of ["button", "reset"]) {
      const code = form(
        `<textarea id="rapport"></textarea><button type="${type}">Transmettre</button>`
      );
      const r = validate(code);
      expect(r.ok).toBe(false);
      expect(r.msg).toMatch(/type="submit"/);
    }
  });

  it("rejects a missing button", () => {
    expect(validate(form('<textarea id="rapport"></textarea>')).ok).toBe(false);
  });

  it("rejects a text input instead of the textarea", () => {
    const code = form(
      '<input type="text" id="rapport"><button type="submit">Transmettre</button>'
    );
    expect(validate(code).ok).toBe(false);
  });
});

describe("HTML chapter 5 — step 4 (dropdown menu)", () => {
  const validate = validators[3];

  it("accepts a select offering two options", () => {
    const code = form(
      '<select id="secteur"><option>Alpha</option><option>Beta</option></select>'
    );
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a select with a single option", () => {
    // Targeted failure: a menu with a single choice is not a menu.
    const code = form('<select id="secteur"><option>Alpha</option></select>');
    expect(validate(code).ok).toBe(false);
  });

  it("rejects options left outside the select", () => {
    const code = form("<option>Alpha</option><option>Beta</option>");
    expect(validate(code).ok).toBe(false);
  });
});
