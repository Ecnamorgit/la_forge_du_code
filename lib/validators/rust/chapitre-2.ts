import type { Validator } from "@/data/courses/html/types";
import { fail, pass } from "../_static-utils";
import { hasPrintln, isCalled, strip } from "./_utils";

export const validators: Validator[] = [
  // Step 1 (Spectre trap): repair the move of `plan`
  (code) => {
    const c = strip(code);
    if (!/\blet\s+plan\s*(?::\s*String\s*)?=\s*String\s*::\s*from\s*\(/.test(c)) {
      return fail('Garde la déclaration : let plan = String::from("Coque Alpha");');
    }
    if (/\blet\s+copie\s*(?::\s*String\s*)?=\s*plan\s*;/.test(c)) {
      return fail(
        "let copie = plan; déplace la valeur : plan n'est plus utilisable ensuite. Clone-la ou emprunte-la.",
        "logic"
      );
    }
    if (
      !/\blet\s+copie\s*(?::[^=]+)?=\s*(?:plan\s*\.\s*clone\s*\(\s*\)|&\s*plan)\s*;/.test(c)
    ) {
      return fail("Répare la ligne : let copie = plan.clone(); (ou un emprunt avec &).");
    }
    if (!/\bprintln!\s*\([^;]*\bplan\b/.test(c) || !/\bprintln!\s*\([^;]*\bcopie\b/.test(c)) {
      return fail("Les deux println! doivent rester : plan et copie s'affichent tous les deux.");
    }
    return pass("Propriété restaurée.", ["o1a", "o1b"]);
  },
  // Step 2: immutable borrow
  (code) => {
    const c = strip(code);
    if (!/\bfn\s+mesurer\s*\(\s*\w+\s*:\s*&\s*(?:String|str)\s*\)\s*->\s*usize/.test(c)) {
      if (/\bfn\s+mesurer\s*\(\s*\w+\s*:\s*String\s*\)/.test(c)) {
        return fail(
          "Sans &, mesurer devient propriétaire du plan : demande un emprunt, &String.",
          "logic"
        );
      }
      return fail("Signature attendue : fn mesurer(plan: &String) -> usize");
    }
    if (!/\.\s*len\s*\(\s*\)/.test(c)) {
      return fail("Renvoie la longueur avec .len()");
    }
    if (!/\bmesurer\s*\(\s*&\s*plan\s*\)/.test(c)) {
      return fail("Prête plan à l'appel : mesurer(&plan)");
    }
    if (!/\bprintln!\s*\([^;]*\bplan\b/.test(c)) {
      return fail("Affiche plan après l'appel : il t'appartient toujours.");
    }
    return pass("Emprunt validé.", ["o2a", "o2b"]);
  },
  // Step 3: mutable borrow
  (code) => {
    const c = strip(code);
    if (!/\bfn\s+renforcer\s*\(\s*\w+\s*:\s*&\s*mut\s+String\s*\)/.test(c)) {
      if (/\bfn\s+renforcer\s*\(\s*\w+\s*:\s*&\s*String\s*\)/.test(c)) {
        return fail("&String est en lecture seule : pour modifier, demande &mut String.", "logic");
      }
      return fail("Signature attendue : fn renforcer(coque: &mut String)");
    }
    if (!/\.\s*push_str\s*\(\s*"[^"]*blindage[^"]*"\s*\)/.test(c)) {
      return fail('Ajoute le blindage : coque.push_str(" +blindage");');
    }
    if (!/\blet\s+mut\s+coque\b/.test(c)) {
      return fail("La variable prêtée en mutable doit être déclarée avec let mut coque.", "logic");
    }
    if (!/\brenforcer\s*\(\s*&\s*mut\s+coque\s*\)/.test(c)) {
      return fail("Prête la coque en mutable : renforcer(&mut coque);");
    }
    if (!/\bprintln!\s*\([^;]*\bcoque\b/.test(c)) {
      return fail("Affiche la coque renforcée avec println!.");
    }
    return pass("Coque renforcée.", ["o3a", "o3b"]);
  },
  // Step 4: slices and &str
  (code) => {
    const c = strip(code);
    if (!/\bfn\s+indicatif\s*\(\s*\w+\s*:\s*&\s*str\s*\)\s*->\s*&\s*str/.test(c)) {
      return fail("Signature attendue : fn indicatif(nom: &str) -> &str");
    }
    if (!/&\s*\w+\s*\[\s*0?\s*\.\.\s*5\s*\]/.test(c)) {
      if (/&\s*\w+\s*\[\s*0?\s*\.\.=\s*5\s*\]/.test(c)) {
        return fail("..=5 inclut l'octet 5 : pour les 5 premiers, écris [0..5].", "logic");
      }
      return fail("Renvoie la slice des 5 premiers octets : &nom[0..5]");
    }
    if (!isCalled(c, "indicatif") || !/\bindicatif\s*\(\s*&\s*nom\s*\)/.test(c)) {
      return fail("Appelle la fonction en prêtant le nom : indicatif(&nom)");
    }
    if (!hasPrintln(c)) {
      return fail("Affiche l'indicatif avec println!.");
    }
    return pass("Loi de propriété maîtrisée.", ["o4a", "o4b"], true);
  },
];
