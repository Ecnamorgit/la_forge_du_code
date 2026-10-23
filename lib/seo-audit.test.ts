import { describe, expect, it } from "vitest";

import {
  auditDuplicates,
  auditOtherHost,
  auditPage,
  auditRobots,
  auditSitemap,
  type FetchedPage,
  type Finding,
  isAllowedByRobots,
  readPageHead,
  readSitemapUrls,
  renderReport,
} from "./seo-audit";

const BASE = "https://www.laforgeducode.fr";

/** A page that passes every check; tests break one thing at a time. */
function goodHtml(overrides: Partial<Record<"title" | "description" | "canonical" | "robots" | "h1" | "lang", string>> = {}) {
  const o = {
    title: "La Forge du Code — Apprendre à coder en HTML",
    description:
      "Apprends à coder dans un univers spatial où chaque chapitre est une mission. HTML, CSS, JavaScript, React.",
    canonical: `${BASE}/codex`,
    robots: "",
    h1: "Codex",
    lang: "fr",
    ...overrides,
  };
  return `<!DOCTYPE html><html lang="${o.lang}"><head>
<meta charSet="utf-8"/>
<title>${o.title}</title>
<meta name="description" content="${o.description}"/>
${o.canonical ? `<link rel="canonical" href="${o.canonical}"/>` : ""}
${o.robots ? `<meta name="robots" content="${o.robots}"/>` : ""}
</head><body><h1 class="x">${o.h1}</h1></body></html>`;
}

function page(overrides: Partial<FetchedPage> = {}): FetchedPage {
  return {
    url: `${BASE}/codex`,
    status: 200,
    location: null,
    xRobotsTag: null,
    html: goodHtml(),
    ...overrides,
  };
}

const errors = (findings: Finding[]) => findings.filter((f) => f.severity === "error");
const warnings = (findings: Finding[]) => findings.filter((f) => f.severity === "warning");

describe("readPageHead", () => {
  it("reads the tags search engines use, decoding HTML entities", () => {
    const head = readPageHead(goodHtml({ description: "L&#x27;univers &amp; la flotte" }));
    expect(head.title).toBe("La Forge du Code — Apprendre à coder en HTML");
    expect(head.description).toBe("L'univers & la flotte");
    expect(head.canonical).toBe(`${BASE}/codex`);
    expect(head.lang).toBe("fr");
    expect(head.h1).toEqual(["Codex"]);
  });

  it("reads the text of a heading split across nested elements", () => {
    const head = readPageHead(goodHtml({ h1: "&gt; <span>AMORÇAGE</span> SYSTÈME<span>_</span>" }));
    expect(head.h1).toEqual(["> AMORÇAGE SYSTÈME_"]);
  });

  it("accepts attributes in any order", () => {
    const html = `<html><head><meta content="Une description" name="description"><link href="/a" rel="canonical"></head></html>`;
    const head = readPageHead(html);
    expect(head.description).toBe("Une description");
    expect(head.canonical).toBe("/a");
  });

  it("ignores <title> elements of inline SVG icons", () => {
    const html = `<html><head></head><body><svg><title>Icône</title></svg></body></html>`;
    expect(readPageHead(html).title).toBeNull();
  });
});

describe("readSitemapUrls", () => {
  it("lists the page URLs, not the image URLs", () => {
    const xml = `<urlset><url><loc>${BASE}/</loc><image:image><image:loc>${BASE}/logo.png</image:loc></image:image></url>
<url><loc>${BASE}/codex</loc></url></urlset>`;
    expect(readSitemapUrls(xml)).toEqual([`${BASE}/`, `${BASE}/codex`]);
  });
});

describe("isAllowedByRobots", () => {
  const robots = `User-Agent: *
Allow: /
Allow: /learn/html/chapitre-1
Disallow: /learn
Disallow: /api

Sitemap: ${BASE}/sitemap.xml`;

  it("lets the longest matching rule win, as Google does", () => {
    expect(isAllowedByRobots(robots, "/learn/html/chapitre-1")).toBe(true);
    expect(isAllowedByRobots(robots, "/learn/css/chapitre-1")).toBe(false);
    expect(isAllowedByRobots(robots, "/codex")).toBe(true);
  });

  it("allows everything when no group applies", () => {
    expect(isAllowedByRobots("User-agent: SomeBot\nDisallow: /", "/codex")).toBe(true);
  });

  it("supports * and $ in paths", () => {
    const text = "User-agent: *\nDisallow: /*.json$";
    expect(isAllowedByRobots(text, "/data.json")).toBe(false);
    expect(isAllowedByRobots(text, "/data.json?x=1")).toBe(true);
  });
});

describe("auditRobots", () => {
  it("passes a robots.txt that declares the site's sitemap", () => {
    expect(auditRobots(BASE, 200, `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml`)).toEqual([]);
  });

  it("flags a robots.txt that closes the whole site", () => {
    const findings = auditRobots(BASE, 200, `User-agent: *\nDisallow: /\nSitemap: ${BASE}/sitemap.xml`);
    expect(errors(findings)).toHaveLength(1);
  });

  it("flags a sitemap declared on another host", () => {
    const findings = auditRobots(BASE, 200, "User-agent: *\nAllow: /\nSitemap: http://localhost:3000/sitemap.xml");
    expect(errors(findings)[0].message).toMatch(/localhost/);
  });

  it("warns when no sitemap is declared, and errs when the file is missing", () => {
    expect(warnings(auditRobots(BASE, 200, "User-agent: *\nAllow: /"))).toHaveLength(1);
    expect(errors(auditRobots(BASE, 404, ""))).toHaveLength(1);
  });
});

