/**
 * Thème visuel du visualiseur de combat, dérivé du cursus. Le beat de succès
 * (geste constructif) diffère par thème ; le beat d'échec reste partagé.
 */
export type CombatTheme = "turret" | "repair" | "field";

/**
 * Thème de combat d'un cursus, à partir de son slug (`"html"`, `"css"`,
 * `"javascript"`…). Tout cursus non ciblé retombe sur `"turret"`.
 */
export function combatThemeForCourse(course: string): CombatTheme {
  if (course === "html") return "repair";
  if (course === "css") return "field";
  return "turret";
}
