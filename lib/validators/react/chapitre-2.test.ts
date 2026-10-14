import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-2";

/**
 * React chapter 2 — useState: counter, event, object, lifting state up.
 */

const IMPORT = `import { useState } from 'react';`;

describe("React chapter 2 — step 1 (declare state)", () => {
  const validate = validators[0];

  it("accepts a useState that is imported, declared and displayed", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a useState that is not imported", () => {
    const code = `function Compteur() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects state declared but never displayed", () => {
    // Targeted failure: without rendering, the learner does not see the state change.
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <div>Compteur</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an initial value other than zero", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(1);
  return <div>{count}</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 2 — step 2 (increment on click)", () => {
  const validate = validators[1];

  it("accepts a button that calls setCount in an arrow", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a button without onClick", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <button>{count}</button>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an onClick that does not update the state", () => {
    // Targeted failure: the handler exists but does not call the setter.
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  return <button onClick={() => console.log(count)}>{count}</button>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 2 — step 3 (object state and immutability)", () => {
  const validate = validators[2];

  it("accepts an update with spread", () => {
    const code = `${IMPORT}
function Profil() {
  const [profil, setProfil] = useState({ nom: 'Lia', xp: 0 });
  return <button onClick={() => setProfil({ ...profil, xp: profil.xp + 10 })}>{profil.xp}</button>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a direct mutation of the state object", () => {
    // Targeted failure: without a new reference, React does not re-render.
    const code = `${IMPORT}
function Profil() {
  const [profil, setProfil] = useState({ nom: 'Lia', xp: 0 });
  return <button onClick={() => { profil.xp += 10; setProfil(profil); }}>{profil.xp}</button>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects state that is not the requested object", () => {
    const code = `${IMPORT}
function Profil() {
  const [profil, setProfil] = useState(0);
  return <button onClick={() => setProfil({ ...profil, xp: 10 })}>{profil}</button>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 2 — step 4 (lifting state up)", () => {
  const validate = validators[3];

  it("accepts a parent that passes the value and the setter", () => {
    const code = `${IMPORT}
function TableauDeBord() {
  const [alerte, setAlerte] = useState(false);
  return <Bouton alerte={alerte} setAlerte={setAlerte} />;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a parent that passes only the value", () => {
    // Targeted failure: without the setter, the child cannot send anything back up.
    const code = `${IMPORT}
function TableauDeBord() {
  const [alerte, setAlerte] = useState(false);
  return <Bouton alerte={alerte} />;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects state declared in the child instead of the parent", () => {
    const code = `${IMPORT}
function Bouton() {
  const [actif, setActif] = useState(false);
  return <button onClick={() => setActif(!actif)}>ok</button>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});
