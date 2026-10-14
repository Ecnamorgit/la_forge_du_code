/**
 * Visual theme of the combat visualizer, derived from the course. The success
 * beat (constructive gesture) differs per theme; the failure beat is shared.
 */
export type CombatTheme = "turret" | "repair" | "field";

/**
 * Combat theme of a course, from its slug (`"html"`, `"css"`,
 * `"javascript"`…). Any course not listed falls back to `"turret"`.
 */
export function combatThemeForCourse(course: string): CombatTheme {
  if (course === "html") return "repair";
  if (course === "css") return "field";
  return "turret";
}
