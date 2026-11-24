import type { Validator } from "@/data/courses/html/types";
import { declaresFunction, ko, logged, loggedInOrder, ok, preflight, source } from "./_utils";

/** True if a log line is the JSON of exactly the two expected facts. */
function loggedMemory(logs: string[]): boolean {
  return logs.some((line) => {
    try {
      const parsed = JSON.parse(line) as Record<string, unknown>;
      return (
        parsed !== null &&
        typeof parsed === "object" &&
        parsed.pilote === "Lia" &&
        parsed.vaisseau === "Aurore"
      );
    } catch {
      return false;
    }
  });
}

const RAPPORT = /^(.+) : checklist terminée pour (.+)\. moteurs OK, carburant OK\. Décollage autorisé\.$/;

export const validators: Validator[] = [
  // Step 1: persistent memory in localStorage
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    const c = source(code);
    if (!declaresFunction(c, "retenir") || !declaresFunction(c, "rappeler")) {
      return ko("Déclare les deux fonctions : retenir(cle, valeur) et rappeler(cle).");
    }
    if (!/localStorage\s*\.\s*setItem\s*\(/.test(c) || !/JSON\s*\.\s*stringify\s*\(/.test(c)) {
      return ko(
        'retenir doit réécrire la mémoire : localStorage.setItem("memoire-orbi", JSON.stringify(memoire));'
      );
    }
    if (!loggedInOrder(ctx!.logs, ["Lia", "Aurore"])) {
      return ko("rappeler doit retrouver le pilote (Lia) puis le vaisseau (Aurore).", "logic");
    }
    if (!logged(ctx!.logs, "inconnu")) {
      return ko('Pour une clé absente, rappeler renvoie "inconnu".', "logic");
    }
    if (!loggedMemory(ctx!.logs)) {
      return ko(
        "Les deux faits doivent être présents dans localStorage : relis la mémoire avant d'y ajouter un fait, sinon tu écrases le précédent.",
        "logic"
      );
    }
    return ok("Mémoire en ligne.", ["o1a", "o1b"]);
  },
  // Step 2: the system message is built from the memory
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    const c = source(code);
    if (!declaresFunction(c, "construireSysteme")) {
      return ko("Déclare la fonction : function construireSysteme() { ... }");
    }
    if (/pilote\s*=\s*Lia/.test(c)) {
      return ko(
        "N'écris pas les faits en dur : construis-les depuis l'objet memoire avec Object.entries(memoire).",
        "logic"
      );
    }
    if (
      !logged(
        ctx!.logs,
        "Tu es ORBI, copilote de la station Nebula. Faits connus : pilote = Lia, vaisseau = Aurore"
      )
    ) {
      return ko(
        'construireSysteme() doit renvoyer : "Tu es ORBI, copilote de la station Nebula. Faits connus : pilote = Lia, vaisseau = Aurore"'
      );
    }
    if (!logged(ctx!.logs, "Bonjour Lia, ORBI à ton service.")) {
      return ko(
        "Place construireSysteme() dans le message system, puis affiche noyau(messages).content.",
        "logic"
      );
    }
    return ok("ORBI te reconnaît.", ["o2a", "o2b"]);
  },
  // Step 3: memory exposed as a tool
  (code, ctx) => {
    const stop = preflight(ctx);
    if (stop) return stop;
    const c = source(code);
    if (!/\bretenir\s*:\s*\{/.test(c) && !/\bretenir\s*[:(]/.test(c)) {
      return ko("Ajoute l'outil au registre : retenir: { description: ..., executer: ... }");
    }
    if (!logged(ctx!.logs, "C'est noté : vaisseau = Aurore")) {
      return ko(
        'L\'outil doit ranger la valeur dans memoire[cle] et renvoyer "cle = valeur" (ici "vaisseau = Aurore").',
        "logic"
      );
    }
    if (!logged(ctx!.logs, "Aurore")) {
      return ko("memoire.vaisseau doit valoir Aurore : range la valeur avec memoire[cle] = valeur.", "logic");
    }
    return ok("ORBI retient seul.", ["o3a", "o3b"]);
  },
  // Step 4: the learner's own agent runs the take-off checklist
  (code, ctx) => {
    if (!ctx) return ko("Exécution requise.");
    if (ctx.error) return ko(`Erreur d'exécution : ${ctx.error}`);
    const c = source(code);
    if (/\b(?:NOM_AGENT|PILOTE)\s*=\s*["']\s*\?*\s*["']/.test(c)) {
      return ko("Remplace les ??? : donne un nom à ton agent, et indique ton nom de pilote.");
    }
    if (!declaresFunction(c, "construireSysteme") || !declaresFunction(c, "agent")) {
      return ko("Écris les deux fonctions : construireSysteme() et agent(demande).");
    }
    if (!/\bMAX_TOURS\b/.test(c)) {
      return ko("Borne la boucle : const MAX_TOURS = 5; puis for (let tour = 1; tour <= MAX_TOURS; tour++)");
    }
    const rapport = ctx.logs.map((l) => RAPPORT.exec(l.trim())).find((m) => m !== null);
    if (!rapport) {
      return ko(
        "L'agent doit dérouler toute la checklist et rendre le rapport final du noyau. Vérifie la boucle et le résultat de chaque outil.",
        "logic"
      );
    }
    if (rapport[1].includes("???") || rapport[2].includes("???")) {
      return ko(
        'Le noyau ne trouve pas ton identité : le message system doit suivre la forme "Tu es <NOM_AGENT>, copilote personnel. Faits connus : pilote = <PILOTE>".',
        "logic"
      );
    }
    if (
      !loggedInOrder(ctx.logs, [
        "Tour 1 : verifier(moteurs)",
        "Tour 2 : verifier(carburant)",
        "Tour 3 : retenir(dernier_decollage=OK)",
      ])
    ) {
      return ko(
        'Ajoute le journal de bord : console.log("Tour " + tour + " : " + reponse.outil + "(" + reponse.argument + ")");'
      );
    }
    if (!logged(ctx.logs, "OK")) {
      return ko("L'outil retenir doit avoir noté dernier_decollage dans la mémoire.", "logic");
    }
    return ok(`${rapport[1]} est opérationnel.`, ["o4a", "o4b"], true);
  },
];
