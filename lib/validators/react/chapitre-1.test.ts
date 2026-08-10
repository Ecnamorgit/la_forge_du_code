import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * React chapitre 1 — composant, props, condition, composition.
 *
 * Les chapitres 5 a 8 avaient deja leurs tests ; 1 a 4 n'en avaient aucun.
 */

describe("React chapitre 1 — etape 1 (premier composant)", () => {
  const valider = validators[0];

  it("accepte une fonction Radar qui retourne du JSX", () => {
    const code = `function Radar() {
  return <div>Scan en cours</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("accepte la forme const Radar = () => ...", () => {
    const code = `const Radar = () => <div>Scan en cours</div>;`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un nom de composant en minuscule", () => {
    // Echec cible : React distingue les composants par leur majuscule.
    const code = `function radar() {
  return <div>Scan en cours</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un composant qui ne retourne pas le texte demande", () => {
    const code = `function Radar() {
  return <div>Rien a signaler</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 1 — etape 2 (props)", () => {
  const valider = validators[1];

  it("accepte props.cible affiche entre accolades", () => {
    const code = `function Radar(props) {
  return <div>Scan de {props.cible}</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("accepte la destructuration du parametre", () => {
    const code = `function Radar({ cible }) {
  return <div>Scan de {cible}</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un composant sans parametre", () => {
    const code = `function Radar() {
  return <div>Scan de {props.cible}</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une valeur ecrite en dur au lieu de la prop", () => {
    // Echec cible : le parametre existe mais n'est jamais affiche.
    const code = `function Radar(props) {
  return <div>Scan de la Lune</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 1 — etape 3 (affichage conditionnel)", () => {
  const valider = validators[2];

  it("accepte un ternaire sur menace", () => {
    const code = `function Radar(props) {
  return <div>{props.menace ? <span>ALERTE</span> : null}</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("accepte l'operateur && ", () => {
    const code = `function Radar(props) {
  return <div>{props.menace && <span>ALERTE</span>}</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une alerte affichee sans condition", () => {
    const code = `function Radar(props) {
  return <div><span>ALERTE</span></div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une condition qui n'affiche pas le span attendu", () => {
    // Echec cible : la logique est la, le rendu ne l'est pas.
    const code = `function Radar(props) {
  return <div>{props.menace ? <b>ALERTE</b> : null}</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 1 — etape 4 (composition)", () => {
  const valider = validators[3];

  it("accepte un parent qui monte deux Radar avec des cibles distinctes", () => {
    const code = `function TableauDeBord() {
  return (
    <div>
      <Radar cible="Lune" />
      <Radar cible="Mars" />
    </div>
  );
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un parent qui ne monte qu'un seul Radar", () => {
    const code = `function TableauDeBord() {
  return <div><Radar cible="Lune" /></div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse deux Radar sur la meme cible", () => {
    // Echec cible : l'etape demande deux cibles nommees, Lune et Mars.
    const code = `function TableauDeBord() {
  return (
    <div>
      <Radar cible="Lune" />
      <Radar cible="Lune" />
    </div>
  );
}`;
    expect(valider(code).ok).toBe(false);
  });
});
