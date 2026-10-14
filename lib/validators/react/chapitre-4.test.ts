import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-4";

/**
 * React chapter 4 — react-router: routes, links, params, navigation.
 */

describe("React chapter 4 — step 1 (declare the routes)", () => {
  const validate = validators[0];

  it("accepts a BrowserRouter with two routes", () => {
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
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a single route", () => {
    const code = `function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
      </Routes>
    </BrowserRouter>
  );
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects routes outside BrowserRouter", () => {
    // Targeted failure: without the router, no route resolves.
    const code = `function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/a-propos" element={<APropos />} />
    </Routes>
  );
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 4 — step 2 (navigation with Link)", () => {
  const validate = validators[1];

  it("accepts two Link inside a nav", () => {
    const code = `import { Link } from 'react-router-dom';
function Menu() {
  return (
    <nav>
      <Link to="/">Accueil</Link>
      <Link to="/a-propos">A propos</Link>
    </nav>
  );
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects <a href> anchors instead of Link", () => {
    // Targeted failure: an anchor reloads the page and breaks the SPA.
    const code = `import { Link } from 'react-router-dom';
function Menu() {
  return (
    <nav>
      <a href="/">Accueil</a>
      <a href="/a-propos">A propos</a>
    </nav>
  );
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects Link placed outside a nav", () => {
    const code = `import { Link } from 'react-router-dom';
function Menu() {
  return (
    <div>
      <Link to="/">Accueil</Link>
      <Link to="/a-propos">A propos</Link>
    </div>
  );
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 4 — step 3 (URL param)", () => {
  const validate = validators[2];

  it("accepts useParams read and displayed", () => {
    const code = `import { useParams } from 'react-router-dom';
function Vaisseau() {
  const { id } = useParams();
  return <div>Vaisseau : {id}</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an id read but never displayed", () => {
    // Targeted failure: nothing proves the param was understood.
    const code = `import { useParams } from 'react-router-dom';
function Vaisseau() {
  const { id } = useParams();
  return <div>Vaisseau</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an id passed as a prop rather than read from the URL", () => {
    const code = `function Vaisseau({ id }) {
  return <div>Vaisseau : {id}</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 4 — step 4 (programmatic redirect)", () => {
  const validate = validators[3];

  it("accepts useNavigate followed by a redirect", () => {
    const code = `import { useNavigate } from 'react-router-dom';
function Connexion() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/dashboard')}>Entrer</button>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a useNavigate that is never called", () => {
    const code = `import { useNavigate } from 'react-router-dom';
function Connexion() {
  const navigate = useNavigate();
  return <button>Entrer</button>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a redirect to another destination", () => {
    // Targeted failure: the step names /dashboard explicitly.
    const code = `import { useNavigate } from 'react-router-dom';
function Connexion() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/accueil')}>Entrer</button>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});
