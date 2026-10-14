import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * React chapter 1 — component, props, condition, composition.
 */

describe("React chapter 1 — step 1 (first component)", () => {
  const validate = validators[0];

  it("accepts a Radar function that returns JSX", () => {
    const code = `function Radar() {
  return <div>Scan en cours</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("accepts the const Radar = () => ... form", () => {
    const code = `const Radar = () => <div>Scan en cours</div>;`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a lowercase component name", () => {
    // Targeted failure: React tells components apart by their capital letter.
    const code = `function radar() {
  return <div>Scan en cours</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a component that does not return the requested text", () => {
    const code = `function Radar() {
  return <div>Rien a signaler</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 1 — step 2 (props)", () => {
  const validate = validators[1];

  it("accepts props.cible printed inside braces", () => {
    const code = `function Radar(props) {
  return <div>Scan de {props.cible}</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("accepts destructuring the parameter", () => {
    const code = `function Radar({ cible }) {
  return <div>Scan de {cible}</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a component without a parameter", () => {
    const code = `function Radar() {
  return <div>Scan de {props.cible}</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a hard-coded value instead of the prop", () => {
    // Targeted failure: the parameter exists but is never displayed.
    const code = `function Radar(props) {
  return <div>Scan de la Lune</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 1 — step 3 (conditional rendering)", () => {
  const validate = validators[2];

  it("accepts a ternary on menace", () => {
    const code = `function Radar(props) {
  return <div>{props.menace ? <span>ALERTE</span> : null}</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("accepts the && operator", () => {
    const code = `function Radar(props) {
  return <div>{props.menace && <span>ALERTE</span>}</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an alert displayed without a condition", () => {
    const code = `function Radar(props) {
  return <div><span>ALERTE</span></div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a condition that does not render the expected span", () => {
    // Targeted failure: the logic is there, the rendering is not.
    const code = `function Radar(props) {
  return <div>{props.menace ? <b>ALERTE</b> : null}</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 1 — step 4 (composition)", () => {
  const validate = validators[3];

  it("accepts a parent that mounts two Radar with distinct targets", () => {
    const code = `function TableauDeBord() {
  return (
    <div>
      <Radar cible="Lune" />
      <Radar cible="Mars" />
    </div>
  );
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a parent that mounts only one Radar", () => {
    const code = `function TableauDeBord() {
  return <div><Radar cible="Lune" /></div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects two Radar on the same target", () => {
    // Targeted failure: the step asks for two named targets, Lune and Mars.
    const code = `function TableauDeBord() {
  return (
    <div>
      <Radar cible="Lune" />
      <Radar cible="Lune" />
    </div>
  );
}`;
    expect(validate(code).ok).toBe(false);
  });
});
