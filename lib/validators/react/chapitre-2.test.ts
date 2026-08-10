import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-2";

/**
 * React chapitre 2 — useState : compteur, evenement, objet, remontee d'etat.
 */

const IMPORT = `import { useState } from 'react';`;

describe("React chapitre 2 — etape 1 (declarer un etat)", () => {
  const valider = validators[0];

  it("accepte un useState importe, declare et affiche", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un useState non importe", () => {
    const code = `function Compteur() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un etat declare mais jamais affiche", () => {
    // Echec cible : sans rendu, l'apprenant ne voit pas l'etat vivre.
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <div>Compteur</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une valeur initiale autre que zero", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(1);
  return <div>{count}</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 2 — etape 2 (incrementer au clic)", () => {
  const valider = validators[1];

  it("accepte un bouton qui appelle setCount dans une fleche", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un bouton sans onClick", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <button>{count}</button>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un onClick qui ne met pas l'etat a jour", () => {
    // Echec cible : le gestionnaire existe mais n'appelle pas le setter.
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <button onClick={() => console.log(count)}>{count}</button>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 2 — etape 3 (etat objet et immutabilite)", () => {
  const valider = validators[2];

  it("accepte une mise a jour par spread", () => {
    const code = `${IMPORT}
function Profil() {
  const [profil, setProfil] = useState({ nom: 'Lia', xp: 0 });
  return <button onClick={() => setProfil({ ...profil, xp: profil.xp + 10 })}>{profil.xp}</button>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une mutation directe de l'objet d'etat", () => {
    // Echec cible : sans nouvelle reference, React ne redessine pas.
    const code = `${IMPORT}
function Profil() {
  const [profil, setProfil] = useState({ nom: 'Lia', xp: 0 });
  return <button onClick={() => { profil.xp += 10; setProfil(profil); }}>{profil.xp}</button>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un etat qui n'est pas l'objet demande", () => {
    const code = `${IMPORT}
function Profil() {
  const [profil, setProfil] = useState(0);
  return <button onClick={() => setProfil({ ...profil, xp: 10 })}>{profil}</button>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 2 — etape 4 (remontee d'etat)", () => {
  const valider = validators[3];

  it("accepte un parent qui passe la valeur et le setter", () => {
    const code = `${IMPORT}
function TableauDeBord() {
  const [alerte, setAlerte] = useState(false);
  return <Bouton alerte={alerte} setAlerte={setAlerte} />;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un parent qui ne passe que la valeur", () => {
    // Echec cible : sans le setter, l'enfant ne peut rien remonter.
    const code = `${IMPORT}
function TableauDeBord() {
  const [alerte, setAlerte] = useState(false);
  return <Bouton alerte={alerte} />;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un etat declare dans l'enfant au lieu du parent", () => {
    const code = `${IMPORT}
function Bouton() {
  const [actif, setActif] = useState(false);
  return <button onClick={() => setActif(!actif)}>ok</button>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});
