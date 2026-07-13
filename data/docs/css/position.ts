import type { DocEntry } from "../types";

export const cssPosition: DocEntry = {
  id: "css/position",
  domain: "css",
  term: "position",
  title: "Positionnement",
  summary:
    "La propriété position (static, relative, absolute, fixed, sticky) contrôle comment un élément se place et se décale.",
  body: `
### Les valeurs
- **static** : par défaut, dans le flux.
- **relative** : reste dans le flux mais peut se décaler (top/left...).
- **absolute** : sort du flux, se place par rapport à l'ancêtre positionné.
- **fixed** : par rapport à la fenêtre (reste à l'écran).
- **sticky** : hybride, colle au bord au scroll.

### Décaler
Avec relative/absolute/fixed, on utilise **top / right / bottom / left**.
`,
  syntax: ".badge {\n  position: relative;\n  top: 10px;\n  left: 20px;\n}",
  examples: [
    { code: ".barre { position: sticky; top: 0; }", caption: "Barre qui colle en haut au défilement." },
  ],
  pitfalls: [
    "absolute se positionne par rapport au plus proche ancêtre non-static (souvent oublié).",
    "relative + top déplace visuellement sans libérer la place d'origine.",
  ],
  related: ["css/box-model", "css/flexbox"],
  official: { label: "MDN — position", url: "https://developer.mozilla.org/fr/docs/Web/CSS/position" },
};
