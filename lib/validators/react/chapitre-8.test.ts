import { describe, expect, it } from "vitest";

import { chapitre8 } from "@/data/courses/react/chapitre-8";
import { validators } from "./chapitre-8";

const [etape1, etape2, etape3, etape4] = validators;

describe("react/chapitre-8 — etape 1 : creer et diffuser un contexte", () => {
  it("accepte createContext plus un Provider avec value", () => {
    const code = `const ContexteFlotte = createContext(null);
function App() {
  return (
    <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}>
      <Pont />
    </ContexteFlotte.Provider>
  );
}`;
    expect(etape1!(code).ok).toBe(true);
  });

  it("refuse l'absence de createContext", () => {
    const code = `function App() {
  return <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}><Pont /></ContexteFlotte.Provider>;
}`;
    const r = etape1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/createContext/);
  });

  it("refuse un contexte cree mais jamais diffuse (le startCode)", () => {
    const code = `const ContexteFlotte = createContext(null);
function App() {
  return <Pont />;
}`;
    const r = etape1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Provider/);
  });

  it("refuse un Provider sans attribut value", () => {
    const code = `const ContexteFlotte = createContext(null);
function App() {
  return <ContexteFlotte.Provider><Pont /></ContexteFlotte.Provider>;
}`;
    const r = etape1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/value/);
  });

  it("voit la value meme avec des accolades imbriquees", () => {
    const code = `const C = createContext(null);
function App() {
  return <C.Provider value={{ a: { b: 1 } }}><X /></C.Provider>;
}`;
    expect(etape1!(code).ok).toBe(true);
  });

  it("refuse un Provider sans value meme si un element PLUS LOIN en a une (finding 6)", () => {
    const code = `const ContexteFlotte = createContext(null);
function App() {
  return (
    <ContexteFlotte.Provider>
      <input value={nom} />
    </ContexteFlotte.Provider>
  );
}`;
    const r = etape1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/value/);
  });
});

describe("react/chapitre-8 — etape 2 : consommer avec useContext", () => {
  it("accepte la destructuration affichee dans le JSX", () => {
    const code = `const ContexteFlotte = createContext(null);
function Console() {
  const { amiral } = useContext(ContexteFlotte);
  return <div>Amiral : {amiral}</div>;
}`;
    expect(etape2!(code).ok).toBe(true);
  });

  it("accepte l'acces par variable puis propriete", () => {
    const code = `const ContexteFlotte = createContext(null);
function Console() {
  const flotte = useContext(ContexteFlotte);
  return <div>Amiral : {flotte.amiral}</div>;
}`;
    expect(etape2!(code).ok).toBe(true);
  });

  it("refuse l'absence de useContext (le startCode)", () => {
    const code = `const ContexteFlotte = createContext(null);
function Console() {
  return <div>Amiral : ???</div>;
}`;
    const r = etape2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useContext/);
  });

  it("refuse useContext sans argument", () => {
    const code = `function Console() {
  const { amiral } = useContext();
  return <div>{amiral}</div>;
}`;
    const r = etape2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/objet contexte/);
  });

  it("refuse une valeur lue mais jamais affichee", () => {
    const code = `const ContexteFlotte = createContext(null);
function Console() {
  const { amiral } = useContext(ContexteFlotte);
  return <div>Pont de commandement</div>;
}`;
    const r = etape2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Affiche/);
  });

  it("refuse une valeur lue dans Console mais affichee seulement dans un AUTRE composant (finding 3)", () => {
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
    const r = etape2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Affiche/);
  });
});

