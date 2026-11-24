import { describe, it, expect } from "vitest";

import type { ValidatorContext } from "@/data/courses/html/types";
import { getChapterData, listChapterSlugs } from "@/lib/courses-registry";
import { guardLoops } from "@/lib/sandbox/loop-protect";
import { getValidators } from "../index";

/**
 * "agent-ia" course: every step, across the four chapters.
 *
 * These chapters are judged on a run (`lib/validators/runtime.ts`), so the
 * integrity sweep cannot check them without a context. Here the learner's
 * code is really executed, the way the sandbox runs it
 * (`lib/sandbox/js-runner-document.ts`): a strict function receiving a fake
 * `console` and an in-memory `localStorage`. The validators are then fed the
 * captured logs, so the content and its validation are tested together.
 */

/** Same formatting as the sandbox's `formatArg`. */
function formatArg(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "function") return "[Function]";
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function run(code: string): ValidatorContext {
  const logs: string[] = [];
  const append = (...args: unknown[]) => {
    logs.push(args.map(formatArg).join(" "));
  };
  const fakeConsole = { log: append, info: append, warn: append, error: append, debug: append };
  const store: Record<string, string> = {};
  const fakeStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[String(key)] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
  let error: string | null = null;
  let lastValue: unknown;
  try {
    const fn = new Function(
      "console",
      "localStorage",
      // Instrumented like in production: the loop guard rewrites every loop
      // of an agent before it reaches the sandbox (lib/sandbox/run-js.ts).
      `"use strict"; return (function(){\n${guardLoops(code)}\n})();`
    );
    lastValue = fn(fakeConsole, fakeStorage);
  } catch (err) {
    error = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  }
  return { logs, error, lastValue };
}

const check = (chapter: string, step: number, code: string) =>
  getValidators("agent-ia", chapter)[step - 1](code, run(code));

const CHAPTERS = listChapterSlugs("agent-ia");

describe("Agent IA — every step, run for real", () => {
  it("has four chapters", () => {
    expect(CHAPTERS).toEqual(["chapitre-1", "chapitre-2", "chapitre-3", "chapitre-4"]);
  });

  describe.each(CHAPTERS)("%s", (chapter) => {
    const data = getChapterData("agent-ia", chapter)!;

    data.steps.forEach((step, i) => {
      it(`step ${i + 1}: the hint runs without error and validates`, () => {
        const ctx = run(step.hint);
        expect(ctx.error).toBeNull();
        const result = getValidators("agent-ia", chapter)[i](step.hint, ctx);
        expect(result.ok, result.msg).toBe(true);
        expect([...(result.objList ?? [])].sort()).toEqual(
          step.objectives.map((o) => o.id).sort()
        );
        expect(result.final === true).toBe(i === data.steps.length - 1);
      });

      it(`step ${i + 1}: the start code does not validate`, () => {
        const result = check(chapter, i + 1, step.startCode);
        expect(result.ok, "the learner would have nothing to do").toBe(false);
      });

      it(`step ${i + 1}: refuses to validate without an execution`, () => {
        expect(getValidators("agent-ia", chapter)[i](step.hint).ok).toBe(false);
      });
    });
  });
});

const hint = (chapter: string, step: number) =>
  getChapterData("agent-ia", chapter)!.steps[step - 1].hint;

/** Replaces `from` by `to` in a hint, failing loudly if `from` is absent. */
function mutate(code: string, from: string, to: string): string {
  expect(code, `fragment not found: ${from}`).toContain(from);
  return code.replace(from, to);
}

