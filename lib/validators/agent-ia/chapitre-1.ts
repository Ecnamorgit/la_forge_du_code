import type { Validator } from "@/data/courses/html/types";
import { calls, declaresFunction, ko, logged, loggedInOrder, ok, preflight, source } from "./_utils";

export const validators: Validator[] = [
  // Step 1: a system message and a user message, roles printed
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    const c = source(code);
    if (!/role\s*:\s*["']system["']/.test(c) || !/role\s*:\s*["']user["']/.test(c)) {
      return ko('La conversation attend deux messages : un de role "system", un de role "user".');
    }
    if (!/content\s*:/.test(c)) {
      return ko("Chaque message porte son texte dans la propriété content.");
    }
    if (!logged(ctx!.logs, "2")) {
      return ko("Affiche la taille de la conversation : console.log(messages.length) doit donner 2.");
    }
    if (!loggedInOrder(ctx!.logs, ["system", "user"])) {
      return ko("Affiche le role de chaque message, dans l'ordre : system, puis user.");
    }
    return ok("Canal ouvert.", ["o1a", "o1b"]);
  },
  // Step 2: call the model and read its reply
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    if (!calls(source(code), "noyau")) {
      return ko("Appelle le modèle : const reponse = noyau(messages);");
    }
    if (!logged(ctx!.logs, "assistant")) {
      return ko("Affiche le rôle de la réponse : console.log(reponse.role);");
    }
    if (!logged(ctx!.logs, "ORBI en ligne. Bien reçu : ORBI, tu me reçois ?")) {
      return ko("Affiche le texte de la réponse : console.log(reponse.content);");
    }
    return ok("ORBI répond.", ["o2a", "o2b"]);
  },
  // Step 3: keep the history across two exchanges
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    if (!/\.\s*push\s*\(/.test(source(code))) {
      return ko("Range chaque nouveau message dans l'historique avec messages.push(...).");
    }
    if (!logged(ctx!.logs, "Échange n°2. Bien reçu : Quel est ton rôle ?")) {
      return ko(
        'Le noyau doit recevoir le second message user, "Quel est ton rôle ?", avec tout l\'historique.',
        "logic"
      );
    }
    if (!logged(ctx!.logs, "5")) {
      return ko(
        "La conversation doit compter 5 messages : system, user, assistant, user, assistant. Une réponse du noyau n'a pas été ajoutée.",
        "logic"
      );
    }
    return ok("Historique tenu.", ["o3a", "o3b"]);
  },
  // Step 4: one full turn wrapped in envoyer(texte)
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    const c = source(code);
    if (!declaresFunction(c, "envoyer")) {
      return ko("Déclare la fonction : function envoyer(texte) { ... }");
    }
    if (!logged(ctx!.logs, "Échange n°1. Bien reçu : Statut des moteurs ?")) {
      return ko("envoyer doit ajouter le message user, appeler noyau, puis renvoyer reponse.content.");
    }
    if (!logged(ctx!.logs, "Échange n°2. Bien reçu : Et le carburant ?")) {
      return ko(
        "Le second appel doit être l'échange n°2 : garde messages en dehors de la fonction pour conserver l'historique.",
        "logic"
      );
    }
    return ok("Copilote éveillé.", ["o4a", "o4b"], true);
  },
];
