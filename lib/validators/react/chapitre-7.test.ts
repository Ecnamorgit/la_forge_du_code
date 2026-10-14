import { describe, expect, it } from "vitest";

import { chapter7 } from "@/data/courses/react/chapitre-7";
import { validators } from "./chapitre-7";

const [step1, step2, step3, step4] = validators;

describe("react/chapitre-7 — step 1: extract a hook", () => {
  it("accepts a hook declared with function, called from the component", () => {
    const code = `function useCompteur() {
  const [n, setN] = useState(0);
  return { n, augmenter: () => setN(n + 1) };
}
function Reacteur() {
  const { n } = useCompteur();
  return <button>{n}</button>;
}`;
    expect(step1!(code).ok).toBe(true);
  });

  it("accepts the arrow form const useX = () => { ... }", () => {
    const code = `const useCompteur = () => {
  const [n, setN] = useState(0);
  return { n, setN };
};
function Reacteur() {
  const { n } = useCompteur();
  return <button>{n}</button>;
}`;
    expect(step1!(code).ok).toBe(true);
  });

  it("rejects a function not prefixed with use", () => {
    const code = `function compteur() {
  const [n, setN] = useState(0);
  return { n, setN };
}
function Reacteur() {
  const { n } = compteur();
  return <button>{n}</button>;
}`;
    const r = step1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/use/i);
  });

  it("rejects a declared hook whose state stayed in the component", () => {
    const code = `function useCompteur() {
  return {};
}
function Reacteur() {
  const [n, setN] = useState(0);
  useCompteur();
  return <button>{n}</button>;
}`;
    const r = step1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useState/);
  });

  it("rejects a correct hook that is never called", () => {
    const code = `function useCompteur() {
  const [n, setN] = useState(0);
  return { n, setN };
}
function Reacteur() {
  return <button>0</button>;
}`;
    const r = step1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/jamais appelé/);
  });
});

describe("react/chapitre-7 — step 2: return contract", () => {
  const hookOk = `function useBouclier() {
  const [charge, setCharge] = useState(100);
  const recharger = () => setCharge(100);
  return { charge, recharger };
}`;

  it("accepts an object return destructured by the component", () => {
    const code = `${hookOk}
function Bouclier() {
  const { charge, recharger } = useBouclier();
  return <div onClick={recharger}>{charge}</div>;
}`;
    expect(step2!(code).ok).toBe(true);
  });

  it("accepts an array return destructured by the component", () => {
    const code = `function useBouclier() {
  const [charge, setCharge] = useState(100);
  return [charge, () => setCharge(100)];
}
function Bouclier() {
  const [charge, recharger] = useBouclier();
  return <div onClick={recharger}>{charge}</div>;
}`;
    expect(step2!(code).ok).toBe(true);
  });

  it("rejects a hook that returns nothing (the startCode)", () => {
    const code = `function useBouclier() {
  const [charge, setCharge] = useState(100);
  const recharger = () => setCharge(100);
}
function Bouclier() {
  return <div>???</div>;
}`;
    const r = step2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/retourne rien/);
  });

  it("counts the outputs correctly when a returned member contains a nested object", () => {
    const code = `function useBouclier() {
  const [charge, setCharge] = useState({ valeur: 100 });
  const recharger = () => setCharge({ valeur: 100 });
  return { etat: { charge }, recharger };
}
function Bouclier() {
  const { etat, recharger } = useBouclier();
  return <div onClick={recharger}>{etat.charge.valeur}</div>;
}`;
    expect(step2!(code).ok).toBe(true);
  });

  it("rejects a return with a single output", () => {
    const code = `function useBouclier() {
  const [charge, setCharge] = useState(100);
  return { charge };
}
function Bouclier() {
  const { charge } = useBouclier();
  return <div>{charge}</div>;
}`;
    const r = step2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/DEUX/);
  });

  it("rejects a correct hook whose component does not destructure", () => {
    const code = `${hookOk}
function Bouclier() {
  const b = useBouclier();
  return <div>{b.charge}</div>;
}`;
    const r = step2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Destructure/);
  });
});

