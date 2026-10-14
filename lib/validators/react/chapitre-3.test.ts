import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-3";

/**
 * React chapter 3 — useEffect: mount, dependencies, cleanup, loading.
 */

const IMPORT = `import { useState, useEffect } from 'react';`;

describe("React chapter 3 — step 1 (effect on mount)", () => {
  const validate = validators[0];

  it("accepts a logging effect with an empty dependency array", () => {
    const code = `${IMPORT}
function Station() {
  useEffect(() => {
    console.log('Composant en ligne');
  }, []);
  return <div>Station</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an effect without a dependency array", () => {
    // Targeted failure: without [], the effect re-runs on every render.
    const code = `${IMPORT}
function Station() {
  useEffect(() => {
    console.log('Composant en ligne');
  });
  return <div>Station</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a useEffect that is not imported", () => {
    const code = `import { useState } from 'react';
function Station() {
  useEffect(() => {
    console.log('Composant en ligne');
  }, []);
  return <div>Station</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 3 — step 2 (effect depending on a value)", () => {
  const validate = validators[1];

  it("accepts document.title synced with count", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = 'Score ' + count;
  }, [count]);
  return <div>{count}</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an effect that does not declare count as a dependency", () => {
    // Targeted failure: the title would only update on mount.
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = 'Score ' + count;
  }, []);
  return <div>{count}</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects an effect that does not touch the title", () => {
    const code = `${IMPORT}
function Compteur() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log(count);
  }, [count]);
  return <div>{count}</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 3 — step 3 (interval cleanup)", () => {
  const validate = validators[2];

  it("accepts a setInterval cleaned up on unmount", () => {
    const code = `${IMPORT}
function Horloge() {
  useEffect(() => {
    const id = setInterval(() => console.log('tic'), 1000);
    return () => clearInterval(id);
  }, []);
  return <div>Horloge</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an interval that is never cleaned up", () => {
    // Targeted failure: this is exactly the leak the step teaches to avoid.
    const code = `${IMPORT}
function Horloge() {
  useEffect(() => {
    setInterval(() => console.log('tic'), 1000);
  }, []);
  return <div>Horloge</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a cleanup that does not stop the interval", () => {
    const code = `${IMPORT}
function Horloge() {
  useEffect(() => {
    const id = setInterval(() => console.log('tic'), 1000);
    return () => console.log('demonte');
  }, []);
  return <div>Horloge</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("React chapter 3 — step 4 (data loading)", () => {
  const validate = validators[3];

  it("accepts a fetch on mount with a loading state", () => {
    const code = `${IMPORT}
function Flotte() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/flotte').then((r) => r.json()).then(setData);
  }, []);
  if (data === null) return <div>Chargement...</div>;
  return <div>{data.length}</div>;
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a fetch without a loading state", () => {
    // Targeted failure: the learner would show a blank screen while waiting.
    const code = `${IMPORT}
function Flotte() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/flotte').then((r) => r.json()).then(setData);
  }, []);
  return <div>{data.length}</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a component without fetch", () => {
    const code = `${IMPORT}
function Flotte() {
  const [data, setData] = useState(null);
  useEffect(() => {
    setData([]);
  }, []);
  if (data === null) return <div>Chargement...</div>;
  return <div>{data.length}</div>;
}`;
    expect(validate(code).ok).toBe(false);
  });
});
