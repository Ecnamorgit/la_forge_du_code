import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-12";
import { getChapterData } from "@/lib/courses-registry";

/**
 * JS chapter 12 — full CRUD on a REST API.
 *
 * Static validators, as in chapter 11: the host is fictional.
 */

describe("JS chapter 12 — step 1 (read the fleet)", () => {
  const validate = validators[0];

  it("passes a checked and logged GET", () => {
    const code = `const response = await fetch('https://api.codeforge.space/vaisseaux');
if (response.ok) {
  console.log(await response.json());
}`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an explicit GET with options", () => {
    // Targeted failure: the step teaches that GET is the default behavior.
    const code = `const response = await fetch('https://api.codeforge.space/vaisseaux', { method: 'GET' });
if (response.ok) {
  console.log(await response.json());
}`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a call whose status is not checked", () => {
    const code = `const response = await fetch('https://api.codeforge.space/vaisseaux');
console.log(await response.json());`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("JS chapter 12 — step 2 (create)", () => {
  const validate = validators[1];

  it("passes a complete POST", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nom: 'Phoenix', classe: 'cargo' }),
});`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a non-serialized body", () => {
    // Targeted failure: a raw object as the body is not sent as JSON.
    const code = `await fetch('https://api.codeforge.space/vaisseaux', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: { nom: 'Phoenix', classe: 'cargo' },
});`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a POST without headers", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux', {
  method: 'POST',
  body: JSON.stringify({ nom: 'Phoenix', classe: 'cargo' }),
});`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("JS chapter 12 — step 3 (update)", () => {
  const validate = validators[2];

  it("passes a PUT on the targeted resource", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux/42', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nom: 'Phoenix II', classe: 'combat' }),
});`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a PUT on the collection instead of the resource", () => {
    // Targeted failure: without the id in the URL, there is no way to know what to replace.
    const code = `await fetch('https://api.codeforge.space/vaisseaux', {
  method: 'PUT',
  body: JSON.stringify({ nom: 'Phoenix II', classe: 'combat' }),
});`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a POST where a PUT is expected", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux/42', {
  method: 'POST',
  body: JSON.stringify({ nom: 'Phoenix II', classe: 'combat' }),
});`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("JS chapter 12 — step 4 (delete)", () => {
  const validate = validators[3];

  const OK = `const response = await fetch('https://api.codeforge.space/vaisseaux/13', {
  method: 'DELETE',
});
if (response.ok) {
  console.log('Vaisseau retiré de la flotte');
}`;

  it("passes a confirmed DELETE and marks the final step", () => {
    const r = validate(OK);
    expect(r.ok).toBe(true);
    expect(r.final).toBe(true);
  });

  it("rejects a deletion whose success is not checked", () => {
    const code = `await fetch('https://api.codeforge.space/vaisseaux/13', { method: 'DELETE' });
console.log('Vaisseau retiré de la flotte');`;
    expect(validate(code).ok).toBe(false);
  });

  it("passes the hint given in the lesson", () => {
    const hint = getChapterData("javascript", "chapitre-12")!.steps[3].hint;
    expect(validate(hint).ok).toBe(true);
  });

  it("accepts the message without an accent", () => {
    expect(validate(OK.replace("retiré", "retire")).ok).toBe(true);
  });

  it("rejects a deletion on another id", () => {
    const code = `const response = await fetch('https://api.codeforge.space/vaisseaux/8', {
  method: 'DELETE',
});
if (response.ok) {
  console.log('Vaisseau retiré de la flotte');
}`;
    expect(validate(code).ok).toBe(false);
  });
});
