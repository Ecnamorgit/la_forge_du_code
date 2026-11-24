import type { Validator } from "@/data/courses/html/types";
import { calls, ko, logged, loggedInOrder, ok, preflight, source } from "./_utils";

const SCAN = "Secteur B4 : aucune anomalie";

export const validators: Validator[] = [
  // Step 1: a tool is a name, a description and a function
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    const c = source(code);
    if (!/\bnom\s*:/.test(c) || !/\bdescription\s*:/.test(c) || !/\bexecuter\s*[:(]/.test(c)) {
      return ko("L'outil attend trois propriétés : nom, description et executer.");
    }
    if (!logged(ctx!.logs, "scanner")) {
      return ko("Affiche le nom de l'outil : console.log(scanner.nom);");
    }
    if (!logged(ctx!.logs, SCAN)) {
      return ko(`scanner.executer("B4") doit renvoyer : ${SCAN}`);
    }
    return ok("Scanner opérationnel.", ["o1a", "o1b"]);
  },
  // Step 2 (Spectre trap): repair the lookup in the dispatcher
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    if (/\boutils\s*\.\s*nom\b/.test(source(code))) {
      return ko(
        "outils.nom cherche une clé appelée « nom ». Pour utiliser la valeur de la variable, écris outils[nom].",
        "logic"
      );
    }
    if (!loggedInOrder(ctx!.logs, [SCAN, "Heure de bord : 14h07"])) {
      return ko("Le scanner et l'horloge doivent répondre : vérifie la recherche dans le registre.");
    }
    if (!logged(ctx!.logs, "Outil inconnu : laser")) {
      return ko('Un outil absent du registre doit renvoyer "Outil inconnu : laser".');
    }
    return ok("Aiguillage rétabli.", ["o2a", "o2b"]);
  },
  // Step 3: tell a tool request from a text reply, and run the tool
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    const c = source(code);
    if (!calls(c, "noyau")) {
      return ko("Appelle d'abord le modèle : const reponse = noyau(messages);");
    }
    if (!/\bif\s*\([^)]*\.\s*outil\b/.test(c)) {
      return ko("Teste la nature de la réponse : if (reponse.outil) { ... } else { ... }");
    }
    if (!calls(c, "utiliser")) {
      return ko("Exécute l'outil demandé : utiliser(reponse.outil, reponse.argument)");
    }
    if (!logged(ctx!.logs, "Outil demandé : scanner")) {
      return ko('Annonce la demande : console.log("Outil demandé : " + reponse.outil);');
    }
    if (!logged(ctx!.logs, SCAN)) {
      return ko("Affiche le résultat renvoyé par utiliser(...).");
    }
    return ok("Demande exécutée.", ["o3a", "o3b"]);
  },
  // Step 4: send the tool result back and get the final answer
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    const c = source(code);
    if (!/role\s*:\s*["']tool["']/.test(c)) {
      return ko('Renvoie le résultat au modèle : messages.push({ role: "tool", content: resultat });');
    }
    if (!calls(c, "utiliser")) {
      return ko("Exécute l'outil demandé avec utiliser(...).");
    }
    if (!logged(ctx!.logs, `Rapport d'ORBI : ${SCAN}`)) {
      return ko(
        "Après avoir ajouté le résultat, rappelle noyau(messages) et affiche le content de cette réponse finale.",
        "logic"
      );
    }
    return ok("Circuit bouclé.", ["o4a", "o4b"], true);
  },
];
