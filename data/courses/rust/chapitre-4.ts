import type { ChapterData } from "@/data/courses/html/types";

export const chapter4: ChapterData = {
  slug: "chapitre-4",
  tag: "MISSION : ZÉRO PANNE",
  title: "ZÉRO\nPANNE",
  subtitle: "Option, Result, l'opérateur ? et les itérateurs",
  totalXp: 164,
  completionBadge: "⚒",
  completionBadgeLabel: "MAÎTRE FORGERON",
  steps: [
    {
      startCode: `// Écris trouver_reserve(secteur: u32) -> Option<u32> :
//   secteur 7 -> Some(450)   (450 litres de carburant)
//   sinon     -> None

fn main() {
    // Avec un match sur trouver_reserve(7),
    // affiche la réserve ou "Secteur vide"
}
`,
      placeholder: "// fn trouver_reserve(secteur: u32) -> Option<u32>",
      narrator:
        "Dernier chantier, Cadet. Les vieux systèmes plantaient sur des valeurs absentes : le fameux null. Rust n'a pas de null. L'absence s'écrit dans le type, et tu dois la traiter.",
      hint: `fn trouver_reserve(secteur: u32) -> Option<u32> {
    if secteur == 7 {
        Some(450)
    } else {
        None
    }
}

fn main() {
    match trouver_reserve(7) {
        Some(litres) => println!("Réserve : {} litres", litres),
        None => println!("Secteur vide"),
    }
}`,
      briefing: {
        title: "Option : l'absence sans null",
        content: `
### Pas de null
Dans beaucoup de langages, une valeur peut être \`null\` sans que rien ne l'indique : le programme plante à l'usage. Rust n'a pas de \`null\`.

### Option
\`Option<u32>\` est un enum de la bibliothèque standard, à deux variantes :
- \`Some(valeur)\` : il y a une valeur
- \`None\` : il n'y en a pas

Une fonction qui peut ne rien trouver l'**annonce** dans sa signature : \`-> Option<u32>\`.

### Tu es obligé de regarder
Un \`Option<u32>\` n'est pas un \`u32\` : impossible de calculer avec sans l'ouvrir.

\`match trouver_reserve(7) { Some(litres) => ..., None => ... }\`

Le \`match\` étant exhaustif, le cas \`None\` ne peut pas être oublié.

### Le raccourci if let
\`if let Some(litres) = trouver_reserve(7) { ... } else { ... }\`

### À éviter
\`.unwrap()\` extrait la valeur mais **fait planter** le programme sur \`None\`. C'est remettre le null par la fenêtre.

**Mission :** écris \`trouver_reserve\`, puis traite les deux cas dans \`main\`, sans \`unwrap\`.
        `,
      },
      objectives: [
        { id: "o1a", label: "Renvoyer Some ou None depuis une fonction" },
        { id: "o1b", label: "Traiter les deux cas sans unwrap" },
      ],
      missionIcon: "⛽",
      missionTag: "PROTOCOLE 01",
      missionTtl: "RÉSERVES",
      bannerIcon: "⛽",
      bannerTtl: "ABSENCE MAÎTRISÉE",
      bannerSub: "Une valeur manquante ne fera plus jamais planter la station.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `// Écris allumer(temperature: u32) -> Result<u32, String> :
//   temperature >= 1000 -> Ok(temperature)
//   sinon               -> Err(String::from("Forge trop froide"))

fn main() {
    // Avec un match sur allumer(800),
    // affiche la température ou l'erreur
}
`,
      placeholder: "// fn allumer(temperature: u32) -> Result<u32, String>",
      narrator:
        "Une opération peut échouer : forge trop froide, relais coupé. En Rust, une erreur n'est pas une explosion surprise. C'est une valeur comme une autre, visible dans le type.",
      hint: `fn allumer(temperature: u32) -> Result<u32, String> {
    if temperature >= 1000 {
        Ok(temperature)
    } else {
        Err(String::from("Forge trop froide"))
    }
}

fn main() {
    match allumer(800) {
        Ok(degres) => println!("Forge allumée à {} degrés", degres),
        Err(erreur) => println!("Échec : {}", erreur),
    }
}`,
      briefing: {
        title: "Result : l'erreur comme valeur",
        content: `
### Pas d'exceptions
Rust n'a pas de \`try / catch\`. Une fonction qui peut échouer renvoie un **Result**.

### Result
\`Result<u32, String>\` est un enum à deux variantes :
- \`Ok(valeur)\` : succès, avec le résultat (ici un \`u32\`)
- \`Err(erreur)\` : échec, avec sa cause (ici une \`String\`)

La signature dit donc tout : ce que la fonction rend quand ça marche, et ce qu'elle rend quand ça casse.

### Traiter les deux issues
\`match allumer(800) { Ok(degres) => ..., Err(erreur) => ... }\`

### Le compilateur surveille
Ignorer un \`Result\` déclenche un avertissement : une erreur ne peut pas disparaître en silence.

### Option ou Result ?
- \`Option\` : la valeur peut être **absente**, sans que ce soit une faute
- \`Result\` : l'opération peut **échouer**, et on veut savoir pourquoi

**Mission :** écris \`allumer\`, puis traite le succès et l'échec dans \`main\`, sans \`unwrap\`.
        `,
      },
      objectives: [
        { id: "o2a", label: "Renvoyer Ok ou Err depuis une fonction" },
        { id: "o2b", label: "Traiter le succès et l'échec avec match" },
      ],
      missionIcon: "🚨",
      missionTag: "PROTOCOLE 02",
      missionTtl: "PANNE ANNONCÉE",
      bannerIcon: "🚨",
      bannerTtl: "ERREUR SOUS CONTRÔLE",
      bannerSub: "Tes échecs sont prévus, nommés et traités.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `fn allumer(temperature: u32) -> Result<u32, String> {
    if temperature >= 1000 {
        Ok(temperature)
    } else {
        Err(String::from("Forge trop froide"))
    }
}

// Écris forger(temperature: u32) -> Result<String, String> :
//   - appelle allumer(temperature) avec l'opérateur ?
//   - renvoie Ok avec le texte "Lame forgée à {} degrés" (macro format!)

fn main() {
    // Affiche le résultat de forger(1200) avec un match
}
`,
      placeholder: "// let degres = allumer(temperature)?;",
      narrator:
        "Un match à chaque appel, c'est lourd. L'opérateur ? fait remonter l'erreur à l'appelant en un seul caractère, et laisse ton chemin nominal lisible.",
      hint: `fn allumer(temperature: u32) -> Result<u32, String> {
    if temperature >= 1000 {
        Ok(temperature)
    } else {
        Err(String::from("Forge trop froide"))
    }
}

fn forger(temperature: u32) -> Result<String, String> {
    let degres = allumer(temperature)?;
    Ok(format!("Lame forgée à {} degrés", degres))
}

fn main() {
    match forger(1200) {
        Ok(lame) => println!("{}", lame),
        Err(erreur) => println!("Échec : {}", erreur),
    }
}`,
      briefing: {
        title: "L'opérateur ? : propager l'erreur",
        content: `
### Le problème
Enchaîner plusieurs opérations faillibles avec un \`match\` à chaque fois noie la logique dans la gestion d'erreur.

### L'opérateur ?
\`let degres = allumer(temperature)?;\`

Placé après un \`Result\` :
- si c'est \`Ok(valeur)\`, il **extrait** la valeur et continue
- si c'est \`Err(erreur)\`, il **quitte** la fonction en renvoyant cette erreur

### La condition
\`?\` ne s'utilise que dans une fonction qui renvoie elle-même un \`Result\` (ou un \`Option\`). L'erreur a besoin d'un endroit où remonter.

### format!
\`format!("Lame forgée à {} degrés", degres)\` fonctionne comme \`println!\`, mais **renvoie** une \`String\` au lieu de l'afficher.

### Le résultat
La fonction se lit comme si rien ne pouvait échouer, et pourtant aucune erreur n'est perdue : chaque \`?\` est un point de sortie visible.

**À retenir :** \`?\` = « continue si tout va bien, sinon remonte l'erreur ».

**Mission :** écris \`forger\`, qui utilise \`?\` sur \`allumer\`, puis affiche son résultat dans \`main\`.
        `,
      },
      objectives: [
        { id: "o3a", label: "Propager une erreur avec l'opérateur ?" },
        { id: "o3b", label: "Construire une String avec format!" },
      ],
      missionIcon: "⚡",
      missionTag: "PROTOCOLE 03",
      missionTtl: "CHAÎNE DE FORGE",
      bannerIcon: "⚡",
      bannerTtl: "ERREURS PROPAGÉES",
      bannerSub: "Un seul caractère, et aucune panne ne passe sous silence.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `fn main() {
    let modules = vec![30, 80, 55];
    // 1. renforces : chaque module multiplié par 2 (iter, map, collect),
    //    rangé dans un Vec<u32>
    // 2. total : la somme de renforces (iter, sum), rangée dans un u32
    // 3. Affiche total
}
`,
      placeholder: "// modules.iter().map(|m| m * 2).collect()",
      narrator:
        "Dernière pièce : la coque est faite de modules. Un Vec les aligne, les itérateurs les transforment sans boucle manuelle ni index qui déborde. Termine la coque, Maître forgeron.",
      hint: `fn main() {
    let modules = vec![30, 80, 55];
    let renforces: Vec<u32> = modules.iter().map(|m| m * 2).collect();
    let total: u32 = renforces.iter().sum();
    println!("Coque totale : {}", total);
}`,
      briefing: {
        title: "Vec et itérateurs",
        content: `
