import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-4";

/**
 * React chapitre 4 — react-router : routes, liens, parametres, navigation.
 */

describe("React chapitre 4 — etape 1 (declarer les routes)", () => {
  const valider = validators[0];

  it("accepte un BrowserRouter avec deux routes", () => {
    const code = `function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/a-propos" element={<APropos />} />
      </Routes>
    </BrowserRouter>
  );
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une seule route", () => {
    const code = `function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
      </Routes>
    </BrowserRouter>
  );
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse des routes hors de BrowserRouter", () => {
    // Echec cible : sans le routeur, aucune route ne se resout.
    const code = `function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/a-propos" element={<APropos />} />
    </Routes>
  );
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 4 — etape 2 (navigation par Link)", () => {
  const valider = validators[1];

  it("accepte deux Link dans un nav", () => {
    const code = `import { Link } from 'react-router-dom';
function Menu() {
  return (
    <nav>
      <Link to="/">Accueil</Link>
      <Link to="/a-propos">A propos</Link>
    </nav>
  );
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse des ancres <a href> a la place des Link", () => {
    // Echec cible : une ancre recharge la page et casse la SPA.
    const code = `import { Link } from 'react-router-dom';
function Menu() {
  return (
    <nav>
      <a href="/">Accueil</a>
      <a href="/a-propos">A propos</a>
    </nav>
  );
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse des Link poses hors d'un nav", () => {
    const code = `import { Link } from 'react-router-dom';
function Menu() {
  return (
    <div>
      <Link to="/">Accueil</Link>
      <Link to="/a-propos">A propos</Link>
    </div>
  );
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 4 — etape 3 (parametre d'URL)", () => {
  const valider = validators[2];

  it("accepte useParams lu et affiche", () => {
    const code = `import { useParams } from 'react-router-dom';
function Vaisseau() {
  const { id } = useParams();
  return <div>Vaisseau : {id}</div>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un id lu mais jamais affiche", () => {
    // Echec cible : rien ne prouve que le parametre a ete compris.
    const code = `import { useParams } from 'react-router-dom';
function Vaisseau() {
  const { id } = useParams();
  return <div>Vaisseau</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse un id passe en prop plutot que lu dans l'URL", () => {
    const code = `function Vaisseau({ id }) {
  return <div>Vaisseau : {id}</div>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("React chapitre 4 — etape 4 (redirection programmatique)", () => {
  const valider = validators[3];

  it("accepte useNavigate suivi d'une redirection", () => {
    const code = `import { useNavigate } from 'react-router-dom';
function Connexion() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/dashboard')}>Entrer</button>;
}`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un useNavigate jamais appele", () => {
    const code = `import { useNavigate } from 'react-router-dom';
function Connexion() {
  const navigate = useNavigate();
  return <button>Entrer</button>;
}`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une redirection vers une autre destination", () => {
    // Echec cible : l'etape nomme explicitement /dashboard.
    const code = `import { useNavigate } from 'react-router-dom';
function Connexion() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/accueil')}>Entrer</button>;
}`;
    expect(valider(code).ok).toBe(false);
  });
});
