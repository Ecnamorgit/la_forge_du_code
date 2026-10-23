/**
 * Checks what a search engine reads on the live site: robots.txt, the
 * sitemap, and the tags of every page the sitemap lists.
 *
 * Pure functions over already-fetched responses, so they can be tested without
 * the network. `scripts/audit-seo.ts` does the fetching and runs them every
 * week (`.github/workflows/seo-audit.yml`).
 *
 * Messages are in French: they end up in a GitHub issue read by the team.
 */
import { isSiteOrigin } from "./seo";

export type Severity = "error" | "warning";

export interface Finding {
  /** `error`: keeps Google from crawling or indexing. `warning`: hurts how the page shows up. */
  severity: Severity;
  url: string;
  message: string;
}

/** A response as the script received it, redirects not followed. */
export interface FetchedPage {
  url: string;
  /** 0 when the request failed (timeout, DNS, TLS). */
  status: number;
  location: string | null;
  xRobotsTag: string | null;
  html: string;
}

export interface PageHead {
  title: string | null;
  description: string | null;
  canonical: string | null;
  /** `robots` and `googlebot` meta tags, joined. */
  robots: string | null;
  lang: string | null;
  h1: string[];
}

/** Google cuts titles around 60 characters and descriptions around 155. */
const TITLE_MIN = 15;
const TITLE_MAX = 65;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 160;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isNaN(n) ? entity : String.fromCodePoint(n);
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  });
}

/** Attributes of an opening tag, names lowercased, values decoded. */
function readAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([^\s=/<>"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

function textOf(fragment: string): string {
  return decodeEntities(fragment.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function readPageHead(html: string): PageHead {
  // Inline SVG icons carry their own <title>: only the document head counts.
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd === -1 ? html.replace(/<svg[\s\S]*?<\/svg>/gi, "") : html.slice(0, headEnd);

  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  let description: string | null = null;
  const robots: string[] = [];
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const { name, content } = readAttributes(tag);
    if (name?.toLowerCase() === "description") description = nonEmpty(content);
    if (name && ["robots", "googlebot"].includes(name.toLowerCase()) && content) robots.push(content);
  }

  let canonical: string | null = null;
  for (const [tag] of head.matchAll(/<link\b[^>]*>/gi)) {
    const { rel, href } = readAttributes(tag);
    if (rel?.toLowerCase().split(/\s+/).includes("canonical")) canonical = nonEmpty(href);
  }

  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0];

  return {
    title: nonEmpty(titleMatch ? textOf(titleMatch[1]) : null),
    description,
    canonical,
    robots: robots.length ? robots.join(", ") : null,
    lang: nonEmpty(htmlTag ? readAttributes(htmlTag).lang : null),
    h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => textOf(m[1])).filter(Boolean),
  };
}

/** Page URLs of a sitemap. `<image:loc>` entries are images, not pages. */
export function readSitemapUrls(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => decodeEntities(m[1]));
}

interface RobotsRule {
  allow: boolean;
  path: string;
}

/** Rules that apply to Googlebot: its own group if there is one, else `*`. */
function googlebotRules(text: string): RobotsRule[] {
  const groups: { agents: string[]; rules: RobotsRule[] }[] = [];
  let current: { agents: string[]; rules: RobotsRule[] } | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    const match = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!match) continue;
    const field = match[1].toLowerCase();
    const value = match[2].trim();

    if (field === "user-agent") {
      // Consecutive user-agent lines share one group of rules.
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if ((field === "allow" || field === "disallow") && current && value) {
      current.rules.push({ allow: field === "allow", path: value });
    }
  }

  const own = groups.filter((g) => g.agents.includes("googlebot"));
  const chosen = own.length ? own : groups.filter((g) => g.agents.includes("*"));
  return chosen.flatMap((g) => g.rules);
}