### Vec : la liste qui grandit
\`let modules = vec![30, 80, 55];\`

- \`vec![...]\` crée un \`Vec\`, le tableau dynamique de Rust
- \`modules.len()\` donne sa taille, \`modules.push(40)\` ajoute un élément (avec \`let mut\`)
- \`modules.get(9)\` renvoie un \`Option\` : pas de lecture hors limites silencieuse

### La chaîne d'itérateurs
\`modules.iter().map(|m| m * 2).collect()\`

- \`.iter()\` parcourt les éléments en les **empruntant**
- \`.map(|m| m * 2)\` transforme chaque élément ; \`|m| ...\` est une **closure**, une fonction anonyme
- \`.collect()\` rassemble le résultat dans une collection

### Dire à collect quoi construire
\`collect\` peut produire plusieurs types : il faut l'annoter.

\`let renforces: Vec<u32> = ... .collect();\`

### Réduire
\`let total: u32 = renforces.iter().sum();\`

Autres outils : \`.filter(...)\`, \`.count()\`, \`.max()\`, \`.any(...)\`.

### Sans surcoût
Ces chaînes sont compilées en boucles aussi rapides qu'une boucle écrite à la main. La lisibilité ne coûte rien.

**Mission :** double chaque module dans \`renforces\`, additionne le tout dans \`total\`, puis affiche-le.
        `,
      },
      objectives: [
        { id: "o4a", label: "Transformer un Vec avec iter, map et collect" },
        { id: "o4b", label: "Calculer une somme avec iter et sum" },
      ],
      missionIcon: "⚒",
      missionTag: "PROTOCOLE 04",
      missionTtl: "COQUE FINALE",
      bannerIcon: "⚒",
      bannerTtl: "COQUE SANS FAILLE",
      bannerSub: "Mémoire sûre, erreurs traitées : le Spectre n'a plus de prise.",
      bannerXp: "⚡ +41 XP",
    },
  ],
};