describe("react/chapitre-7 — step 3: subscription and cleanup", () => {
  const fullSolution = `function useLargeurHublot() {
  const [largeur, setLargeur] = useState(window.innerWidth);
  useEffect(() => {
    const surResize = () => setLargeur(window.innerWidth);
    window.addEventListener('resize', surResize);
    return () => window.removeEventListener('resize', surResize);
  }, []);
  return largeur;
}
function Hublot() {
  const largeur = useLargeurHublot();
  return <div>{largeur}</div>;
}`;

  it("accepts a hook that subscribes and unsubscribes", () => {
    expect(step3!(fullSolution).ok).toBe(true);
  });

  it("rejects a subscription without cleanup", () => {
    const code = `function useLargeurHublot() {
  const [largeur, setLargeur] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener('resize', () => setLargeur(window.innerWidth));
  }, []);
  return largeur;
}`;
    const r = step3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/cleanup/);
  });

  it("rejects a removeEventListener outside the cleanup", () => {
    const code = `function useLargeurHublot() {
  const [largeur, setLargeur] = useState(0);
  useEffect(() => {
    window.removeEventListener('resize', surResize);
    window.addEventListener('resize', surResize);
  }, []);
  return largeur;
}`;
    const r = step3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/cleanup/);
  });

  it("rejects a cleanup that CALLS removeEventListener instead of returning it (finding 2)", () => {
    const code = `function useLargeurHublot() {
  const [largeur, setLargeur] = useState(window.innerWidth);
  useEffect(() => {
    const surResize = () => setLargeur(window.innerWidth);
    window.addEventListener('resize', surResize);
    return window.removeEventListener('resize', surResize);
  }, []);
  return largeur;
}`;
    const r = step3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/cleanup/);
  });

  it("accepts a NAMED cleanup declared then returned by reference", () => {
    const code = `function useLargeurHublot() {
  const [largeur, setLargeur] = useState(window.innerWidth);
  useEffect(() => {
    function nettoyer() {
      window.removeEventListener('resize', surResize);
    }
    const surResize = () => setLargeur(window.innerWidth);
    window.addEventListener('resize', surResize);
    return nettoyer;
  }, []);
  return largeur;
}`;
    expect(step3!(code).ok).toBe(true);
  });

  it("rejects a hook without state (the display would never update)", () => {
    const code = `function useLargeurHublot() {
  let largeur = window.innerWidth;
  useEffect(() => {
    const surResize = () => { largeur = window.innerWidth; };
    window.addEventListener('resize', surResize);
    return () => window.removeEventListener('resize', surResize);
  }, []);
  return largeur;
}`;
    const r = step3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useState/);
  });

  it("is not fooled by a useEffect outside the hook", () => {
    const code = `function Autre() {
  useEffect(() => {
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
}
function useLargeurHublot() {
  const [largeur, setLargeur] = useState(0);
  useEffect(() => {
    setLargeur(window.innerWidth);
  }, []);
  return largeur;
}`;
    expect(step3!(code).ok).toBe(false);
  });
});

describe("react/chapitre-7 — step 4: rules of hooks", () => {
  it("accepts the call moved up before the early return", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  if (!visible) return null;
  return <div>{mode}</div>;
}`;
    expect(step4!(code).ok).toBe(true);
  });

  it("rejects a hook call locked inside an if (the startCode)", () => {
    const code = `function Panneau({ visible }) {
  if (visible) {
    const [mode, setMode] = useState('auto');
    return <div>{mode}</div>;
  }
  return null;
}`;
    const r = step4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/if/);
  });

  it("rejects a useEffect locked inside an if", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  if (visible) {
    useEffect(() => { setMode('manuel'); }, []);
  }
  return <div>{mode}</div>;
}`;
    expect(step4!(code).ok).toBe(false);
  });

  it("rejects removing the conditional behavior", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  return <div>{mode}</div>;
}`;
    const r = step4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/conditionnel/);
  });

  it("rejects a call placed after the condition", () => {
    const code = `function Panneau({ visible }) {
  if (!visible) return null;
  const [mode, setMode] = useState('auto');
  return <div>{mode}</div>;
}`;
    const r = step4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/précéder|première ligne/);
  });

  it("accepts a ternary as the conditional behavior", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  return visible ? <div>{mode}</div> : null;
}`;
    expect(step4!(code).ok).toBe(true);
  });

  it("accepts && as the conditional behavior (finding 1)", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  return <div>{visible && <span>Mode : {mode}</span>}</div>;
}`;
    expect(step4!(code).ok).toBe(true);
  });
});

/**
 * A `hint` rejected by its own validator would block the learner who follows
 * the displayed hint.
 */
describe("react/chapitre-7 — each hint passes its own validator", () => {
  it("passes all four hints", () => {
    chapter7.steps.forEach((step, i) => {
      const r = validators[i]!(step.hint);
      expect(r.ok, `etape ${i + 1} : hint refuse — ${r.msg}`).toBe(true);
    });
  });
});
