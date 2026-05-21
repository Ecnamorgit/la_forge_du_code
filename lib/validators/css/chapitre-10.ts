import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent } from "./_utils";

export const validators: Validator[] = [
  // Step 1: :root has --color-primary: <some color>
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!/:root\s*\{[\s\S]*?--color-primary\s*:\s*[^;}]+/i.test(css)) {
      return { ok: false, msg: "Definis --color-primary dans :root { ... }." };
    }
    return { ok: true, msg: "Variable en place.", objList: ["o1a", "o1b"] };
  },
  // Step 2: var(--color-primary) used >= 3 times, AND no more raw #00b8d4 in non-:root rules
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const usages = (css.match(/var\(\s*--color-primary\s*\)/g) ?? []).length;
    if (usages < 3) {
      return { ok: false, msg: `Utilise var(--color-primary) au moins 3 fois (actuellement ${usages}).` };
    }
    // Strip :root block then check no #00b8d4 remains
    const withoutRoot = css.replace(/:root\s*\{[^}]*\}/gi, "");
    if (/#00b8d4\b/i.test(withoutRoot)) {
      return { ok: false, msg: "Il reste un #00b8d4 en dur quelque part. Remplace-le par var(--color-primary)." };
    }
    return { ok: true, msg: "Couleur centralisee.", objList: ["o2a", "o2b"] };
  },
  // Step 3: --space-md (or --space-*) defined + var() used for padding or border-radius
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!/--space-[a-z]+\s*:\s*\d/i.test(css) && !/--radius[a-z-]*\s*:\s*\d/i.test(css)) {
      return { ok: false, msg: "Definis une variable --space-md ou --radius (avec une valeur en px ou rem)." };
    }
    if (!/(padding|border-radius)\s*:\s*[^;]*var\s*\(/i.test(css)) {
      return { ok: false, msg: "Utilise var(...) pour padding ou border-radius dans une regle." };
    }
    return { ok: true, msg: "Systeme coherent.", objList: ["o3a", "o3b"] };
  },
  // Step 4: [data-theme="..."] block redefining a custom property
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const themeMatch = css.match(/\[data-theme[\s~^*$|]*=\s*["'][^"']+["']\s*\]\s*\{([^}]+)\}/i);
    if (!themeMatch) {
      return { ok: false, msg: 'Cible [data-theme="..."] avec un set de variables.' };
    }
    if (!/--[a-z][\w-]*\s*:/i.test(themeMatch[1])) {
      return { ok: false, msg: "Le bloc [data-theme] doit redefinir au moins une variable CSS." };
    }
    return { ok: true, msg: "Design system complet.", objList: ["o4a", "o4b"], final: true };
  },
];
