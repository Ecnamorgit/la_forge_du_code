import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-3";

/**
 * React chapitre 3 — useEffect : montage, dépendances, nettoyage, chargement.
 */

const IMPORT = `import { useState, useEffect } from 'react';`;

describe("React chapitre 3 — etape 1 (effet au montage)", () => {
  const valider = validators[0];

  it("accepte un effet logue avec un tableau de dependances vide", () => {
    const code = `${IMPORT}
function Station() {
  useEffect(() => {
    console.log('Composant en ligne');
  }, []);
  return <div>Station</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un effet sans tableau de dependances", () => {
    // Échec ciblé : sans [], l'effet rejoue à chaque rendu.
    const code = `${IMPORT}
function Station() {
  useEffect(() => {
    console.log('Composant en ligne');
  });
  return <div>Station</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un useEffect non importe", () => {
    const code = `import { useState } from 'react';
function Station() {
  useEffect(() => {
    console.log('Composant en ligne');
  }, []);
  return <div>Station</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 3 — etape 2 (effet dependant d'une valeur)", () => {
  const valider = validators[1];

  it("accepte document.title synchronise sur count", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = 'Score ' + count;
  }, [count]);
  return <div>{count}</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un effet qui ne declare pas count en dependance", () => {
    // Échec ciblé : le titre ne se mettrait à jour qu'au montage.
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = 'Score ' + count;
  }, []);
  return <div>{count}</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un effet qui ne touche pas au titre", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log(count);
  }, [count]);
  return <div>{count}</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 3 — etape 3 (nettoyage de l'intervalle)", () => {
  const valider = validators[2];

  it("accepte un setInterval nettoye au demontage", () => {
    const code = `${IMPORT}
function Horloge() {
  useEffect(() => {
    const id = setInterval(() => console.log('tic'), 1000);
    return () => clearInterval(id);
  }, []);
  return <div>Horloge</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un intervalle jamais nettoye", () => {
    // Échec ciblé : c'est exactement la fuite que l'étape enseigne à éviter.
    const code = `${IMPORT}
function Horloge() {
  useEffect(() => {
    setInterval(() => console.log('tic'), 1000);
  }, []);
  return <div>Horloge</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un cleanup qui n'arrete pas l'intervalle", () => {
    const code = `${IMPORT}
function Horloge() {
  useEffect(() => {
    const id = setInterval(() => console.log('tic'), 1000);
    return () => console.log('demonte');
  }, []);
  return <div>Horloge</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 3 — etape 4 (chargement de donnees)", () => {
  const valider = validators[3];

  it("accepte un fetch au montage avec etat de chargement", () => {
    const code = `${IMPORT}
function Flotte() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/flotte').then((r) => r.json()).then(setData);
  }, []);
  if (data === null) return <div>Chargement...</div>;
  return <div>{data.length}</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un fetch sans etat de chargement", () => {
    // Échec ciblé : l'apprenant afficherait un écran vide pendant l'attente.
    const code = `${IMPORT}
function Flotte() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/flotte').then((r) => r.json()).then(setData);
  }, []);
  return <div>{data.length}</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un composant sans fetch", () => {
    const code = `${IMPORT}
function Flotte() {
  const [data, setData] = useState(null);
  useEffect(() => {
    setData([]);
  }, []);
  if (data === null) return <div>Chargement...</div>;
  return <div>{data.length}</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});
