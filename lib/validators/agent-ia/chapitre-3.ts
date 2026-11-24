import type { Validator } from "@/data/courses/html/types";
import { declaresFunction, ko, logged, loggedInOrder, ok, preflight, source } from "./_utils";

const MISSION = "Mission accomplie : fuite détectée en B4 puis fuite colmatée en B4";

export const validators: Validator[] = [
  // Step 1: the agent loop
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    const c = source(code);
    if (!declaresFunction(c, "agent")) {
      return ko("Déclare la fonction : function agent(demande) { ... }");
    }
    if (!/\b(?:while|for)\s*\(/.test(c)) {
      return ko("Un agent boucle : utilise while (true) { ... } et sors avec return.");
    }
    if (!/role\s*:\s*["']tool["']/.test(c)) {
      return ko('À chaque tour, renvoie le résultat de l\'outil : { role: "tool", content: resultat }');
    }
    if (!logged(ctx!.logs, MISSION)) {
      return ko(
        "L'agent doit enchaîner scanner puis reparer, et rendre la réponse finale du noyau.",
        "logic"
      );
    }
    return ok("Agent autonome.", ["o1a", "o1b"]);
  },
  // Step 2: cap the number of turns
  (code, ctx) => {
    if (!ctx) return ko("Exécution requise.");
    if (ctx.error) {
      return ko(
        `Erreur d'exécution : ${ctx.error}. Si la boucle ne s'arrête pas, borne-la avec MAX_TOURS.`
      );
    }
    const c = source(code);
    if (!/\bMAX_TOURS\b/.test(c.replace(/\bconst\s+MAX_TOURS\s*=/, ""))) {
      return ko("Utilise MAX_TOURS pour borner la boucle : for (let tour = 1; tour <= MAX_TOURS; tour++)");
    }
    if (!logged(ctx.logs, "Scan 3 du secteur B4")) {
      return ko("L'agent doit laisser le scanner tourner 3 fois avant de s'arrêter.", "logic");
    }
    if (ctx.logs.some((l) => l.startsWith("Scan 4"))) {
      return ko("Le scanner a tourné plus de 3 fois : la limite MAX_TOURS n'est pas respectée.", "logic");
    }
    if (!logged(ctx.logs, "Arrêt de sécurité : limite de 3 tours atteinte")) {
      return ko('Après la boucle, renvoie : "Arrêt de sécurité : limite de 3 tours atteinte"');
    }
    return ok("Boucle sous contrôle.", ["o2a", "o2b"]);
  },
  // Step 3: a failing tool must not crash the agent
  (code, ctx) => {
    if (!ctx) return ko("Exécution requise.");
    if (ctx.error) {
      return ko(
        `L'erreur de l'outil a fait planter l'agent (${ctx.error}). Intercepte-la dans utiliser avec try / catch.`
      );
    }
    const c = source(code);
    if (!/\btry\s*\{/.test(c) || !/\bcatch\s*(?:\(|\{)/.test(c)) {
      return ko("Protège l'exécution de l'outil avec try { ... } catch (erreur) { ... }");
    }
    if (!logged(ctx.logs, "Plan B réussi : drone envoyé en B4")) {
      return ko(
        'Dans le catch, renvoie "Erreur : " + erreur.message : le noyau lira ce texte et changera de plan.',
        "logic"
      );
    }
    return ok("Plan B engagé.", ["o3a", "o3b"]);
  },
  // Step 4: a log line per turn
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    if (!loggedInOrder(ctx!.logs, ["Tour 1 : scanner(B4)", "Tour 2 : reparer(B4)"])) {
      return ko(
        'Consigne chaque demande d\'outil : console.log("Tour " + tour + " : " + reponse.outil + "(" + reponse.argument + ")");'
      );
    }
    if (!loggedInOrder(ctx!.logs, ["Tour 2 : reparer(B4)", "Tour 3 : réponse finale"])) {
      return ko('Consigne aussi le dernier tour, avant le return : "Tour 3 : réponse finale"');
    }
    if (!loggedInOrder(ctx!.logs, ["Tour 3 : réponse finale", MISSION])) {
      return ko("L'agent doit toujours rendre la réponse finale du noyau.", "logic");
    }
    return ok("Mission traçable.", ["o4a", "o4b"], true);
  },
];
