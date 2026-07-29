import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-5";

describe("React chapitre 5 — etape 1 (.map() sur un tableau)", () => {
  const v = validators[0];

  it("valide un .map() qui retourne un element JSX", () => {
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

  it("valide un .map() avec un corps de bloc et un return JSX", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map((v) => { return <li>{v.nom}</li>; })}</ul>;
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("echoue si la liste reste codee en dur (pas de .map())", () => {
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

  it("echoue si .map() ne retourne pas de JSX", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => v.nom)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/JSX/);
  });
});

describe("React chapitre 5 — etape 2 (la prop key)", () => {
  const v = validators[1];

  it("valide une key basee sur un identifiant stable", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;
      }
    `;
    expect(v(code).ok).toBe(true);
  });

  it("echoue si la prop key est absente (l'erreur la plus courante)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => <li>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/key/);
  });

  it("echoue si key={index} (piege classique de l'index comme cle)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map((v, index) => <li key={index}>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/index/);
  });

  it("echoue si key={i} (variante courte de l'index)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map((v, i) => <li key={i}>{v.nom}</li>)}</ul>;
      }
    `;
    expect(v(code).ok).toBe(false);
  });
});

describe("React chapitre 5 — etape 3 (filtrer avant de rendre)", () => {
  const v = validators[2];

  it("valide un .filter() chaine avant .map()", () => {
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

  it("echoue si .filter() est absent (tous les vaisseaux s'affichent)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/filter/);
  });

  it("echoue si .map() est chaine avant .filter() (mauvais ordre)", () => {
    const code = `
      function ListeFlotte() {
        return <ul>{flotte.map(v => <li key={v.id}>{v.nom}</li>).filter(el => el)}</ul>;
      }
    `;
    const r = v(code);
    expect(r.ok).toBe(false);
  });
});

describe("React chapitre 5 — etape 4 (liste vide)", () => {
  const v = validators[3];

  it("valide un if precoce qui retourne un message quand la liste est vide", () => {
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

  it("valide une variante ternaire avec message alternatif", () => {
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

  it("echoue si le cas vide n'est jamais teste (liste muette)", () => {
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

  it("echoue si length est teste mais rien n'est rendu a la place (return null)", () => {
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
});
