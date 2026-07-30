import { describe, expect, it } from "vitest";

import { chapitre7 } from "@/data/courses/react/chapitre-7";
import { validators } from "./chapitre-7";

const [etape1, etape2, etape3, etape4] = validators;

describe("react/chapitre-7 — etape 1 : extraire un hook", () => {
  it("accepte un hook declare avec function, appele depuis le composant", () => {
    const code = `function useCompteur() {
  const [n, setN] = useState(0);
  return { n, augmenter: () => setN(n + 1) };
}
function Reacteur() {
  const { n } = useCompteur();
  return <button>{n}</button>;
}`;
    expect(etape1!(code).ok).toBe(true);
  });

  it("accepte la forme flechee const useX = () => { ... }", () => {
    const code = `const useCompteur = () => {
  const [n, setN] = useState(0);
  return { n, setN };
};
function Reacteur() {
  const { n } = useCompteur();
  return <button>{n}</button>;
}`;
    expect(etape1!(code).ok).toBe(true);
  });

  it("refuse une fonction non prefixee par use", () => {
    const code = `function compteur() {
  const [n, setN] = useState(0);
  return { n, setN };
}
function Reacteur() {
  const { n } = compteur();
  return <button>{n}</button>;
}`;
    const r = etape1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/use/i);
  });

  it("refuse un hook declare dont l'etat est reste dans le composant", () => {
    const code = `function useCompteur() {
  return {};
}
function Reacteur() {
  const [n, setN] = useState(0);
  useCompteur();
  return <button>{n}</button>;
}`;
    const r = etape1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useState/);
  });

  it("refuse un hook correct mais jamais appele", () => {
    const code = `function useCompteur() {
  const [n, setN] = useState(0);
  return { n, setN };
}
function Reacteur() {
  return <button>0</button>;
}`;
    const r = etape1!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/jamais appele/);
  });
});

describe("react/chapitre-7 — etape 2 : contrat de retour", () => {
  const hookOk = `function useBouclier() {
  const [charge, setCharge] = useState(100);
  const recharger = () => setCharge(100);
  return { charge, recharger };
}`;

  it("accepte un retour objet destructure par le composant", () => {
    const code = `${hookOk}
function Bouclier() {
  const { charge, recharger } = useBouclier();
  return <div onClick={recharger}>{charge}</div>;
}`;
    expect(etape2!(code).ok).toBe(true);
  });

  it("accepte un retour tableau destructure par le composant", () => {
    const code = `function useBouclier() {
  const [charge, setCharge] = useState(100);
  return [charge, () => setCharge(100)];
}
function Bouclier() {
  const [charge, recharger] = useBouclier();
  return <div onClick={recharger}>{charge}</div>;
}`;
    expect(etape2!(code).ok).toBe(true);
  });

  it("refuse un hook qui ne retourne rien (le startCode)", () => {
    const code = `function useBouclier() {
  const [charge, setCharge] = useState(100);
  const recharger = () => setCharge(100);
}
function Bouclier() {
  return <div>???</div>;
}`;
    const r = etape2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/retourne rien/);
  });

  it("compte correctement les sorties quand un membre du retour contient un objet imbrique", () => {
    const code = `function useBouclier() {
  const [charge, setCharge] = useState({ valeur: 100 });
  const recharger = () => setCharge({ valeur: 100 });
  return { etat: { charge }, recharger };
}
function Bouclier() {
  const { etat, recharger } = useBouclier();
  return <div onClick={recharger}>{etat.charge.valeur}</div>;
}`;
    expect(etape2!(code).ok).toBe(true);
  });

  it("refuse un retour a une seule sortie", () => {
    const code = `function useBouclier() {
  const [charge, setCharge] = useState(100);
  return { charge };
}
function Bouclier() {
  const { charge } = useBouclier();
  return <div>{charge}</div>;
}`;
    const r = etape2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/DEUX/);
  });

  it("refuse un hook correct dont le composant ne destructure pas", () => {
    const code = `${hookOk}
function Bouclier() {
  const b = useBouclier();
  return <div>{b.charge}</div>;
}`;
    const r = etape2!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/Destructure/);
  });
});

