import type { Validator } from "@/data/courses/html/types";

function countItemsInsideList(
  code: string,
  listTag: "ul" | "ol"
): { found: boolean; itemCount: number } {
  const re = new RegExp(`<${listTag}\\b[^>]*>([\\s\\S]*?)<\\/${listTag}>`, "i");
  const match = code.match(re);
  if (!match) return { found: false, itemCount: 0 };
  const items = match[1].match(/<li\b[^>]*>[\s\S]*?<\/li>/gi) ?? [];
  return { found: true, itemCount: items.length };
}

export const validators: Validator[] = [
  // Step 1: <ul> with >= 3 <li>
  (code) => {
    const { found, itemCount } = countItemsInsideList(code, "ul");
    if (!found) {
      return { ok: false, msg: "La balise <ul> est manquante." };
    }
    if (itemCount < 3) {
      return {
        ok: false,
        msg: `Il faut au moins trois <li> dans la <ul> (actuellement ${itemCount}).`,
      };
    }
    return {
      ok: true,
      msg: "Inventaire dresse.",
      objList: ["o1a", "o1b"],
    };
  },
  // Step 2: <ol> with >= 3 <li>
  (code) => {
    const { found, itemCount } = countItemsInsideList(code, "ol");
    if (!found) {
      return { ok: false, msg: "La balise <ol> est manquante." };
    }
    if (itemCount < 3) {
      return {
        ok: false,
        msg: `Il faut au moins trois <li> dans la <ol> (actuellement ${itemCount}).`,
      };
    }
    return {
      ok: true,
      msg: "Procédure sequencee.",
      objList: ["o2a", "o2b"],
    };
  },
  // Step 3: <table> with >= 2 <tr> each containing >= 2 <td>
  (code) => {
    const tableMatch = code.match(/<table\b[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) {
      return { ok: false, msg: "Ajoute une balise <table>." };
    }
    const rows =
      tableMatch[1].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
    if (rows.length < 2) {
      return {
        ok: false,
        msg: "Le tableau doit contenir au moins deux lignes <tr>.",
      };
    }
    const enoughCells = rows.every(
      (tr) => (tr.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi) ?? []).length >= 2
    );
    if (!enoughCells) {
      return {
        ok: false,
        msg: "Chaque ligne doit contenir au moins deux <td>.",
      };
    }
    return {
      ok: true,
      msg: "Grille opérationnelle.",
      objList: ["o3a", "o3b"],
    };
  },
  // Step 4: <thead> wrapping <th>
  (code) => {
    const theadMatch = code.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/i);
    if (!theadMatch) {
      return {
        ok: false,
        msg: "Encadre les en-têtes dans une zone <thead>.",
      };
    }
    const ths = theadMatch[1].match(/<th\b[^>]*>[\s\S]*?<\/th>/gi) ?? [];
    if (ths.length < 2) {
      return {
        ok: false,
        msg: "Place au moins deux <th> dans le <thead>.",
      };
    }
    return {
      ok: true,
      msg: "Données structurées.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
