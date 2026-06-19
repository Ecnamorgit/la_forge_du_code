import type { DocEntry } from "../types";

export const video: DocEntry = {
  id: "html/video",
  domain: "html",
  term: "<video>",
  title: "La balise <video>",
  summary:
    "Lit une vidéo nativement, sans plugin. L'attribut controls affiche les boutons de lecture.",
  body: `
### À quoi ça sert
**<video>** intègre une vidéo. Le navigateur fournit le lecteur si tu ajoutes **controls**.

### Attributs clés
- **controls** : affiche play/pause/volume.
- **width / height** : taille d'affichage.
- **autoplay** : démarre seul (souvent bloqué sans **muted**).
- **loop** : reboucle. **poster** : image avant lecture.
`,
  syntax: '<video src="film.mp4" controls width="480"></video>',
  examples: [
    {
      code: '<video controls>\n  <source src="film.webm" type="video/webm">\n  <source src="film.mp4" type="video/mp4">\n</video>',
      caption: "Multi-format : le navigateur prend la première source lisible.",
    },
  ],
  pitfalls: [
    "Sans controls, la vidéo est muette et non interactive.",
    "autoplay sans muted est bloqué par la plupart des navigateurs.",
  ],
  related: ["html/audio", "html/picture"],
  official: {
    label: "MDN — <video>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/video",
  },
};