describe("react/chapitre-7 — etape 3 : abonnement et cleanup", () => {
  const complet = `function useLargeurHublot() {
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

  it("accepte un hook qui s'abonne et se desabonne", () => {
    expect(etape3!(complet).ok).toBe(true);
  });

  it("refuse un abonnement sans cleanup", () => {
    const code = `function useLargeurHublot() {
  const [largeur, setLargeur] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener('resize', () => setLargeur(window.innerWidth));
  }, []);
  return largeur;
}`;
    const r = etape3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/cleanup/);
  });

  it("refuse un removeEventListener hors du cleanup", () => {
    const code = `function useLargeurHublot() {
  const [largeur, setLargeur] = useState(0);
  useEffect(() => {
    window.removeEventListener('resize', surResize);
    window.addEventListener('resize', surResize);
  }, []);
  return largeur;
}`;
    const r = etape3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/cleanup/);
  });

  it("refuse un cleanup qui APPELLE removeEventListener au lieu de le retourner (finding 2)", () => {
    const code = `function useLargeurHublot() {
  const [largeur, setLargeur] = useState(window.innerWidth);
  useEffect(() => {
    const surResize = () => setLargeur(window.innerWidth);
    window.addEventListener('resize', surResize);
    return window.removeEventListener('resize', surResize);
  }, []);
  return largeur;
}`;
    const r = etape3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/cleanup/);
  });

  it("accepte un cleanup NOMME declare puis retourne par reference", () => {
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
    expect(etape3!(code).ok).toBe(true);
  });

  it("refuse un hook sans etat (l'affichage ne se mettrait jamais a jour)", () => {
    const code = `function useLargeurHublot() {
  let largeur = window.innerWidth;
  useEffect(() => {
    const surResize = () => { largeur = window.innerWidth; };
    window.addEventListener('resize', surResize);
    return () => window.removeEventListener('resize', surResize);
  }, []);
  return largeur;
}`;
    const r = etape3!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/useState/);
  });

  it("ne se laisse pas valider par un useEffect exterieur au hook", () => {
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
    expect(etape3!(code).ok).toBe(false);
  });
});

describe("react/chapitre-7 — etape 4 : regles des hooks", () => {
  it("accepte l'appel remonte avant le return anticipe", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  if (!visible) return null;
  return <div>{mode}</div>;
}`;
    expect(etape4!(code).ok).toBe(true);
  });

  it("refuse un appel de hook enferme dans un if (le startCode)", () => {
    const code = `function Panneau({ visible }) {
  if (visible) {
    const [mode, setMode] = useState('auto');
    return <div>{mode}</div>;
  }
  return null;
}`;
    const r = etape4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/if/);
  });

  it("refuse un useEffect enferme dans un if", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  if (visible) {
    useEffect(() => { setMode('manuel'); }, []);
  }
  return <div>{mode}</div>;
}`;
    expect(etape4!(code).ok).toBe(false);
  });

  it("refuse la suppression du comportement conditionnel", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  return <div>{mode}</div>;
}`;
    const r = etape4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/conditionnel/);
  });

  it("refuse un appel place apres la condition", () => {
    const code = `function Panneau({ visible }) {
  if (!visible) return null;
  const [mode, setMode] = useState('auto');
  return <div>{mode}</div>;
}`;
    const r = etape4!(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/preceder|premiere ligne/);
  });

  it("accepte un ternaire comme comportement conditionnel", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  return visible ? <div>{mode}</div> : null;
}`;
    expect(etape4!(code).ok).toBe(true);
  });

  it("accepte && comme comportement conditionnel (finding 1)", () => {
    const code = `function Panneau({ visible }) {
  const [mode, setMode] = useState('auto');
  return <div>{visible && <span>Mode : {mode}</span>}</div>;
}`;
    expect(etape4!(code).ok).toBe(true);
  });
});

/**
 * Garde-fou repris des chapitres 5 et 6 : un `hint` que son propre validateur
 * refuserait est un defaut grave — le Cadet suivrait l'indice affiche et
 * resterait bloque.
 */
describe("react/chapitre-7 — chaque hint passe son propre validateur", () => {
  it("valide les quatre hints", () => {
    chapitre7.steps.forEach((step, i) => {
      const r = validators[i]!(step.hint);
      expect(r.ok, `etape ${i + 1} : hint refuse — ${r.msg}`).toBe(true);
    });
  });
});
