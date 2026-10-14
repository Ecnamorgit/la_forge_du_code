import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-1";

/**
 * Git chapter 1 — steps 2 to 4.
 *
 * Step 1 is already covered by `lib/validators/all-chapter-1.test.ts`.
 */

describe("Git — step 2 (status and history)", () => {
  const validate = validators[1];

  it("accepts git status followed by git log --oneline", () => {
    expect(validate("git status\ngit log --oneline").ok).toBe(true);
  });

  it("rejects git log without --oneline", () => {
    // Targeted failure: the step teaches the compact history.
    expect(validate("git status\ngit log").ok).toBe(false);
  });

  it("rejects a history without a prior status", () => {
    expect(validate("git log --oneline").ok).toBe(false);
  });
});

describe("Git — step 3 (branch then merge)", () => {
  const validate = validators[2];

  it("accepts checkout -b then merge", () => {
    expect(
      validate("git checkout -b feature/radar\ngit checkout main\ngit merge feature/radar").ok
    ).toBe(true);
  });

  it("accepts the modern switch -c form", () => {
    expect(
      validate("git switch -c feature/radar\ngit switch main\ngit merge feature/radar").ok
    ).toBe(true);
  });

  it("rejects a branch that is created but never merged", () => {
    expect(validate("git checkout -b feature/radar").ok).toBe(false);
  });

  it("rejects a plain branch switch, without creation", () => {
    expect(validate("git checkout main\ngit merge feature/radar").ok).toBe(false);
  });

  it("rejects checkout -b without a branch name", () => {
    // The name must be on the same line: `\s+` would cross the line break
    // and take the next command as the branch name.
    expect(validate("git checkout -b\ngit merge feature/radar").ok).toBe(false);
  });
});

describe("Git — step 4 (publish to a remote)", () => {
  const validate = validators[3];

  it("accepts remote add then push -u origin main", () => {
    expect(
      validate(
        "git remote add origin https://github.com/lia/nebula.git\ngit push -u origin main"
      ).ok
    ).toBe(true);
  });

  it("rejects a push without -u, which does not set up tracking", () => {
    expect(
      validate(
        "git remote add origin https://github.com/lia/nebula.git\ngit push origin main"
      ).ok
    ).toBe(false);
  });

  it("rejects a remote add without a URL", () => {
    expect(validate("git remote add origin\ngit push -u origin main").ok).toBe(false);
  });
});