describe("react/chapitre-8 — etape 3 : useReducer", () => {
  const reducteurOk = `function reducteur(etat, action) {
  switch (action.type) {
    case 'monter':
      return { niveau: etat.niveau + 1 };
    case 'descendre':
      return { niveau: etat.niveau - 1 };
    default:
      return etat;
  }
}`;

  it("accepte un reducteur a deux actions branche et utilise", () => {
    const code = `${reducteurOk}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    expect(etape3!(code).ok).toBe(true);
  });

  it("accepte la forme action.type === au lieu du switch", () => {
    const code = `function reducteur(etat, action) {
  if (action.type === 'monter') return { niveau: etat.niveau + 1 };
  if (action.type === 'descendre') return { niveau: etat.niveau - 1 };
  return etat;
}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    expect(etape3!(code).ok).toBe(true);
  });

  it("refuse l'absence de useReducer (le startCode)", () => {
    const code = `function Alerte() {
  return <div>Niveau : ???</div>;
}`;
    const r = etape3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useReducer/);
  });

  it("refuse un reducteur a une seule action", () => {
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
    const r = etape3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/une action|deux transitions/);
  });

  it("refuse un reducteur sans cas default", () => {
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
    const r = etape3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/default/);
  });

  it("refuse un reducteur correct dont aucune action n'est envoyee", () => {
    const code = `${reducteurOk}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <div>{etat.niveau}</div>;
}`;
    const r = etape3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/dispatch/);
  });

  it("refuse un default qui ne retourne rien (finding 4, loose)", () => {
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
    const r = etape3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/default/);
  });

  it("accepte un default avec un commentaire de fin de ligne apres le return (finding 4, brittle)", () => {
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
    expect(etape3!(code).ok).toBe(true);
  });

  it("accepte un reducteur if/else se terminant par return { ...etat } (finding 4, brittle)", () => {
    const code = `function reducteur(etat, action) {
  if (action.type === 'monter') return { ...etat, niveau: etat.niveau + 1 };
  if (action.type === 'descendre') return { ...etat, niveau: etat.niveau - 1 };
  return { ...etat };
}
function Alerte() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <button onClick={() => dispatch({ type: 'monter' })}>{etat.niveau}</button>;
}`;
    expect(etape3!(code).ok).toBe(true);
  });

  it("ne se laisse pas valider par un switch sans rapport avec le reducteur", () => {
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
    expect(etape3!(code).ok).toBe(false);
  });
});

describe("react/chapitre-8 — etape 4 : contexte plus reducteur", () => {
  const complet = `const ContexteAlerte = createContext(null);
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

  it("accepte la combinaison complete", () => {
    expect(etape4!(complet).ok).toBe(true);
  });

  it("refuse une value qui ne transporte que l'etat", () => {
    const code = complet.replace("value={{ etat, dispatch }}", "value={{ etat }}");
    const r = etape4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/dispatch/);
  });

  it("refuse l'absence de Provider", () => {
    const code = `const ContexteAlerte = createContext(null);
function App() {
  const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });
  return <Console />;
}`;
    const r = etape4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Provider/);
  });

  it("refuse un consommateur qui ne declenche aucune action", () => {
    const code = complet.replace(
      "<button onClick={() => dispatch({ type: 'monter' })}>Alerte {etat.niveau}</button>",
      "<button>Alerte {etat.niveau}</button>"
    );
    const r = etape4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/transition|dispatch/);
  });

  it("refuse l'absence de useReducer", () => {
    const code = `const ContexteAlerte = createContext(null);
function App() {
  const [etat, setEtat] = useState({ niveau: 0 });
  return <ContexteAlerte.Provider value={{ etat, dispatch }}><Console /></ContexteAlerte.Provider>;
}`;
    const r = etape4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useReducer/);
  });

  it("refuse un dispatch declenche depuis App plutot que depuis le consommateur (finding 5)", () => {
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
    const r = etape4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/transition|dispatch/);
  });

  it("refuse une value qui ne transporte que dispatch, sans etat (finding 5)", () => {
    const code = complet.replace("value={{ etat, dispatch }}", "value={{ dispatch }}");
    const r = etape4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/etat/);
  });
});

/**
 * Un `hint` refusé par son propre validateur bloquerait l'apprenant qui suit
 * l'indice affiché.
 */
describe("react/chapitre-8 — chaque hint passe son propre validateur", () => {
  it("valide les quatre hints", () => {
    chapitre8.steps.forEach((step, i) => {
      const r = validators[i]!(step.hint);
      expect(r.ok, `etape ${i + 1} : hint refuse — ${r.msg}`).toBe(true);
    });
  });
});
