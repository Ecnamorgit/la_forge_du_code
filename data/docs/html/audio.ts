import type { DocEntry } from "../types";

export const audio: DocEntry = {
  id: "html/audio",
  domain: "html",
  term: "<audio>",
  title: "La balise <audio>",
  summary:
    "Lit un son nativement. Mêmes attributs que <video>, mais sans dimensions visuelles.",
  body: `
### À quoi ça sert
**<audio>** joue un fichier sonore (transmission radio, alerte). Comme \`<video>\`, ajoute **controls** pour afficher la barre play/pause/volume.

### Formats conseillés
**MP3** ou **AAC** pour la compatibilité, **OGG/Opus** pour la qualité. Plusieurs \`<source>\` pour couvrir les deux.
`,
  syntax: '<audio src="alerte.mp3" controls></audio>',
  examples: [
    {
      code: '<audio controls>\n  <source src="alerte.ogg" type="audio/ogg">\n  <source src="alerte.mp3" type="audio/mpeg">\n</audio>',
      caption: "Audio multi-format avec contrôles.",
    },
  ],
  pitfalls: [
    "Un <audio> sans controls est invisible et inutilisable.",
    "autoplay sans muted (ou sans interaction) est bloqué.",
  ],
  related: ["html/video"],
  official: {
    label: "MDN — <audio>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/audio",
  },
};
