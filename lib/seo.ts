/**
 * Search engine metadata that is not covered by Next's `metadata` export:
 * structured data (JSON-LD) and the images listed in the sitemap.
 */

export const SITE_NAME = "La Forge du Code";

export const SITE_DESCRIPTION =
  "Apprends à coder dans un univers spatial où chaque chapitre est une mission. HTML, CSS, JavaScript, React et 10 autres cursus.";

/** Crest large enough for search engines (Google wants at least 112 px). */
export const LOGO_IMAGE = { path: "/brand/fleet-crest-352.png", width: 352, height: 352 };

/** Images shown on the landing page, listed in the sitemap. */
export const HOME_IMAGES: readonly string[] = [
  "/brand/fleet-crest.png",
  "/feature-courses-v2.png",
  "/feature-badges-v2.png",
  "/feature-editor-v2.png",
];

/** Base URL of the site, as used by `metadataBase`, the sitemap and robots.txt. */
export function siteUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

/**
 * WebSite + EducationalOrganization graph for the landing page. The logo and
 * the share image give search results something to show next to the name.
 */
export function buildHomeJsonLd(base: string) {
  const url = (path: string) => new URL(path, base).toString();
  const organizationId = url("/#organization");
  const website = {
    "@type": "WebSite",
    "@id": url("/#website"),
    url: url("/"),
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "fr-FR",
    publisher: { "@id": organizationId },
  };
  const organization = {
    "@type": "EducationalOrganization",
    "@id": organizationId,
    name: SITE_NAME,
    url: url("/"),
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: url(LOGO_IMAGE.path),
      width: LOGO_IMAGE.width,
      height: LOGO_IMAGE.height,
      caption: "Blason de la flotte Coalition Nebula, logo de La Forge du Code",
    },
    image: url("/opengraph-image"),
  };
  return { "@context": "https://schema.org", "@graph": [website, organization] as const };
}

/**
 * JSON for an inline `<script type="application/ld+json">`. `<` is escaped so
 * no value can close the script element.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
