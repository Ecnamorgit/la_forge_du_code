import { describe, it, expect } from "vitest";
import { renderLessonMarkdown, extractDocTokenIds, escapeHtml } from "./markdown";

describe("renderLessonMarkdown — rétro-compat", () => {
  it("rend un titre ### en h4", () => {
    expect(renderLessonMarkdown("### Titre")).toContain("<h4");
  });

  it("rend **gras** et `code`", () => {
    const out = renderLessonMarkdown("**fort** et `x`");
    expect(out).toContain("<strong");
    expect(out).toContain("<code");
  });

  it("échappe le HTML brut", () => {
    expect(renderLessonMarkdown("<script>")).toContain("&lt;script&gt;");
  });
});

describe("renderLessonMarkdown — token doc", () => {
  it("transforme [[doc:ID|texte]] en chip cliquable", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype|le doctype]]");
    expect(out).toContain('data-doc-id="html/doctype"');
    expect(out).toContain("le doctype");
    expect(out).not.toContain("[[doc:");
  });

  it("utilise le terme résolu (échappé) quand le texte est omis", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype]]", {
      resolveDocTerm: (id) =>
        id === "html/doctype" ? "<!DOCTYPE html>" : undefined,
    });
    expect(out).toContain("&lt;!DOCTYPE html&gt;");
    expect(out).toContain('data-doc-id="html/doctype"');
  });

  it("retombe sur l'id quand aucun resolver ni texte", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype]]");
    expect(out).toContain("html/doctype");
  });
});

describe("extractDocTokenIds", () => {
  it("liste les ids référencés", () => {
    const ids = extractDocTokenIds(
      "a [[doc:html/doctype]] b [[doc:html/head|tête]]"
    );
    expect(ids).toEqual(["html/doctype", "html/head"]);
  });

  it("retourne [] sans token", () => {
    expect(extractDocTokenIds("rien ici")).toEqual([]);
  });
});

describe("escapeHtml", () => {
  it("échappe & < >", () => {
    expect(escapeHtml("<a & b>")).toBe("&lt;a &amp; b&gt;");
  });
});