describe("auditSitemap", () => {
  it("errs when the sitemap is missing or empty", () => {
    expect(errors(auditSitemap(BASE, 404, []))).toHaveLength(1);
    expect(errors(auditSitemap(BASE, 200, []))).toHaveLength(1);
  });

  it("errs on URLs of another host", () => {
    const findings = auditSitemap(BASE, 200, [`${BASE}/`, "https://la-forge-du-code-virid.vercel.app/codex"]);
    expect(errors(findings)).toHaveLength(1);
  });

  it("treats the bare domain and www as the same site", () => {
    expect(auditSitemap(BASE, 200, ["https://laforgeducode.fr/codex"])).toEqual([]);
  });
});

describe("auditPage", () => {
  it("passes a page that search engines can index", () => {
    expect(auditPage(page())).toEqual([]);
  });

  it("errs when the page does not answer 200, giving the redirect target", () => {
    const findings = auditPage(page({ status: 308, location: `${BASE}/login`, html: "" }));
    expect(errors(findings)).toHaveLength(1);
    expect(findings[0].message).toContain(`${BASE}/login`);
  });

  it("errs on noindex, from the header or the meta tag", () => {
    expect(errors(auditPage(page({ xRobotsTag: "noindex" })))).toHaveLength(1);
    expect(errors(auditPage(page({ html: goodHtml({ robots: "noindex, follow" }) })))).toHaveLength(1);
  });

  it("errs when the canonical URL points to another page", () => {
    const findings = auditPage(page({ html: goodHtml({ canonical: `${BASE}/` }) }));
    expect(errors(findings)).toHaveLength(1);
  });

  it("accepts a canonical URL that differs only by a trailing slash or is relative", () => {
    expect(auditPage(page({ url: `${BASE}/`, html: goodHtml({ canonical: BASE }) }))).toEqual([]);
    expect(auditPage(page({ html: goodHtml({ canonical: "/codex" }) }))).toEqual([]);
  });

  it("warns on a missing canonical, a missing heading or a missing lang", () => {
    expect(warnings(auditPage(page({ html: goodHtml({ canonical: "" }) })))).toHaveLength(1);
    expect(warnings(auditPage(page({ html: goodHtml({ h1: "" }) })))).toHaveLength(1);
    expect(warnings(auditPage(page({ html: goodHtml({ lang: "" }) })))).toHaveLength(1);
  });

  it("errs on a missing title and warns on titles Google would cut", () => {
    expect(errors(auditPage(page({ html: goodHtml({ title: "" }) })))).toHaveLength(1);
    expect(warnings(auditPage(page({ html: goodHtml({ title: "x".repeat(80) }) })))).toHaveLength(1);
  });

  it("warns on a missing, too short or too long description", () => {
    expect(warnings(auditPage(page({ html: goodHtml({ description: "" }) })))).toHaveLength(1);
    expect(warnings(auditPage(page({ html: goodHtml({ description: "Trop court" }) })))).toHaveLength(1);
    expect(warnings(auditPage(page({ html: goodHtml({ description: "x".repeat(200) }) })))).toHaveLength(1);
  });
});

describe("auditDuplicates", () => {
  it("warns when two pages share a title or a description", () => {
    const head = readPageHead(goodHtml());
    const findings = auditDuplicates([
      { url: `${BASE}/a`, head },
      { url: `${BASE}/b`, head },
    ]);
    expect(findings.map((f) => f.message).join("\n")).toMatch(/titre/);
    expect(findings.map((f) => f.message).join("\n")).toMatch(/description/);
  });
});

describe("auditOtherHost", () => {
  const url = "https://la-forge-du-code-virid.vercel.app/";

  it("passes a copy of the site that asks not to be indexed", () => {
    expect(auditOtherHost({ url, status: 200, location: null, xRobotsTag: "noindex", html: "" })).toEqual([]);
  });

  it("passes a copy that redirects to the site", () => {
    expect(auditOtherHost({ url, status: 308, location: `${BASE}/`, xRobotsTag: null, html: "" })).toEqual([]);
  });

  it("errs on an indexable copy", () => {
    expect(errors(auditOtherHost({ url, status: 200, location: null, xRobotsTag: null, html: goodHtml() }))).toHaveLength(1);
  });
});

describe("renderReport", () => {
  it("summarises the result and lists errors before warnings", () => {
    const report = renderReport({
      base: BASE,
      date: "2026-10-23",
      pagesChecked: 6,
      findings: [
        { severity: "warning", url: `${BASE}/codex`, message: "Avertissement A" },
        { severity: "error", url: `${BASE}/`, message: "Erreur B" },
      ],
    });
    expect(report).toContain("6 pages");
    expect(report).toContain("1 problème bloquant");
    expect(report.indexOf("Erreur B")).toBeLessThan(report.indexOf("Avertissement A"));
  });

  it("says so when nothing is wrong", () => {
    const report = renderReport({ base: BASE, date: "2026-10-23", pagesChecked: 6, findings: [] });
    expect(report).toContain("Aucun problème");
    expect(report).toContain("0 problème bloquant ·");
  });
});
