/**
 * SEO audit of the live site: what Google can read, page by page.
 *
 * Usage:
 *   npx tsx scripts/audit-seo.ts https://www.laforgeducode.fr \
 *     [--other-host https://la-forge-du-code-virid.vercel.app]... \
 *     [--report seo-report.md]
 *
 * Reads robots.txt, the sitemap it declares, then every page of the sitemap
 * (redirects not followed: Google wants the final address in the sitemap).
 * Each `--other-host` must redirect to the site or answer with a noindex.
 *
 * Prints the Markdown report and, with `--report`, writes it to that file.
 * Exit code 1 if a problem keeps Google from crawling or indexing, 0 otherwise
 * (warnings included). Run every week by `.github/workflows/seo-audit.yml`.
 */
import { writeFileSync } from "node:fs";

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
} from "@/lib/seo-audit";

const USER_AGENT = "LaForgeDuCode-AuditSEO/1.0 (+https://github.com/Ecnamorgit/la_forge_du_code)";
const TIMEOUT_MS = 20_000;

function parseArgs(argv: string[]) {
  const otherHosts: string[] = [];
  let base: string | null = null;
  let reportPath: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--other-host") otherHosts.push(argv[++i]);
    else if (argv[i] === "--report") reportPath = argv[++i];
    else base = argv[i];
  }
  if (!base) {
    console.error("Usage: npx tsx scripts/audit-seo.ts <url-du-site> [--other-host <url>]... [--report <fichier>]");
    process.exit(2);
  }
  return { base: base.replace(/\/+$/, ""), otherHosts, reportPath };
}

async function fetchPage(url: string): Promise<FetchedPage> {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return {
      url,
      status: response.status,
      location: response.headers.get("location"),
      xRobotsTag: response.headers.get("x-robots-tag"),
      html: await response.text(),
    };
  } catch {
    return { url, status: 0, location: null, xRobotsTag: null, html: "" };
  }
}

async function main() {
  const { base, otherHosts, reportPath } = parseArgs(process.argv.slice(2));
  const findings: Finding[] = [];

  const robots = await fetchPage(`${base}/robots.txt`);
  findings.push(...auditRobots(base, robots.status, robots.html));

  const declared = robots.html.match(/^\s*sitemap\s*:\s*(\S+)/im)?.[1];
  const sitemap = await fetchPage(declared ?? `${base}/sitemap.xml`);
  const urls = sitemap.status === 200 ? readSitemapUrls(sitemap.html) : [];
  findings.push(...auditSitemap(base, sitemap.status, urls));

  const heads = [];
  for (const url of urls) {
    const page = await fetchPage(url);
    findings.push(...auditPage(page));
    if (robots.status === 200 && !isAllowedByRobots(robots.html, new URL(url).pathname)) {
      findings.push({ severity: "error", url, message: "Listée au sitemap mais interdite par robots.txt." });
    }
    if (page.status === 200) heads.push({ url, head: readPageHead(page.html) });
  }
  findings.push(...auditDuplicates(heads));

  for (const host of otherHosts) {
    findings.push(...auditOtherHost(await fetchPage(`${host.replace(/\/+$/, "")}/`)));
  }

  const report = renderReport({
    base,
    date: new Date().toISOString().slice(0, 10),
    pagesChecked: urls.length,
    findings,
  });
  console.log(report);
  if (reportPath) writeFileSync(reportPath, `${report}\n`);

  process.exit(findings.some((f) => f.severity === "error") ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
