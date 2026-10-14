import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-5";

describe("React chapter 5 — step 1 (.map() on an array)", () => {
  const v = validators[0];

  it("passes a .map() that returns a JSX element", () => {
    const code = `
      const flotte = [{ id: 1, nom: 'Aigle' }, { id: 2, nom: 'Faucon' }];
      function ListeFlotte() {
        return (
          <ul>
            {flotte.map(v => <li>{v.nom}</li>)}
          </ul>
        );
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("passes a .map() with a block body and a JSX return", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map((v) => { return <li>{v.nom}</li>; })}</ul>;
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("fails if the list stays hard-coded (no .map())", () => {
    const code = `
      function ListeFlotte() {
        return (
          <ul>
            <li>Aigle</li>
            <li>Faucon</li>
            <li>Phenix</li>
          </ul>
        );
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/\.map\(\)/);
  });

  it("fails if .map() does not return JSX", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => v.nom)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/JSX/);
  });

  it("fails if an unrelated component returns JSX but .map() does not (regression Finding 3)", () => {
    // The Debug component returns JSX outside the map callback: this
    // match elsewhere in the file must not be enough.
    const code = `
      const Debug = () => <span>debug</span>;
      function ListeFlotte() {
        return <ul>{flotte.map(v => v.nom)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/JSX/);
  });
});

describe("React chapter 5 — step 2 (the key prop)", () => {
  const v = validators[1];

  it("passes a key based on a stable id", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("fails if the key prop is missing (the most common mistake)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => <li>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/key/);
  });

  it("fails if key={index} (classic index-as-key trap)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map((v, index) => <li key={index}>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/index/);
  });

  it("fails if key={i} (short variant of the index)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map((v, i) => <li key={i}>{v.nom}</li>)}</ul>;
      }
    `;
    expect(v(code).ok).toBe(false);
  });
});

describe("React chapter 5 — step 3 (filter before rendering)", () => {
  const v = validators[2];

  it("passes a .filter() chained before .map()", () => {
    const code = `
      function ListeFlotte() {
        return (
          <ul>
            {flotte.filter(v => v.statut === 'operationnel').map(v => <li key={v.id}>{v.nom}</li>)}
          </ul>
        );
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("fails if .filter() is missing (all ships are displayed)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/filter/);
  });

  it("fails if .map() is chained before .filter() (wrong order)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => <li key={v.id}>{v.nom}</li>).filter(el => el)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
  });

  it("passes a correct filter->map even when preceded by an unrelated .map() (regression Finding 1)", () => {
    // An earlier .map() unrelated to rendering must not break detection
    // of the real filter -> map chain further down.
    const code = `
      function ListeFlotte() {
        const ids = flotte.map(v => v.id);
        return <ul>{flotte.filter(v => v.statut === 'operationnel').map(v => <li key={v.id}>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(true);
  });
});

describe("React chapter 5 — step 4 (empty list)", () => {
  const v = validators[3];

  it("passes an early if that returns a message when the list is empty", () => {
    const code = `
      function ListeFlotte() {
        const operationnels = flotte.filter(v => v.statut === 'operationnel');
        if (operationnels.length === 0) {
          return <p>Aucun vaisseau operationnel.</p>;
        }
        return <ul>{operationnels.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("passes a ternary variant with a fallback message", () => {
    const code = `
      function ListeFlotte() {
        const operationnels = flotte.filter(v => v.statut === 'operationnel');
        return (
          <div>
            {operationnels.length === 0
              ? <p>Aucun vaisseau operationnel.</p>
              : operationnels.map(v => <li key={v.id}>{v.nom}</li>)}
          </div>
        );
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("fails if the empty case is never checked (silent list)", () => {
    const code = `
      function ListeFlotte() {
        const operationnels = flotte.filter(v => v.statut === 'operationnel');
        return <ul>{operationnels.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/length/);
  });

  it("fails if length is checked but nothing is rendered instead (return null)", () => {
    const code = `
      function ListeFlotte() {
        const operationnels = flotte.filter(v => v.statut === 'operationnel');
        if (operationnels.length === 0) {
          return null;
        }
        return <ul>{operationnels.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
  });

  it("fails if length is checked on the source array flotte, not on operationnels (regression Finding 2)", () => {
    // `flotte` is never empty in this exercise: this check can never
    // trigger.
    const code = `
      function ListeFlotte() {
        const operationnels = flotte.filter(v => v.statut === 'operationnel');
        if (flotte.length === 0) {
          return <p>Aucun vaisseau operationnel.</p>;
        }
        return <ul>{operationnels.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/length/);
  });
});
