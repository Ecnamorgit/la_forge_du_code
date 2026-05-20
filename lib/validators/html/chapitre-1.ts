import type { Validator } from "@/data/courses/html/types";

export const validators: Validator[] = [
  (code) => {
    const c = code.toLowerCase().trim();
    if (!c.includes("<!doctype html>")) {
      return { ok: false, msg: "Le signal <!DOCTYPE html> est manquant à l'appel." };
    }
    if (!/<html\b[^>]*>/i.test(code) || !/<\/html>/i.test(code)) {
      return { ok: false, msg: "L'enceinte <html> doit être ouverte ET fermée." };
    }
    return { ok: true, msg: "Structure de base validée.", objList: ["o1a", "o1b"] };
  },
  (code) => {
    const lower = code.toLowerCase();
    if (!lower.includes("<head>") || !lower.includes("</head>")) {
      return { ok: false, msg: "La section <head> est manquante." };
    }
    const titleMatch = code.match(/<title>([\s\S]*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      return { ok: false, msg: "Chaque mission a besoin d'un nom dans <title>." };
    }
    return { ok: true, msg: "Configuration du cerveau terminée.", objList: ["o2a", "o2b"] };
  },
  (code) => {
    const lower = code.toLowerCase();
    if (!lower.includes("<body>") || !lower.includes("</body>")) {
      return { ok: false, msg: "Où est le <body> ? C'est là que tout se passe !" };
    }
    const h1Match = code.match(/<h1>([\s\S]*?)<\/h1>/i);
    if (!h1Match || !h1Match[1].toLowerCase().includes("hello world")) {
      return { ok: false, msg: "Le signal <h1>Hello World</h1> n'est pas détecté." };
    }
    return { ok: true, msg: "Mission accomplie !", objList: ["o3a", "o3b"], final: true };
  },
];
