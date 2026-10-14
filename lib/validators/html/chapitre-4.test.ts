import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-4";

/**
 * HTML chapter 4 — lists and tables.
 */

describe("HTML chapter 4 — step 1 (unordered list)", () => {
  const validate = validators[0];

  it("accepts a ul with three items", () => {
    expect(validate("<ul><li>A</li><li>B</li><li>C</li></ul>").ok).toBe(true);
  });

  it("rejects a ul with two items", () => {
    expect(validate("<ul><li>A</li><li>B</li></ul>").ok).toBe(false);
  });

  it("rejects li elements left outside any list", () => {
    // Targeted failure: the items exist, the container is missing.
    expect(validate("<li>A</li><li>B</li><li>C</li>").ok).toBe(false);
  });
});

describe("HTML chapter 4 — step 2 (ordered list)", () => {
  const validate = validators[1];

  it("accepts an ol with three items", () => {
    expect(validate("<ol><li>A</li><li>B</li><li>C</li></ol>").ok).toBe(true);
  });

  it("rejects a ul where order matters", () => {
    // Targeted failure: the step is about sequence, hence about <ol>.
    expect(validate("<ul><li>A</li><li>B</li><li>C</li></ul>").ok).toBe(false);
  });

  it("rejects an ol with two items", () => {
    expect(validate("<ol><li>A</li><li>B</li></ol>").ok).toBe(false);
  });
});

describe("HTML chapter 4 — step 3 (table)", () => {
  const validate = validators[2];

  it("accepts two rows of two cells", () => {
    const code = `<table>
      <tr><td>Lia</td><td>5</td></tr>
      <tr><td>Max</td><td>3</td></tr>
    </table>`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a row that has only one cell", () => {
    // Targeted failure: a grid implies at least two columns everywhere.
    const code = `<table>
      <tr><td>Lia</td><td>5</td></tr>
      <tr><td>Max</td></tr>
    </table>`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a table with a single row", () => {
    expect(validate("<table><tr><td>Lia</td><td>5</td></tr></table>").ok).toBe(false);
  });
});

describe("HTML chapter 4 — step 4 (table headers)", () => {
  const validate = validators[3];

  it("accepts a thead containing two th", () => {
    const code = `<table>
      <thead><tr><th>Pilote</th><th>Niveau</th></tr></thead>
      <tr><td>Lia</td><td>5</td></tr>
    </table>`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects th elements placed outside the thead", () => {
    // Targeted failure: the step teaches the header section, not the tag alone.
    const code = `<table>
      <tr><th>Pilote</th><th>Niveau</th></tr>
      <tr><td>Lia</td><td>5</td></tr>
    </table>`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a thead that has only one th", () => {
    const code = `<table>
      <thead><tr><th>Pilote</th></tr></thead>
      <tr><td>Lia</td><td>5</td></tr>
    </table>`;
    expect(validate(code).ok).toBe(false);
  });
});
