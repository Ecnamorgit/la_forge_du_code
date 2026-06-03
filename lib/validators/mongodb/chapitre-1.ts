import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Step 1: insertOne with nested vaisseau object + await
  (code) => {
    const c = strip(code);
    if (!/vaisseau\s*:\s*\{[^}]*nom[^}]*classe/.test(c)) {
      return fail("Construis un document avec l'objet imbrique vaisseau: { nom, classe }.");
    }
    if (!/\.insertOne\s*\(/.test(c) || !/await/.test(c)) {
      return fail("Insere le document avec await db.collection('pilotes').insertOne(...).");
    }
    return pass("Document stocke.", ["o1a", "o1b"]);
  },
  // Step 2: find $gte + projection + limit 10
  (code) => {
    const c = strip(code);
    if (!/\$gte\s*:\s*5/.test(c)) {
      return fail("Filtre le niveau avec { niveau: { $gte: 5 } }.");
    }
    if (!/\.project\s*\(/.test(c) || !/\.limit\s*\(\s*10\s*\)/.test(c)) {
      return fail("Projette uniquement nom et niveau (sans _id) et limite a 10.");
    }
    return pass("Documents extraits.", ["o2a", "o2b"]);
  },
  // Step 3: updateOne + $set on two fields
  (code) => {
    const c = strip(code);
    if (!/\.updateOne\s*\(/.test(c)) {
      return fail("Utilise updateOne avec un filtre { nom: 'Lia' }.");
    }
    if (
      !/\$set\s*:\s*\{[^}]*niveau[^}]*badge/.test(c) &&
      !/\$set\s*:\s*\{[^}]*badge[^}]*niveau/.test(c)
    ) {
      return fail("Modifie niveau ET badge avec l'operateur $set (sans ecraser le document).");
    }
    return pass("Document actualise.", ["o3a", "o3b"]);
  },
  // Step 4: aggregate pipeline + $group + $sum: 1
  (code) => {
    const c = strip(code);
    if (!/\.aggregate\s*\(\s*\[/.test(c)) {
      return fail("Utilise aggregate([ ... ]) avec un pipeline.");
    }
    if (!/\$group\s*:/.test(c) || !/\$sum\s*:\s*1/.test(c)) {
      return fail("Groupe par classe avec $group et compte avec $sum: 1.");
    }
    return pass("Pipeline maitrise.", ["o4a", "o4b"], true);
  },
];
