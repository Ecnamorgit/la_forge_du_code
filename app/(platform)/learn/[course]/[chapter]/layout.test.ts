import { describe, expect, it } from "vitest";

import { generateMetadata } from "./layout";

describe("chapter metadata", () => {
  it("points the canonical URL at the chapter path", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ course: "html", chapter: "chapitre-1" }),
    });
    expect(metadata.alternates?.canonical).toBe("/learn/html/chapitre-1");
  });

  it("declares no canonical URL for an unknown chapter", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ course: "html", chapter: "chapitre-999" }),
    });
    expect(metadata.alternates).toBeUndefined();
  });
});