function robotsPattern(path: string): RegExp {
  const anchored = path.endsWith("$");
  const body = (anchored ? path.slice(0, -1) : path)
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

/**
 * Would Googlebot crawl this path? The longest matching rule wins, and `Allow`
 * wins a tie: that is how the trial chapters stay open under `Disallow: /learn`.
 */
export function isAllowedByRobots(robotsText: string, path: string): boolean {
  let best: RobotsRule | null = null;
  for (const rule of googlebotRules(robotsText)) {
    if (!robotsPattern(rule.path).test(path)) continue;
    if (
      !best ||
      rule.path.length > best.path.length ||
      (rule.path.length === best.path.length && rule.allow)
    ) {
      best = rule;
    }
  }
  return best ? best.allow : true;
}

export function auditRobots(base: string, status: number, text: string): Finding[] {
  const url = new URL("/robots.txt", base).toString();
  if (status !== 200) {
    return [{ severity: "error", url, message: `robots.txt répond ${status || "rien (injoignable)"}.` }];
  }

  const findings: Finding[] = [];
  if (!isAllowedByRobots(text, "/")) {
    findings.push({ severity: "error", url, message: "robots.txt interdit à Google d'explorer la page d'accueil." });
  }

  const sitemaps = [...text.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)].map((m) => m[1]);
  if (sitemaps.length === 0) {
    findings.push({ severity: "warning", url, message: "robots.txt ne déclare aucun sitemap." });
  }
  for (const sitemap of sitemaps) {
    if (!isSiteOrigin(sitemap, base)) {
      findings.push({
        severity: "error",
        url,
        message: `robots.txt déclare un sitemap sur un autre site : ${sitemap} (APP_URL mal réglée ?).`,
      });
    }
  }
  return findings;
}

export function auditSitemap(base: string, status: number, urls: string[]): Finding[] {
  const url = new URL("/sitemap.xml", base).toString();
  if (status !== 200) {
    return [{ severity: "error", url, message: `Le sitemap répond ${status || "rien (injoignable)"}.` }];
  }
  if (urls.length === 0) {
    return [{ severity: "error", url, message: "Le sitemap ne liste aucune page." }];
  }
  return urls
    .filter((pageUrl) => !isSiteOrigin(pageUrl, base))
    .map((pageUrl) => ({
      severity: "error" as const,
      url,
      message: `Le sitemap liste une adresse d'un autre site : ${pageUrl}.`,
    }));
}

/** Same page for a search engine: no fragment, no trailing slash. */
function samePage(a: string, b: string): boolean {
  const normalize = (raw: string) => {
    const u = new URL(raw);
    const path = u.pathname.length > 1 ? u.pathname.replace(/\/+$/, "") : u.pathname;
    return `${u.protocol}//${u.host}${path}${u.search}`;
  };
  return normalize(a) === normalize(b);
}

function hasNoindex(value: string | null): boolean {
  return value !== null && /\b(noindex|none)\b/i.test(value);
}

/** Checks one page of the sitemap. */
export function auditPage(page: FetchedPage): Finding[] {
  const { url } = page;
  if (page.status === 0) {
    return [{ severity: "error", url, message: "Page injoignable (délai dépassé ou erreur réseau)." }];
  }
  if (page.status !== 200) {
    const redirect = page.location
      ? ` et redirige vers ${new URL(page.location, url)} : le sitemap doit donner l'adresse finale`
      : "";
    return [{ severity: "error", url, message: `La page répond ${page.status}${redirect}.` }];
  }

  const findings: Finding[] = [];
  const error = (message: string) => findings.push({ severity: "error", url, message });
  const warning = (message: string) => findings.push({ severity: "warning", url, message });

  if (hasNoindex(page.xRobotsTag)) {
    error(`En-tête « X-Robots-Tag: ${page.xRobotsTag} » : Google n'indexera pas la page.`);
  }

  const head = readPageHead(page.html);
  if (hasNoindex(head.robots)) {
    error(`Balise meta robots « ${head.robots} » : Google n'indexera pas la page.`);
  }

  if (!head.title) {
    error("Pas de balise <title>.");
  } else if (head.title.length > TITLE_MAX) {
    warning(`Titre de ${head.title.length} caractères, Google le coupera (max ${TITLE_MAX}) : « ${head.title} ».`);
  } else if (head.title.length < TITLE_MIN) {
    warning(`Titre très court (${head.title.length} caractères) : « ${head.title} ».`);
  }

  if (!head.description) {
    warning("Pas de meta description : Google choisira lui-même un extrait de la page.");
  } else if (head.description.length < DESCRIPTION_MIN || head.description.length > DESCRIPTION_MAX) {
    warning(
      `Meta description de ${head.description.length} caractères (visé : ${DESCRIPTION_MIN} à ${DESCRIPTION_MAX}).`,
    );
  }

  if (!head.canonical) {
    warning("Pas d'URL canonique.");
  } else {
    const canonical = new URL(head.canonical, url).toString();
    if (!samePage(canonical, url)) {
      error(`L'URL canonique désigne une autre page (${canonical}) : Google indexera celle-là à la place.`);
    }
  }

  if (head.h1.length === 0) warning("Pas de titre <h1>.");
  if (!head.lang) warning("Pas d'attribut lang sur <html>.");

  return findings;
}

