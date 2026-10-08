/**
 * Contrôle des validateurs statiques : pour chaque étape, l'indice `hint` (la
 * solution attendue) doit passer et le `startCode` initial doit échouer.
 *
 * Usage : npx tsx scripts/verify-validators.ts
 * Code de sortie non nul au moindre écart.
 */
import { getChapterData } from "@/lib/courses-registry";
import { getValidators } from "@/lib/validators";

const TARGETS: Array<[string, string[]]> = [
  ["react", ["chapitre-1", "chapitre-2", "chapitre-3", "chapitre-4"]],
  ["javascript", ["chapitre-11", "chapitre-12"]],
  ["typescript", ["chapitre-1"]],
  ["git", ["chapitre-1"]],
  ["sql", ["chapitre-1"]],
  ["nodejs", ["chapitre-1"]],
  ["tests", ["chapitre-1"]],
  ["devops", ["chapitre-1"]],
  ["mongodb", ["chapitre-1"]],
  ["security", ["chapitre-1"]],
  ["python", ["chapitre-1"]],
  ["algo", ["chapitre-1"]],
];

let failures = 0;
let checks = 0;

for (const [course, chapters] of TARGETS) {
  for (const chapterSlug of chapters) {
    const chapter = getChapterData(course, chapterSlug);
    const validators = getValidators(course, chapterSlug);

    if (!chapter) {
      console.error(`✗ ${course}/${chapterSlug}: chapter data introuvable`);
      failures++;
      continue;
    }
    if (validators.length !== chapter.steps.length) {
      console.error(
        `✗ ${course}/${chapterSlug}: ${validators.length} validateurs pour ${chapter.steps.length} etapes`
      );
      failures++;
    }

    chapter.steps.forEach((step, i) => {
      const validate = validators[i];
      if (!validate) {
        console.error(`✗ ${course}/${chapterSlug} step ${i + 1}: validateur manquant`);
        failures++;
        return;
      }

      // L'indice (solution attendue) doit passer.
      checks++;
      const hintRes = validate(step.hint);
      if (!hintRes.ok) {
        failures++;
        console.error(
          `✗ ${course}/${chapterSlug} step ${i + 1}: HINT rejete -> "${hintRes.msg}"`
        );
      }

      // Le startCode initial, incomplet, doit échouer.
      checks++;
      const startRes = validate(step.startCode);
      if (startRes.ok) {
        failures++;
        console.error(
          `✗ ${course}/${chapterSlug} step ${i + 1}: STARTCODE accepte (devrait echouer)`
        );
      }
    });
  }
}

console.log(`\n${checks} assertions, ${failures} echec(s).`);
if (failures > 0) process.exit(1);
console.log("✓ Tous les validateurs valident leur hint et rejettent leur startCode.");
