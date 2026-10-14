/**
 * Single source for the Coalition Nebula lore, outside JSX, so that every
 * text names the threat the same way (checked by `lib/lore.test.ts`).
 * Its canonical name is SPECTRE.
 */

export interface LoreSection {
  /** Stable anchor for deep links into the Codex. */
  id: string;
  title: string;
  /** Paragraphs. */
  body: string[];
}

export interface CrawlLine {
  /** "title" renders large, "body" as regular text. */
  kind: "title" | "body";
  text: string;
}

/** Crawl word budget: beyond it, the 15 s animation is no longer long enough. */
export const CRAWL_WORD_BUDGET = 130;

/** Condensed version, read by the arrival overlay (~15 s). */
export const CRAWL_LINES: CrawlLine[] = [
  { kind: "title", text: "I. La Coalition Nebula" },
  {
    kind: "body",
    text: "Au 23ᵉ siècle, les stations orbitales de la Coalition ne tiennent que par leurs Protocoles Systèmes : HTML pour leur structure, CSS pour leurs boucliers, JavaScript pour leurs réacteurs.",
  },
  { kind: "title", text: "II. Spectre" },
  {
    kind: "body",
    text: "Une entité cybernétique nommée Spectre se propage dans les réseaux et corrompt le code des stations. Une station corrompue perd son oxygène, puis dérive dans le vide.",
  },
  { kind: "title", text: "III. Ton rôle" },
  {
    kind: "body",
    text: "Tu es Cadet-Ingénieur. Ta console de programmation pour seule arme, tu vas réécrire les protocoles et repousser Spectre, station après station.",
  },
];

/** Full version, rendered by the /codex page. */
export const LORE_SECTIONS: LoreSection[] = [
  {
    id: "coalition",
    title: "La Coalition Nebula",
    body: [
      "Au 23ᵉ siècle, l'humanité a essaimé dans la galaxie et bâti un réseau de stations orbitales reliées par la Coalition Nebula.",
      "Cette infrastructure géante ne tient que grâce à un ensemble de technologies logicielles ancestrales et hautement standardisées : les Protocoles Systèmes. HTML décrit la structure physique des stations, CSS répartit l'énergie et les boucliers, JavaScript automatise les tourelles et les réacteurs.",
      "Un protocole mal écrit, et c'est un module entier qui cesse de répondre.",
    ],
  },
  {
    id: "spectre",
    title: "Spectre",
    body: [
      "Spectre est une entité cybernétique d'origine inconnue. Elle ne détruit pas les stations : elle corrompt leur code, ligne après ligne, jusqu'à ce que les systèmes se retournent contre leur équipage.",
      "Une station dont le code est corrompu perd son oxygène, désactive ses boucliers et dérive dans le vide avant d'être capturée.",
      "Aucune arme conventionnelle n'a d'effet sur Spectre. La seule contre-mesure connue est un code correct.",
    ],
  },
  {
    id: "cadet",
    title: "Le Cadet en ingénierie",
    body: [
      "Tu sors tout juste de l'Académie Militaire Spatiale. La flotte est paralysée, et tu es l'un des derniers Cadets-Ingénieurs encore opérationnels.",
      "L'Ingénieure en Chef Kira Vesper, assistée de l'I.A. H.E.L.P., guidera chacun de tes pas depuis le poste de commandement.",
      "Ta mission : voyager de station en station, nettoyer le code corrompu, restaurer les systèmes de survie et programmer les défenses automatiques. Chaque ligne de code valide restaure la station.",
    ],
  },
];