/** Two pages with the same title or description compete with each other. */
export function auditDuplicates(pages: { url: string; head: PageHead }[]): Finding[] {
  const findings: Finding[] = [];
  for (const [field, label] of [
    ["title", "titre"],
    ["description", "description"],
  ] as const) {
    const byValue = new Map<string, string[]>();
    for (const { url, head } of pages) {
      const value = head[field];
      if (value) byValue.set(value, [...(byValue.get(value) ?? []), url]);
    }
    for (const [value, urls] of byValue) {
      if (urls.length < 2) continue;
      findings.push({
        severity: "warning",
        url: urls[0],
        message: `Même ${label} sur ${urls.length} pages (${urls.join(", ")}) : « ${value} ».`,
      });
    }
  }
  return findings;
}

/**
 * Another address serving the same deployment (`.vercel.app`, sandbox
 * subdomain) must redirect to the site or ask not to be indexed, or Google
 * sees duplicates of every page.
 */
export function auditOtherHost(page: FetchedPage): Finding[] {
  if (page.status !== 200) return [];
  if (hasNoindex(page.xRobotsTag) || hasNoindex(readPageHead(page.html).robots)) return [];
  return [
    {
      severity: "error",
      url: page.url,
      message: "Copie du site indexable sur une autre adresse : il faut un noindex ou une redirection.",
    },
  ];
}

/** French agreement: 0 and 1 take the singular. */
function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n <= 1 ? singular : pluralForm}`;
}

/** Markdown report, posted as is in the workflow summary and the GitHub issue. */
export function renderReport(input: {
  base: string;
  date: string;
  pagesChecked: number;
  findings: Finding[];
}): string {
  const errorsFound = input.findings.filter((f) => f.severity === "error");
  const warningsFound = input.findings.filter((f) => f.severity === "warning");
  const list = (findings: Finding[]) => findings.map((f) => `- ${f.url} : ${f.message}`).join("\n");

  const lines = [
    `## Audit SEO de ${input.base}`,
    "",
    [
      input.date,
      `${plural(input.pagesChecked, "page", "pages")} du sitemap vérifiées`,
      plural(errorsFound.length, "problème bloquant", "problèmes bloquants"),
      plural(warningsFound.length, "avertissement", "avertissements"),
    ].join(" · "),
    "",
  ];

  if (input.findings.length === 0) {
    lines.push("Aucun problème détecté : Google peut explorer et indexer toutes les pages du sitemap.", "");
  }
  if (errorsFound.length) {
    lines.push(
      "### Problèmes bloquants",
      "",
      "Ils empêchent Google d'explorer ou d'indexer le site.",
      "",
      list(errorsFound),
      "",
    );
  }
  if (warningsFound.length) {
    lines.push(
      "### Avertissements",
      "",
      "Le site reste indexable ; ces points nuisent à la façon dont il apparaît dans les résultats.",
      "",
      list(warningsFound),
      "",
    );
  }

  lines.push(
    "---",
    "Cet audit vérifie ce que Google peut lire. Il ne dit pas si les pages sont déjà indexées : " +
      "Google Search Console › Indexation › Pages.",
  );
  return lines.join("\n");
}
