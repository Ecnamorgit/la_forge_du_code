import { describe, expect, it } from "vitest";

import { chapter8 } from "@/data/courses/react/chapitre-8";
import { validators } from "./chapitre-8";

const [step1, step2, step3, step4] = validators;

describe("react/chapitre-8 — step 1: create and broadcast a context", () => {
  it("accepts createContext plus a Provider with value", () => {
    const code = `const ContexteFlotte = createContext(null);
function App() {
  return (
    <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}>
      <Pont />
    </ContexteFlotte.Provider>
  );
}`;
    expect(step1!(code).ok).toBe(true);
  });

  it("rejects a missing createContext", () => {
    const code = `function App() {
  return <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}><Pont /></ContexteFlotte.Provider>;
}`;
    const r = step1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/createContext/);
  });

  it("rejects a context created but never broadcast (the startCode)", () => {
    const code = `const ContexteFlotte = createContext(null);
function App() {
  return <Pont />;
}`;
    const r = step1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Provider/);
  });

  it("rejects a Provider without a value attribute", () => {
    const code = `const ContexteFlotte = createContext(null);
function App() {
  return <ContexteFlotte.Provider><Pont /></ContexteFlotte.Provider>;
}`;
    const r = step1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/value/);
  });

  it("sees the value even with nested braces", () => {
    const code = `const C = createContext(null);
function App() {
  return <C.Provider value={{ a: { b: 1 } }}><X /></C.Provider>;
}`;
    expect(step1!(code).ok).toBe(true);
  });

  it("rejects a Provider without value even if an element FURTHER DOWN has one (finding 6)", () => {
    const code = `const ContexteFlotte = createContext(null);
function App() {
  return (
    <ContexteFlotte.Provider>
      <input value={nom} />
    </ContexteFlotte.Provider>
  );
}`;
    const r = step1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/value/);
  });
});

describe("react/chapitre-8 — step 2: consume with useContext", () => {
  it("accepts destructuring displayed in the JSX", () => {
    const code = `const ContexteFlotte = createContext(null);
function Console() {
  const { amiral } = useContext(ContexteFlotte);
  return <div>Amiral : {amiral}</div>;
}`;
    expect(step2!(code).ok).toBe(true);
  });

  it("accepts access through a variable then a property", () => {
    const code = `const ContexteFlotte = createContext(null);
function Console() {
  const flotte = useContext(ContexteFlotte);
  return <div>Amiral : {flotte.amiral}</div>;
}`;
    expect(step2!(code).ok).toBe(true);
  });

  it("rejects a missing useContext (the startCode)", () => {
    const code = `const ContexteFlotte = createContext(null);
function Console() {
  return <div>Amiral : ???</div>;
}`;
    const r = step2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useContext/);
  });

  it("rejects useContext without an argument", () => {
    const code = `function Console() {
  const { amiral } = useContext();
  return <div>{amiral}</div>;
}`;
    const r = step2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/objet contexte/);
  });

  it("rejects a value read but never displayed", () => {
    const code = `const ContexteFlotte = createContext(null);
function Console() {
  const { amiral } = useContext(ContexteFlotte);
  return <div>Pont de commandement</div>;
}`;
    const r = step2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Affiche/);
  });

  it("rejects a value read in Console but displayed only in ANOTHER component (finding 3)", () => {
    const code = `const ContexteFlotte = createContext(null);
function Console() {
  const { amiral } = useContext(ContexteFlotte);
  return <div>Amiral : ???</div>;
}
function App() {
  return (
    <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}>
      <Console />
    </ContexteFlotte.Provider>
  );
}`;
    const r = step2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Affiche/);
  });
});

