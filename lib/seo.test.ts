import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";

import { buildChapterTitle, buildHomeJsonLd, HOME_IMAGES, isSiteOrigin, LOGO_IMAGE, serializeJsonLd } from "./seo";

const PUBLIC_DIR = path.join(__dirname, "..", "public");

describe("buildHomeJsonLd", () => {
  const data = buildHomeJsonLd("https://laforgeducode.fr");
  const [website, organization] = data["@graph"];

  it("describes the website and its publisher", () => {
    expect(website["@type"]).toBe("WebSite");
    expect(website.url).toBe("https://laforgeducode.fr/");
    expect(website.publisher["@id"]).toBe(organization["@id"]);
  });

  it("gives the organization an absolute logo URL and an image", () => {
    expect(organization.logo.url).toBe("https://laforgeducode.fr/brand/fleet-crest-352.png");
    expect(organization.image).toBe("https://laforgeducode.fr/opengraph-image");
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so a value cannot close the script element", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("image files", () => {
  it("ships every image the metadata points to", () => {
    for (const src of [...HOME_IMAGES, LOGO_IMAGE.path]) {
      expect(fs.existsSync(path.join(PUBLIC_DIR, src)), src).toBe(true);
    }
  });
});

describe("sitemap images", () => {
  it("lists the landing page images with absolute URLs", () => {
    const home = sitemap().find((entry) => new URL(entry.url).pathname === "/");
    expect(home?.images).toHaveLength(HOME_IMAGES.length);
    for (const image of home?.images ?? []) expect(image).toMatch(/^https?:\/\//);
  });

  it("does not attach images to the other pages", () => {
    const others = sitemap().filter((entry) => new URL(entry.url).pathname !== "/");
    expect(others.every((entry) => entry.images === undefined)).toBe(true);
  });
});

describe("isSiteOrigin", () => {
  const APP_URL = "https://www.laforgeducode.fr";

  it("accepts the site's host, with or without www", () => {
    expect(isSiteOrigin("https://www.laforgeducode.fr", APP_URL)).toBe(true);
    expect(isSiteOrigin("https://laforgeducode.fr", APP_URL)).toBe(true);
  });

  it("rejects the sandbox subdomain and the .vercel.app address", () => {
    expect(isSiteOrigin("https://bac-a-sable.laforgeducode.fr", APP_URL)).toBe(false);
    expect(isSiteOrigin("https://la-forge-du-code.vercel.app", APP_URL)).toBe(false);
  });

  it("does not tell local hosts apart without APP_URL", () => {
    expect(isSiteOrigin("http://127.0.0.1:3000", undefined)).toBe(true);
  });

  it("keeps the page indexable when the origin cannot be read", () => {
    expect(isSiteOrigin("", APP_URL)).toBe(true);
  });
});

describe("buildChapterTitle", () => {
  it("turns the shouted chapter title into a readable one on a single line", () => {
    expect(buildChapterTitle("ÉTABLISSEMENT\nDE LA BASE LUNAIRE")).toBe(
      "Établissement de la base lunaire — La Forge du Code",
    );
  });

  it("stays under 65 characters for every HTML chapter", async () => {
    const { getChapterData } = await import("@/lib/courses-registry");
    for (const slug of ["chapitre-1", "chapitre-2", "chapitre-3"]) {
      const data = await getChapterData("html", slug);
      expect(buildChapterTitle(data!.title).length).toBeLessThanOrEqual(65);
    }
  });
});