describe("Agent IA — targeted rejections", () => {
  it("1.3: forgetting to push the first reply breaks the history", () => {
    const code = mutate(hint("chapitre-1", 3), "messages.push(premiere);\n", "");
    const r = check("chapitre-1", 3, code);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("5 messages");
  });

  it("1.4: a history recreated on every call stays at exchange 1", () => {
    const code = `${hint("chapitre-1", 4).split("const messages")[0]}
function envoyer(texte) {
  const messages = [{ role: "system", content: "Tu es ORBI." }];
  messages.push({ role: "user", content: texte });
  const reponse = noyau(messages);
  messages.push(reponse);
  return reponse.content;
}
console.log(envoyer("Statut des moteurs ?"));
console.log(envoyer("Et le carburant ?"));`;
    const r = check("chapitre-1", 4, code);
    expect(r.ok).toBe(false);
    expect(r.tone).toBe("logic");
  });

  it("2.2: the Spectre's outils.nom gets a dedicated message", () => {
    const start = getChapterData("agent-ia", "chapitre-2")!.steps[1].startCode;
    const r = check("chapitre-2", 2, start);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("outils[nom]");
  });

  it("2.3: printing the expected lines by hand is not enough", () => {
    const start = getChapterData("agent-ia", "chapitre-2")!.steps[2].startCode;
    const code = `${start}
console.log("Outil demandé : scanner");
console.log("Secteur B4 : aucune anomalie");`;
    expect(check("chapitre-2", 3, code).ok).toBe(false);
  });

  it("2.4: showing the raw tool result instead of the model's answer fails", () => {
    const code = mutate(hint("chapitre-2", 4), "console.log(finale.content);", "console.log(resultat);");
    expect(check("chapitre-2", 4, code).ok).toBe(false);
  });

  it("3.2: a loop that ignores the cap is refused", () => {
    const code = mutate(hint("chapitre-3", 2), "tour <= MAX_TOURS", "tour <= 4");
    const r = check("chapitre-3", 2, code);
    expect(r.ok).toBe(false);
  });

  it("3.3: an unprotected tool crashes the agent, with a message naming try / catch", () => {
    const start = getChapterData("agent-ia", "chapitre-3")!.steps[2].startCode;
    const r = check("chapitre-3", 3, start);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("try / catch");
  });

  it("3.4: the final turn must be logged too", () => {
    const code = mutate(
      hint("chapitre-3", 4),
      'console.log("Tour " + tour + " : réponse finale");\n',
      ""
    );
    const r = check("chapitre-3", 4, code);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("réponse finale");
  });

  it("4.1: overwriting the memory instead of merging loses the first fact", () => {
    const code = mutate(
      hint("chapitre-4", 1),
      "const memoire = lireMemoire();\n  memoire[cle] = valeur;",
      "const memoire = {};\n  memoire[cle] = valeur;"
    );
    expect(check("chapitre-4", 1, code).ok).toBe(false);
  });

  it("4.2: hard-coded facts are refused", () => {
    const code = mutate(
      hint("chapitre-4", 2),
      '"Tu es ORBI, copilote de la station Nebula. Faits connus : " + faits',
      '"Tu es ORBI, copilote de la station Nebula. Faits connus : pilote = Lia, vaisseau = Aurore"'
    );
    const r = check("chapitre-4", 2, code);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("Object.entries");
  });

  it("4.4: the placeholder names must be replaced", () => {
    const code = mutate(hint("chapitre-4", 4), 'const NOM_AGENT = "ORBI";', 'const NOM_AGENT = "???";');
    const r = check("chapitre-4", 4, code);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("???");
  });

  it("4.4: any agent name and pilot name are accepted, and the success names the agent", () => {
    const code = mutate(
      mutate(hint("chapitre-4", 4), 'const NOM_AGENT = "ORBI";', 'const NOM_AGENT = "Zéphyr";'),
      'const PILOTE = "Lia";',
      'const PILOTE = "Joël";'
    );
    const r = check("chapitre-4", 4, code);
    expect(r.ok, r.msg).toBe(true);
    expect(r.msg).toContain("Zéphyr");
  });

  it("4.4: a system message in the wrong shape hides the identity from the model", () => {
    const code = mutate(
      hint("chapitre-4", 4),
      '"Tu es " + NOM_AGENT + ", copilote personnel. Faits connus : " + faits',
      '"Agent " + NOM_AGENT'
    );
    expect(check("chapitre-4", 4, code).ok).toBe(false);
  });
});
