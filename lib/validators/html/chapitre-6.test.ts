import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-6";

/**
 * HTML chapter 6 — semantics and accessibility.
 */

describe("HTML chapter 6 — step 1 (page outline)", () => {
  const validate = validators[0];

  it("accepts header, main and footer", () => {
    const code = "<header>H</header><main>M</main><footer>F</footer>";
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a page without main", () => {
    expect(validate("<header>H</header><footer>F</footer>").ok).toBe(false);
  });

  it("rejects divs instead of semantic landmarks", () => {
    // Targeted failure: the step teaches semantics, not layout.
    const code = '<div class="header">H</div><div class="main">M</div><div class="footer">F</div>';
    expect(validate(code).ok).toBe(false);
  });
});

describe("HTML chapter 6 — step 2 (navigation in the header)", () => {
  const validate = validators[1];

  it("accepts a three-link nav placed in the header", () => {
    const code = `<header><nav>
      <a href="/">Accueil</a><a href="/missions">Missions</a><a href="/contact">Contact</a>
    </nav></header><main>M</main>`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects a nav placed outside the header", () => {
    // Targeted failure: the placement is part of the requirement.
    const code = `<header>H</header><nav>
      <a href="/">Accueil</a><a href="/missions">Missions</a><a href="/contact">Contact</a>
    </nav>`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a nav with only two links", () => {
    const code = `<header><nav>
      <a href="/">Accueil</a><a href="/missions">Missions</a>
    </nav></header>`;
    expect(validate(code).ok).toBe(false);
  });
});

describe("HTML chapter 6 — step 3 (article and section)", () => {
  const validate = validators[2];

  it("accepts a section nested in an article, itself inside main", () => {
    const code = "<main><article><section>Contenu</section></article></main>";
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an article without an inner section", () => {
    expect(validate("<main><article>Contenu</article></main>").ok).toBe(false);
  });

  it("rejects an article placed outside main", () => {
    // Targeted failure: the nesting is precisely what is being taught.
    const code = "<article><section>Contenu</section></article><main>M</main>";
    expect(validate(code).ok).toBe(false);
  });
});

describe("HTML chapter 6 — step 4 (accessibility)", () => {
  const validate = validators[3];

  it("accepts a described image and a marked current link", () => {
    const code = `<img src="/logo.png" alt="Logo de la station">
      <nav><a href="/" aria-current="page">Accueil</a></nav>`;
    expect(validate(code).ok).toBe(true);
  });

  it("rejects an empty alt", () => {
    const code = `<img src="/logo.png" alt="">
      <nav><a href="/" aria-current="page">Accueil</a></nav>`;
    expect(validate(code).ok).toBe(false);
  });

  it("rejects a page without aria-current", () => {
    // Targeted failure: nothing tells a screen reader where the user is.
    const code = `<img src="/logo.png" alt="Logo de la station">
      <nav><a href="/">Accueil</a></nav>`;
    expect(validate(code).ok).toBe(false);
  });
});
