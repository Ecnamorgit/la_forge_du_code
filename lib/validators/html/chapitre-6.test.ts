import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-6";

/**
 * HTML chapitre 6 — sémantique et accessibilité.
 */

describe("HTML chapitre 6 — etape 1 (plan de page)", () => {
  const valider = validators[0];

  it("accepte header, main et footer", () => {
    const code = "<header>H</header><main>M</main><footer>F</footer>";
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une page sans main", () => {
    expect(valider("<header>H</header><footer>F</footer>").ok).toBe(false);
  });

  it("refuse des div a la place des reperes semantiques", () => {
    // Échec ciblé : c'est la sémantique qu'enseigne l'étape, pas la mise en page.
    const code = '<div class="header">H</div><div class="main">M</div><div class="footer">F</div>';
    expect(valider(code).ok).toBe(false);
  });
});

describe("HTML chapitre 6 — etape 2 (navigation dans l'en-tete)", () => {
  const valider = validators[1];

  it("accepte une nav de trois liens placee dans le header", () => {
    const code = `<header><nav>
      <a href="/">Accueil</a><a href="/missions">Missions</a><a href="/contact">Contact</a>
    </nav></header><main>M</main>`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse une nav placee hors du header", () => {
    // Échec ciblé : l'emplacement fait partie de l'exigence.
    const code = `<header>H</header><nav>
      <a href="/">Accueil</a><a href="/missions">Missions</a><a href="/contact">Contact</a>
    </nav>`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une nav de deux liens seulement", () => {
    const code = `<header><nav>
      <a href="/">Accueil</a><a href="/missions">Missions</a>
    </nav></header>`;
    expect(valider(code).ok).toBe(false);
  });
});

describe("HTML chapitre 6 — etape 3 (article et section)", () => {
  const valider = validators[2];

  it("accepte une section imbriquee dans un article, lui-meme dans main", () => {
    const code = "<main><article><section>Contenu</section></article></main>";
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un article sans section interne", () => {
    expect(valider("<main><article>Contenu</article></main>").ok).toBe(false);
  });

  it("refuse un article place hors de main", () => {
    // Échec ciblé : l'imbrication est précisément ce qui est enseigné.
    const code = "<article><section>Contenu</section></article><main>M</main>";
    expect(valider(code).ok).toBe(false);
  });
});

describe("HTML chapitre 6 — etape 4 (accessibilite)", () => {
  const valider = validators[3];

  it("accepte une image decrite et un lien courant marque", () => {
    const code = `<img src="/logo.png" alt="Logo de la station">
      <nav><a href="/" aria-current="page">Accueil</a></nav>`;
    expect(valider(code).ok).toBe(true);
  });

  it("refuse un alt vide", () => {
    const code = `<img src="/logo.png" alt="">
      <nav><a href="/" aria-current="page">Accueil</a></nav>`;
    expect(valider(code).ok).toBe(false);
  });

  it("refuse une page sans aria-current", () => {
    // Échec ciblé : rien n'indique à un lecteur d'écran où l'on se trouve.
    const code = `<img src="/logo.png" alt="Logo de la station">
      <nav><a href="/">Accueil</a></nav>`;
    expect(valider(code).ok).toBe(false);
  });
});
