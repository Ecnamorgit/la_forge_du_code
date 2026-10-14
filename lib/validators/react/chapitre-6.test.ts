import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-6";
import { chapter6 } from "@/data/courses/react/chapitre-6";

describe("React chapter 6 — step 1 (controlled input, Spectre trap)", () => {
  const v = validators[0];

  it("passes a controlled input with value + onChange calling a setter", () => {
    const code = `
      import { useState } from 'react';
      function ConsoleSaisie() {
        const [nom, setNom] = useState('');
        return <input value={nom} onChange={(e) => setNom(e.target.value)} />;
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("passes a block-body variant with single quotes", () => {
    const code = `
      import { useState } from 'react';
      function ConsoleSaisie() {
        const [nom, setNom] = useState('');
        return (
          <input
            value={nom}
            onChange={(e) => { setNom(e.target.value); }}
          />
        );
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("fails if the input has no onChange (the Spectre trap)", () => {
    const code = `
      import { useState } from 'react';
      function ConsoleSaisie() {
        const [nom, setNom] = useState('');
        return <input value={nom} />;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/onChange/);
  });

  it("fails if onChange exists but calls no setter", () => {
    const code = `
      import { useState } from 'react';
      function ConsoleSaisie() {
        const [nom, setNom] = useState('');
        return <input value={nom} onChange={(e) => console.log(e.target.value)} />;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/setter|état|set/i);
  });

  it("fails if value is missing (uncontrolled input)", () => {
    const code = `
      import { useState } from 'react';
      function ConsoleSaisie() {
        const [nom, setNom] = useState('');
        return <input onChange={(e) => setNom(e.target.value)} />;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
  });

  it("passes an onChange that delegates to a named handler calling the setter (finding 2)", () => {
    const code = `
      import { useState } from 'react';
      function ConsoleSaisie() {
        const [nom, setNom] = useState('');
        function handleChange(e) { setNom(e.target.value); }
        return <input value={nom} onChange={handleChange} />;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(true);
  });
});

describe("React chapter 6 — step 2 (state object for several fields)", () => {
  const v = validators[1];

  it("passes useState({...}) + spread + computed key", () => {
    const code = `
      import { useState } from 'react';
      function FormulaireContact() {
        const [formulaire, setFormulaire] = useState({ nom: '', email: '' });
        function handleChange(e) {
          const { name, value } = e.target;
          setFormulaire({ ...formulaire, [name]: value });
        }
        return (
          <form>
            <input name="nom" value={formulaire.nom} onChange={handleChange} />
            <input name="email" value={formulaire.email} onChange={handleChange} />
          </form>
        );
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("passes a functional update with a computed key", () => {
    const code = `
      const [formulaire, setFormulaire] = useState({ nom: '', email: '' });
      function handleChange(e) {
        const { name, value } = e.target;
        setFormulaire(prev => ({ ...prev, [name]: value }));
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("passes two fields handled separately (no computed key) as long as the spread is present", () => {
    const code = `
      const [formulaire, setFormulaire] = useState({ nom: '', email: '' });
      function handleNomChange(e) {
        setFormulaire({ ...formulaire, nom: e.target.value });
      }
      function handleEmailChange(e) {
        setFormulaire({ ...formulaire, email: e.target.value });
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("fails if nom and email stay in two separate useState calls", () => {
    const code = `
      const [nom, setNom] = useState('');
      const [email, setEmail] = useState('');
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/objet|useState/i);
  });

  it("fails if the update overwrites the state instead of copying it (no spread)", () => {
    const code = `
      const [formulaire, setFormulaire] = useState({ nom: '', email: '' });
      function handleChange(e) {
        const { name, value } = e.target;
        setFormulaire({ [name]: value });
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/spread|copie|\.\.\./i);
  });

  it("fails if one setFormulaire call overwrites the state even when ANOTHER call uses the spread (finding 1)", () => {
    const code = `
      const [formulaire, setFormulaire] = useState({ nom: '', email: '' });
      function handleNomChange(e) {
        setFormulaire({ nom: e.target.value });
      }
      function handleEmailChange(e) {
        setFormulaire({ ...formulaire, email: e.target.value });
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/spread|copie|\.\.\./i);
  });
});

describe("React chapter 6 — step 3 (onSubmit submission + preventDefault)", () => {
  const v = validators[2];

  it("passes onSubmit on the form with preventDefault (named handler)", () => {
    const code = `
      function FormulaireContact() {
        const [formulaire, setFormulaire] = useState({ nom: '', email: '' });
        function handleSubmit(e) {
          e.preventDefault();
          console.log(formulaire);
        }
        return (
          <form onSubmit={handleSubmit}>
            <button type="submit">Envoyer</button>
          </form>
        );
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("passes an inline onSubmit with preventDefault", () => {
    const code = `
      function FormulaireContact() {
        return (
          <form onSubmit={(e) => { e.preventDefault(); console.log('ok'); }}>
            <button type="submit">Envoyer</button>
          </form>
        );
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("fails if the handler is on the button (onClick) instead of the form", () => {
    const code = `
      function FormulaireContact() {
        function handleSubmit(e) {
          e.preventDefault();
          console.log('ok');
        }
        return (
          <form>
            <button type="submit" onClick={handleSubmit}>Envoyer</button>
          </form>
        );
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/form|onSubmit/i);
  });

  it("fails if onSubmit is present but without preventDefault", () => {
    const code = `
      function FormulaireContact() {
        function handleSubmit() {
          console.log('ok');
        }
        return (
          <form onSubmit={handleSubmit}>
            <button type="submit">Envoyer</button>
          </form>
        );
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/preventDefault/);
  });

  it("fails if the form is missing", () => {
    const code = `
      function FormulaireContact() {
        return <button type="submit">Envoyer</button>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
  });
});

describe("React chapter 6 — step 4 (disabled derived from state)", () => {
  const v = validators[3];

  it("passes disabled computed from the formulaire state", () => {
    const code = `
      function FormulaireContact() {
        const [formulaire, setFormulaire] = useState({ nom: '', email: '' });
        return (
          <form>
            <button type="submit" disabled={!formulaire.nom || !formulaire.email}>
              Envoyer
            </button>
          </form>
        );
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("passes a variant with email validation", () => {
    const code = `
      function FormulaireContact() {
        const [formulaire, setFormulaire] = useState({ nom: '', email: '' });
        const emailValide = formulaire.email.includes('@');
        return (
          <button disabled={!formulaire.nom || !emailValide}>Envoyer</button>
        );
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("fails if disabled={false} (fixed value)", () => {
    const code = `
      function FormulaireContact() {
        return <button type="submit" disabled={false}>Envoyer</button>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/figé|état/i);
  });

  it("fails if disabled is missing", () => {
    const code = `
      function FormulaireContact() {
        return <button type="submit">Envoyer</button>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
  });

  it("fails if disabled does not derive from the formulaire state (arbitrary value)", () => {
    const code = `
      function FormulaireContact() {
        const pret = true;
        return <button type="submit" disabled={!pret}>Envoyer</button>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
  });
});

describe("React chapter 6 — hints pass their own validator", () => {
  it("each hint passes its own validator", () => {
    chapter6.steps.forEach((step, i) => {
      const r = validators[i](step.hint);
      expect(r.ok, `hint etape ${i + 1} rejete : ${!r.ok ? r.msg : ""}`).toBe(true);
    });
  });
});
