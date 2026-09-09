/**
 * Single source of truth for badges (ordered).
 *
 * The order defines the frame index in /sprites/badges.png: badge at array
 * position `i` → sprite frame `i` (see docs/PIXEL_ART_GUIDE.md §3C).
 *
 * This list MUST stay in sync with BADGE_BY_CHAPTER (lib/courses-meta.ts), which
 * is what actually awards badges. Every `id` here must exist there and vice-versa.
 */

export interface BadgeDef {
  id: string;
  /** Emoji fallback, shown until /sprites/badges.png ships. */
  icon: string;
  label: string;
  description: string;
}

export const BADGES: BadgeDef[] = [
  // --- HTML 1-5 ---
  { id: "selene", icon: "🌕", label: "Ingénieur Séléné", description: "Premier protocole HTML complété" },
  { id: "relay", icon: "🛰", label: "Opérateur de Relais", description: "Maîtrise les liens HTML" },
  { id: "archivist", icon: "📸", label: "Archiviste Visuel", description: "Images et médias HTML" },
  { id: "logistician", icon: "📋", label: "Logisticien", description: "Listes et tableaux HTML" },
  { id: "operator", icon: "🎛", label: "Opérateur de Console", description: "Formulaires HTML" },
  // --- CSS 1-5 ---
  { id: "css-initiate", icon: "🎨", label: "Initiateur Graphique", description: "Premier protocole CSS complété" },
  { id: "css-palette", icon: "🌈", label: "Opérateur Palette", description: "Sélecteurs & formats de couleur" },
  { id: "css-modular", icon: "📦", label: "Ingénieur Modulaire", description: "Maîtrise du box model" },
  { id: "css-pilot", icon: "🛸", label: "Pilote de Formation", description: "Maîtrise de Flexbox" },
  { id: "css-cartographer", icon: "🗺", label: "Cartographe", description: "Maîtrise de CSS Grid" },
  // --- JS 1-5 ---
  { id: "js-radio", icon: "📟", label: "Opérateur Radio", description: "Premier signal JavaScript" },
  { id: "js-analyst", icon: "🧮", label: "Analyste Tactique", description: "Conditions et opérations" },
  { id: "js-engineer", icon: "⚙", label: "Ingénieur Fonctionnel", description: "Maîtrise des fonctions" },
  { id: "js-quartermaster", icon: "📚", label: "Gestionnaire d'Inventaire", description: "Tableaux et boucles" },
  { id: "js-architect", icon: "🛠", label: "Architecte Logiciel", description: "Objets et méthodes" },
  // --- HTML 6-8 ---
  { id: "html-architect", icon: "🏗", label: "Architecte Sémantique", description: "Sémantique HTML5 et accessibilité" },
  { id: "html-signals", icon: "📡", label: "Ingénieur de Signaux", description: "Métadonnées et SEO" },
  { id: "html-media", icon: "🎥", label: "Opérateur Multimédia", description: "Vidéo, audio et images optimisées" },
  // --- CSS 6-10 ---
  { id: "css-anchor", icon: "🧲", label: "Verrouilleur Orbital", description: "Positionnement relative/absolute/fixed/sticky" },
  { id: "css-invoker", icon: "🪄", label: "Invocateur de Styles", description: "Pseudo-classes et pseudo-éléments" },
  { id: "css-adaptive", icon: "📱", label: "Ingénieur Adaptatif", description: "Responsive design et media queries" },
  { id: "css-animator", icon: "💫", label: "Animateur de Pixels", description: "Transitions et animations" },
  { id: "css-system", icon: "🧩", label: "Architecte de Design", description: "Variables CSS et thématisation" },
  // --- JS 6-10 ---
  { id: "js-data", icon: "🧮", label: "Analyste de Données", description: "Map, filter, reduce, find" },
  { id: "js-dom", icon: "🧰", label: "Ingénieur d'Interface", description: "DOM manipulation" },
  { id: "js-events", icon: "⚡", label: "Opérateur Réactif", description: "Événements et listeners" },
  { id: "js-async", icon: "🌐", label: "Opérateur Asynchrone", description: "Promises et async/await" },
  { id: "js-storage", icon: "💾", label: "Gardien des Données", description: "localStorage et persistance" },
  // --- JS 11-12 ---
  { id: "js-fetch", icon: "📡", label: "Officier de Transmission", description: "Réseau et fetch" },
  { id: "js-rest", icon: "🛰", label: "Opérateur API", description: "API REST et méthodes HTTP" },
  // --- React 1-4 ---
  { id: "react-architect", icon: "⚛", label: "Architecte UI", description: "Composants React" },
  { id: "react-state", icon: "🧠", label: "Ingénieur Réactivité", description: "useState et état" },
  { id: "react-effects", icon: "🔁", label: "Maître des Cycles", description: "useEffect et cycle de vie" },
  { id: "react-router", icon: "🗺", label: "Navigateur Spatial", description: "React Router et navigation" },
  { id: "react-fleet", icon: "🛰", label: "Cartographe de Flotte", description: "Listes et clés React" },
  { id: "react-forms", icon: "🎛", label: "Opérateur de Console", description: "Formulaires controles" },
  { id: "react-hooks", icon: "🔧", label: "Forgeron de Hooks", description: "Hooks personnalises" },
  { id: "react-context", icon: "📡", label: "Coordinateur de Flotte", description: "Contexte et useReducer" },
  // --- Mono-chapitre ---
  { id: "ts-shield", icon: "🛡", label: "Ingénieur Types", description: "TypeScript et typage statique" },
  { id: "git-archivist", icon: "🗂", label: "Archiviste du Code", description: "Git et versioning" },
  { id: "sql-keeper", icon: "🗃", label: "Gardien des Bases", description: "SQL et bases relationnelles" },
  { id: "nodejs-builder", icon: "🛸", label: "Architecte Back-End", description: "Node.js et Express" },
  { id: "tests-qa", icon: "✅", label: "Ingénieur QA", description: "Tests et Vitest" },
  { id: "devops-launcher", icon: "🚀", label: "Officier de Lancement", description: "Déploiement et Docker" },
  { id: "mongodb-leaf", icon: "🍃", label: "Archiviste NoSQL", description: "MongoDB et documents" },
  { id: "security-shield", icon: "🛡", label: "Officier Sécurité", description: "Sécurité et OWASP" },
  { id: "python-serpent", icon: "🐍", label: "Programmeur Python", description: "Python et fondamentaux" },
  { id: "algo-strategist", icon: "🧮", label: "Stratège Algorithmique", description: "Algorithmie et complexité" },
];

const FRAME_BY_ID: Record<string, number> = Object.fromEntries(
  BADGES.map((b, i) => [b.id, i])
);

/** Sprite frame index for a badge id, or null if unknown. */
export function badgeFrameById(id: string): number | null {
  return FRAME_BY_ID[id] ?? null;
}

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
