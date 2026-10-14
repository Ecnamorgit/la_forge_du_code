import { describe, it, expect } from "vitest";
import { renderLessonMarkdown, extractDocTokenIds, escapeHtml } from "./markdown";

describe("renderLessonMarkdown — backward compatibility", () => {
  it("renders a ### heading as h4", () => {
    expect(renderLessonMarkdown("### Titre")).toContain("<h4");
  });

  it("renders **bold** and `code`", () => {
    const out = renderLessonMarkdown("**fort** et `x`");
    expect(out).toContain("<strong");
    expect(out).toContain("<code");
  });

  it("escapes raw HTML", () => {
    expect(renderLessonMarkdown("<script>")).toContain("&lt;script&gt;");
  });
});

describe("renderLessonMarkdown — token doc", () => {
  it("turns [[doc:ID|text]] into a clickable chip", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype|le doctype]]");
    expect(out).toContain('data-doc-id="html/doctype"');
    expect(out).toContain("le doctype");
    expect(out).not.toContain("[[doc:");
  });

  it("uses the resolved (escaped) term when the text is omitted", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype]]", {
      resolveDocTerm: (id) =>
        id === "html/doctype" ? "<!DOCTYPE html>" : undefined,
    });
    expect(out).toContain("&lt;!DOCTYPE html&gt;");
    expect(out).toContain('data-doc-id="html/doctype"');
  });

  it("falls back to the id when there is no resolver and no text", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype]]");
    expect(out).toContain("html/doctype");
  });

  it("escapes the chip id (defense in depth) and preserves the label", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype|a & b]]");
    expect(out).toContain('data-doc-id="html/doctype"');
    expect(out).toContain("a &amp; b");
  });
});

describe("extractDocTokenIds", () => {
  it("lists the referenced ids", () => {
    const ids = extractDocTokenIds(
      "a [[doc:html/doctype]] b [[doc:html/head|tête]]"
    );
    expect(ids).toEqual(["html/doctype", "html/head"]);
  });

  it("returns [] when there is no token", () => {
    expect(extractDocTokenIds("rien ici")).toEqual([]);
  });
});

describe("escapeHtml", () => {
  it("escapes & < >", () => {
    expect(escapeHtml("<a & b>")).toBe("&lt;a &amp; b&gt;");
  });
});
