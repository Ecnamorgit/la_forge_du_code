import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-6";
import { chapitre6 } from "@/data/courses/react/chapitre-6";

describe("React chapitre 6 — etape 1 (input controle, piege Spectre)", () => {
  const v = validators[0];

  it("valide un input controle avec value + onChange appelant un setter", () => {
    const code = `
      import { useState } from 'react';
      function ConsoleSaisie() {
        const [nom, setNom] = useState('');
        return <input value={nom} onChange={(e) => setNom(e.target.value)} />;
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("valide une variante bloc et guillemets simples", () => {
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

  it("echoue si l'input n'a pas d'onChange (le piege du Spectre)", () => {
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

  it("echoue si onChange existe mais n'appelle aucun setter", () => {
    const code = `
      import { useState } from 'react';
      function ConsoleSaisie() {
        const [nom, setNom] = useState('');
        return <input value={nom} onChange={(e) => console.log(e.target.value)} />;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/setter|etat|set/i);
  });

  it("echoue si value est absent (input non controle)", () => {
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
});

describe("React chapitre 6 — etape 2 (objet d'etat pour plusieurs champs)", () => {
  const v = validators[1];

  it("valide useState({...}) + spread + cle calculee", () => {
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

  it("valide une mise a jour fonctionnelle avec cle calculee", () => {
    const code = `
      const [formulaire, setFormulaire] = useState({ nom: '', email: '' });
      function handleChange(e) {
        const { name, value } = e.target;
        setFormulaire(prev => ({ ...prev, [name]: value }));
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("valide deux champs geres separement (sans cle calculee) tant que le spread est present", () => {
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

  it("echoue si nom et email restent dans deux useState separes", () => {
    const code = `
      const [nom, setNom] = useState('');
      const [email, setEmail] = useState('');
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/objet|useState/i);
  });

  it("echoue si la mise a jour ecrase l'etat au lieu de le copier (pas de spread)", () => {
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
});

describe("React chapitre 6 — etape 3 (soumission onSubmit + preventDefault)", () => {
  const v = validators[2];

  it("valide onSubmit sur le form avec preventDefault (handler nomme)", () => {
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

  it("valide un onSubmit inline avec preventDefault", () => {
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

  it("echoue si le handler est sur le bouton (onClick) au lieu du form", () => {
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

  it("echoue si onSubmit est present mais sans preventDefault", () => {
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

  it("echoue si le form est absent", () => {
    const code = `
      function FormulaireContact() {
        return <button type="submit">Envoyer</button>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
  });
});

describe("React chapitre 6 — etape 4 (disabled derive de l'etat)", () => {
  const v = validators[3];

  it("valide disabled calcule a partir de l'etat formulaire", () => {
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

  it("valide une variante avec validation email", () => {
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

  it("echoue si disabled={false} (valeur figee)", () => {
    const code = `
      function FormulaireContact() {
        return <button type="submit" disabled={false}>Envoyer</button>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/fige|etat/i);
  });

  it("echoue si disabled est absent", () => {
    const code = `
      function FormulaireContact() {
        return <button type="submit">Envoyer</button>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
  });

  it("echoue si disabled ne derive pas de l'etat formulaire (valeur arbitraire)", () => {
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

describe("React chapitre 6 — hints valides par leur propre validateur", () => {
  it("chaque hint passe son propre validateur", () => {
    chapitre6.steps.forEach((step, i) => {
      const r = validators[i](step.hint);
      expect(r.ok, `hint etape ${i + 1} rejete : ${!r.ok ? r.msg : ""}`).toBe(true);
    });
  });
});
