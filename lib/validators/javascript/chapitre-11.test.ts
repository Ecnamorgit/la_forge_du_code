import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-11";

/**
 * JS chapter 11 — fetch.
 *
 * Unlike chapters 1 to 10, these validators are static: the API host is
 * fictional and never resolves in the sandbox, so it is the written code
 * that is inspected, not its output. No context to provide.
 */

describe("JS chapter 11 — step 1 (first call)", () => {
  const validate = validators[0];

  it("passes a fetch chained to a then that logs", () => {
    const code = `fetch('https://api.codeforge.space/ping')
  .then((r) => console.log(r));`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a fetch without then", () => {
    expect(validate(`fetch('https://api.codeforge.space/ping');`).ok).toBe(false);
  });

  it("rejects a call to another URL", () => {
    // Targeted failure: the step names the endpoint explicitly.
    const code = `fetch('https://api.codeforge.space/status')
  .then((r) => console.log(r));`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("JS chapter 11 — step 2 (decode the JSON)", () => {
  const validate = validators[1];

  it("passes two thens, one of them with json()", () => {
    const code = `fetch('https://api.codeforge.space/vaisseau')
  .then((response) => response.json())
  .then((data) => console.log(data));`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a single then, without decoding", () => {
    const code = `fetch('https://api.codeforge.space/vaisseau')
  .then((response) => console.log(response));`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a json() without a second then to use it", () => {
    // Targeted failure: the data is decoded and then lost.
    const code = `fetch('https://api.codeforge.space/vaisseau')
  .then((response) => response.json());`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("JS chapter 11 — step 3 (switch to async/await)", () => {
  const validate = validators[2];

  it("passes an await on the fetch and on the json", () => {
    const code = `async function charger() {
  const response = await fetch('https://api.codeforge.space/vaisseau');
  const data = await response.json();
  console.log(data);
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an await on the fetch only", () => {
    // Targeted failure: json() also returns a promise, often forgotten.
    const code = `async function charger() {
  const response = await fetch('https://api.codeforge.space/vaisseau');
  const data = response.json();
  console.log(data);
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a non-async function", () => {
    const code = `function charger() {
  const response = fetch('https://api.codeforge.space/vaisseau');
  console.log(response);
}`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("JS chapter 11 — step 4 (handle the failure)", () => {
  const validate = validators[3];

  const OK = `async function charger() {
  try {
    const response = await fetch('https://api.codeforge.space/vaisseau');
    if (!response.ok) throw new Error(response.status);
    console.log(await response.json());
  } catch (e) {
    console.log('Erreur de transmission : ' + e.message);
  }
}`;

  it("passes a try/catch that checks response.ok", () => {
    const r = validate(OK);
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects a try/catch that does not check response.ok", () => {
    // Targeted failure: fetch does not reject on a 404, only .ok reveals it.
    const code = `async function charger() {
  try {
    const response = await fetch('https://api.codeforge.space/vaisseau');
    console.log(await response.json());
  } catch (e) {
    console.log('Erreur de transmission : ' + e.message);
  }
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a catch with a message other than the one requested", () => {
    const code = `async function charger() {
  try {
    const response = await fetch('https://api.codeforge.space/vaisseau');
    if (!response.ok) throw new Error(response.status);
  } catch (e) {
    console.log('Oups : ' + e.message);
  }
}`;
    expect(validate(code).ok).toBe(false);
  });
});
