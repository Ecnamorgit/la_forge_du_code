import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

export const validators: Validator[] = [
  // Étape 1 : insertOne avec un objet vaisseau imbriqué, et await
  (code) => {
    const c = strip(code);
    if (!/vaisseau\s*:\s*\{[^}]*nom[^}]*classe/.test(c)) {
      return fail("Construis un document avec l'objet imbriqué vaisseau: { nom, classe }.");
    }
    if (!/\.insertOne\s*\(/.test(c) || !/await/.test(c)) {
      return fail("Insère le document avec await db.collection('pilotes').insertOne(...).");
    }
    return pass("Document stocké.", ["o1a", "o1b"]);
  },
  // Étape 2 : find avec $gte, projection et limit(10)
  (code) => {
    const c = strip(code);
    if (!/\$gte\s*:\s*5/.test(c)) {
      return fail("Filtre le niveau avec { niveau: { $gte: 5 } }.");
    }
    if (!/\.project\s*\(/.test(c) || !/\.limit\s*\(\s*10\s*\)/.test(c)) {
      return fail("Projette uniquement nom et niveau (sans _id) et limite à 10.");
    }
    return pass("Documents extraits.", ["o2a", "o2b"]);
  },
  // Étape 3 : updateOne avec $set sur deux champs
  (code) => {
    const c = strip(code);
    if (!/\.updateOne\s*\(/.test(c)) {
      return fail("Utilise updateOne avec un filtre { nom: 'Lia' }.");
    }
    if (
      !/\$set\s*:\s*\{[^}]*niveau[^}]*badge/.test(c) &&
      !/\$set\s*:\s*\{[^}]*badge[^}]*niveau/.test(c)
    ) {
      return fail("Modifie niveau ET badge avec l'opérateur $set (sans écraser le document).");
    }
    return pass("Document actualisé.", ["o3a", "o3b"]);
  },
  // Étape 4 : pipeline aggregate avec $group et $sum: 1
  (code) => {
    const c = strip(code);
    if (!/\.aggregate\s*\(\s*\[/.test(c)) {
      return fail("Utilise aggregate([ ... ]) avec un pipeline.");
    }
    if (!/\$group\s*:/.test(c) || !/\$sum\s*:\s*1/.test(c)) {
      return fail("Groupe par classe avec $group et compte avec $sum: 1.");
    }
    return pass("Pipeline maîtrisé.", ["o4a", "o4b"], true);
  },
];
