import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * HTML chapter 1 — the minimal structure of a document.
 *
 * This chapter has 3 steps, not 4: it is the only one in the track like that.
 */

describe("HTML chapter 1 — step 1 (doctype and html wrapper)", () => {
  const validate = validators[0];

  it("accepts a doctype followed by an opened and closed html", () => {
    expect(validate("<!DOCTYPE html>\n<html>\n</html>").ok).toBe(true);
  });

  it("rejects a document without a doctype", () => {
    expect(validate("<html>\n</html>").ok).toBe(false);
  });

  it("rejects an html tag that is never closed", () => {
    // Targeted failure: the doctype is there, the wrapper is not closed.
    expect(validate("<!DOCTYPE html>\n<html>").ok).toBe(false);
  });
});

describe("HTML chapter 1 — step 2 (head and title)", () => {
  const validate = validators[1];

  it("accepts a head containing a filled-in title", () => {
    expect(
      validate("<!DOCTYPE html><html><head><title>Nebula</title></head></html>").ok
    ).toBe(true);
  });

  it("rejects an empty title", () => {
    // Targeted failure: the tag exists but names nothing.
    expect(
      validate("<!DOCTYPE html><html><head><title>   </title></head></html>").ok
    ).toBe(false);
  });

  it("rejects a title placed outside the head", () => {
    expect(validate("<!DOCTYPE html><html><title>Nebula</title></html>").ok).toBe(false);
  });
});

describe("HTML chapter 1 — step 3 (body and first heading)", () => {
  const validate = validators[2];

  it("accepts a body containing h1 Hello World", () => {
    expect(
      validate("<html><body><h1>Hello World</h1></body></html>").ok
    ).toBe(true);
  });

  it("rejects an h1 whose text is not the requested one", () => {
    expect(validate("<html><body><h1>Bonjour</h1></body></html>").ok).toBe(false);
  });

  it("rejects an h1 placed outside the body", () => {
    expect(validate("<html><h1>Hello World</h1></html>").ok).toBe(false);
  });
});
