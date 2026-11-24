import type { Validator } from "@/data/courses/html/types";
import { fail, pass } from "../_static-utils";
import { hasPrintln, strip } from "./_utils";

/** Body of `enum Name { ... }`, or null if the enum is missing. */
function enumBody(code: string, name: string): string | null {
  const m = new RegExp(`\\benum\\s+${name}\\s*\\{([^}]*)\\}`).exec(code);
  return m ? m[1] : null;
}

export const validators: Validator[] = [
  // Step 1: struct definition, instance and field access
  (code) => {
    const c = strip(code);
    const def = /\bstruct\s+Vaisseau\s*\{([^}]*)\}/.exec(c);
    if (!def) {
      return fail("Définis la struct : struct Vaisseau { nom: String, coque: u32 }", "structure");
    }
    if (!/\bnom\s*:\s*String\b/.test(def[1]) || !/\bcoque\s*:\s*u32\b/.test(def[1])) {
      return fail("La struct attend deux champs : nom: String et coque: u32.", "structure");
    }
    const instance =
      /\bVaisseau\s*\{[^}]*\bnom\s*:\s*(?:String\s*::\s*from\s*\(\s*"Aurore"\s*\)|"Aurore"\s*\.\s*(?:to_string|to_owned|into)\s*\(\s*\))[^}]*\}/.exec(
        c
      );
    if (!instance) {
      return fail('Crée l\'instance : Vaisseau { nom: String::from("Aurore"), coque: 100 }');
    }
    if (!/\bcoque\s*:\s*100\b/.test(instance[0])) {
      return fail("L'Aurore sort du chantier avec coque: 100.");
    }
    if (!/\bprintln!\s*\([^;]*\.\s*nom\b/.test(c) || !/\bprintln!\s*\([^;]*\.\s*coque\b/.test(c)) {
      return fail("Affiche les deux champs : aurore.nom et aurore.coque.");
    }
    return pass("Plan tracé.", ["o1a", "o1b"]);
  },
  // Step 2: impl block with a constructor and a &self method
  (code) => {
    const c = strip(code);
    if (!/\bimpl\s+Vaisseau\s*\{/.test(c)) {
      return fail("Ajoute le bloc : impl Vaisseau { ... }", "structure");
    }
    if (!/\bfn\s+new\s*\(\s*\w+\s*:\s*&\s*str\s*\)\s*->\s*(?:Self|Vaisseau)\b/.test(c)) {
      return fail("Constructeur attendu : fn new(nom: &str) -> Self");
    }
    if (!/\bfn\s+est_operationnel\s*\(\s*&\s*self\s*\)\s*->\s*bool/.test(c)) {
      if (/\bfn\s+est_operationnel\s*\(\s*self\s*\)/.test(c)) {
        return fail("self sans & consomme le vaisseau : emprunte-le avec &self.", "logic");
      }
      return fail("Méthode attendue : fn est_operationnel(&self) -> bool");
    }
    if (!/\bself\s*\.\s*coque\s*>\s*50\b/.test(c)) {
      return fail("La méthode renvoie self.coque > 50.", "logic");
    }
    if (!/\bVaisseau\s*::\s*new\s*\(\s*"/.test(c)) {
      return fail('Construis le vaisseau avec Vaisseau::new("Aurore").');
    }
    if (!/\.\s*est_operationnel\s*\(\s*\)/.test(c) || !hasPrintln(c)) {
      return fail("Affiche le résultat de aurore.est_operationnel().");
    }
    return pass("Vaisseau armé.", ["o2a", "o2b"]);
  },
  // Step 3: enum and exhaustive match
  (code) => {
    const c = strip(code);
    const body = enumBody(c, "Etat");
    if (body === null) {
      return fail("Définis l'enum : enum Etat { Amarre, EnVol, EnPanne }", "structure");
    }
    const variants = ["Amarre", "EnVol", "EnPanne"];
    const missing = variants.find((v) => !new RegExp(`\\b${v}\\b`).test(body));
    if (missing) {
      return fail(`Il manque la variante ${missing} dans l'enum Etat.`, "structure");
    }
    if (!/\bfn\s+signaler\s*\(\s*\w+\s*:\s*Etat\s*\)/.test(c)) {
      return fail("Fonction attendue : fn signaler(etat: Etat)");
    }
    if (!/\bmatch\s+\w+\s*\{/.test(c)) {
      return fail("Traite les cas avec match etat { ... }");
    }
    const uncovered = variants.find((v) => !new RegExp(`\\bEtat\\s*::\\s*${v}\\s*=>`).test(c));
    if (uncovered) {
      if (/(?:^|[\s,{])_\s*=>/.test(c)) {
        return fail(
          `Pas de bras _ ici : écris le cas Etat::${uncovered} pour garder le match exhaustif.`,
          "logic"
        );
      }
      return fail(`Le match oublie un cas : ajoute le bras Etat::${uncovered} => ...`, "logic");
    }
    if (!/\bsignaler\s*\(\s*Etat\s*::\s*EnVol\s*\)/.test(c)) {
      return fail("Dans main, appelle signaler(Etat::EnVol);");
    }
    return pass("Tous les cas sont couverts.", ["o3a", "o3b"]);
  },
  // Step 4: enum variants carrying data, destructured in the match
  (code) => {
    const c = strip(code);
    const body = enumBody(c, "Ordre");
    if (body === null) {
      return fail(
        "Définis l'enum : enum Ordre { Decoller, Viser(u32), Transmettre(String) }",
        "structure"
      );
    }
    if (
      !/\bDecoller\b/.test(body) ||
      !/\bViser\s*\(\s*u32\s*\)/.test(body) ||
      !/\bTransmettre\s*\(\s*String\s*\)/.test(body)
    ) {
      return fail("Variantes attendues : Decoller, Viser(u32) et Transmettre(String).", "structure");
    }
    if (!/\bfn\s+executer\s*\(\s*\w+\s*:\s*Ordre\s*\)/.test(c) || !/\bmatch\s+\w+\s*\{/.test(c)) {
      return fail("Écris fn executer(ordre: Ordre) avec un match ordre { ... }");
    }
    if (!/\bOrdre\s*::\s*Decoller\s*=>/.test(c)) {
      return fail("Le match oublie le bras Ordre::Decoller => ...", "logic");
    }
    if (
      !/\bOrdre\s*::\s*Viser\s*\(\s*[a-z]\w*\s*\)\s*=>/.test(c) ||
      !/\bOrdre\s*::\s*Transmettre\s*\(\s*[a-z]\w*\s*\)\s*=>/.test(c)
    ) {
      return fail(
        "Sors la donnée dans le motif : Ordre::Viser(cap) => ... et Ordre::Transmettre(message) => ..."
      );
    }
    if (!/\bexecuter\s*\(\s*Ordre\s*::\s*Viser\s*\(\s*90\s*\)\s*\)/.test(c)) {
      return fail("Dans main, exécute Ordre::Viser(90).");
    }
    if (!/\bexecuter\s*\(\s*Ordre\s*::\s*Transmettre\s*\(/.test(c)) {
      return fail('Dans main, exécute Ordre::Transmettre(String::from("Forge prête")).');
    }
    return pass("Flotte modélisée.", ["o4a", "o4b"], true);
  },
];