describe("react/chapitre-8 — step 3: useReducer", () => {
  const reducerOk = `function reducteur(etat, action) {
  switch (action.type) {
    case 'monter':
      return { niveau: etat.niveau + 1 };
    case 'descendre':
      return { niveau: etat.niveau - 1 };
    default:
      return etat;
  }
}`;

  it("accepts a two-action reducer that is wired up and used", () => {
    const code = `${reducerOk}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    expect(step3!(code).ok).toBe(true);
  });

  it("accepts the action.type === form instead of the switch", () => {
    const code = `function reducteur(etat, action) {
  if (action.type === 'monter') return { niveau: etat.niveau + 1 };
  if (action.type === 'descendre') return { niveau: etat.niveau - 1 };
  return etat;
}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    expect(step3!(code).ok).toBe(true);
  });

  it("rejects a missing useReducer (the startCode)", () => {
    const code = `function Alerte() {
  return <div>Niveau : ???</div>;
}`;
    const r = step3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useReducer/);
  });

  it("rejects a reducer with a single action", () => {
    const code = `function reducteur(etat, action) {
  switch (action.type) {
    case 'monter':
      return { niveau: etat.niveau + 1 };
    default:
      return etat;
  }
}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    const r = step3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/une action|deux transitions/);
  });

  it("rejects a reducer without a default case", () => {
    const code = `function reducteur(etat, action) {
  switch (action.type) {
    case 'monter':
      return { niveau: etat.niveau + 1 };
    case 'descendre':
      return { niveau: etat.niveau - 1 };
  }
}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    const r = step3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/default/);
  });

  it("rejects a correct reducer to which no action is dispatched", () => {
    const code = `${reducerOk}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <div>{etat.niveau}</div>;
}`;
    const r = step3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/dispatch/);
  });

  it("rejects a default that returns nothing (finding 4, loose)", () => {
    const code = `function reducteur(etat, action) {
  switch (action.type) {
    case 'monter':
      return { niveau: etat.niveau + 1 };
    case 'descendre':
      return { niveau: etat.niveau - 1 };
    default:
      break;
  }
}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    const r = step3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/default/);
  });

  it("accepts a default with an end-of-line comment after the return (finding 4, brittle)", () => {
    const code = `function reducteur(etat, action) {
  switch (action.type) {
    case 'monter':
      return { niveau: etat.niveau + 1 };
    case 'descendre':
      return { niveau: etat.niveau - 1 };
    default:
      return etat; // action inconnue
  }
}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    expect(step3!(code).ok).toBe(true);
  });

  it("accepts an if/else reducer ending with return { ...etat } (finding 4, brittle)", () => {
    const code = `function reducteur(etat, action) {
  if (action.type === 'monter') return { ...etat, niveau: etat.niveau + 1 };
  if (action.type === 'descendre') return { ...etat, niveau: etat.niveau - 1 };
  return { ...etat };
}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    expect(step3!(code).ok).toBe(true);
  });

  it("is not fooled by a switch unrelated to the reducer", () => {
    const code = `function autreChose(x) {
  switch (x.type) {
    case 'a': return 1;
    case 'b': return 2;
    default: return 0;
  }
}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteurAbsent, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    expect(step3!(code).ok).toBe(false);
  });
});

describe("react/chapitre-8 — step 4: context plus reducer", () => {
  const fullSolution = `const ContexteAlerte = createContext(null);
function reducteur(etat, action) {
  switch (action.type) {
    case 'monter':
      return { niveau: etat.niveau + 1 };
    default:
      return etat;
  }
}
function Console() {
  const { etat, dispatch } = useContext(ContexteAlerte);
  return <button onClick={() => dispatch({ type: 'monter' })}>Alerte {etat.niveau}</button>;
}
function App() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return (
    <ContexteAlerte.Provider value={{ etat, dispatch }}>
      <Console />
    </ContexteAlerte.Provider>
  );
}`;

  it("accepts the full combination", () => {
    expect(step4!(fullSolution).ok).toBe(true);
  });

  it("rejects a value that carries only the state", () => {
    const code = fullSolution.replace("value={{ etat, dispatch }}", "value={{ etat }}");
    const r = step4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/dispatch/);
  });

  it("rejects a missing Provider", () => {
    const code = `const ContexteAlerte = createContext(null);
function App() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <Console />;
}`;
    const r = step4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Provider/);
  });

  it("rejects a consumer that triggers no action", () => {
    const code = fullSolution.replace(
      "<button onClick={() => dispatch({ type: 'monter' })}>Alerte {etat.niveau}</button>",
      "<button>Alerte {etat.niveau}</button>"
    );
    const r = step4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/transition|dispatch/);
  });

  it("rejects a missing useReducer", () => {
    const code = `const ContexteAlerte = createContext(null);
function App() {
  const [etat, setEtat] = useState({ niveau: 0 });
  return <ContexteAlerte.Provider value={{ etat, dispatch }}><Console /></ContexteAlerte.Provider>;
}`;
    const r = step4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useReducer/);
  });

  it("rejects a dispatch triggered from App rather than from the consumer (finding 5)", () => {
    const code = `const ContexteAlerte = createContext(null);
function reducteur(etat, action) {
  switch (action.type) {
    case 'monter':
      return { niveau: etat.niveau + 1 };
    default:
      return etat;
  }
}
function Console() {
  const { etat, dispatch } = useContext(ContexteAlerte);
  return <button>Alerte {etat.niveau}</button>;
}
function App() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return (
    <ContexteAlerte.Provider value={{ etat, dispatch }}>
      <Console />
      <button onClick={() => dispatch({ type: 'monter' })}>Depuis App</button>
    </ContexteAlerte.Provider>
  );
}`;
    const r = step4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/transition|dispatch/);
  });

  it("rejects a value that carries only dispatch, without etat (finding 5)", () => {
    const code = fullSolution.replace("value={{ etat, dispatch }}", "value={{ dispatch }}");
    const r = step4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/etat/);
  });
});

/**
 * A `hint` rejected by its own validator would block the learner who follows
 * the displayed hint.
 */
describe("react/chapitre-8 — each hint passes its own validator", () => {
  it("passes all four hints", () => {
    chapter8.steps.forEach((step, i) => {
      const r = validators[i]!(step.hint);
      expect(r.ok, `etape ${i + 1} : hint refuse — ${r.msg}`).toBe(true);
    });
  });
});
