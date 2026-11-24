import type { ChapterData } from "@/data/courses/html/types";

export const chapter1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : ALLUMAGE DE LA FORGE",
  title: "ALLUMAGE\nDE LA FORGE",
  subtitle: "Premier programme, variables, fonctions et boucles en Rust",
  totalXp: 164,
  completionBadge: "🔥",
  completionBadgeLabel: "APPRENTI FORGERON",
  steps: [
    {
      startCode: `fn main() {
    // Affiche exactement : Forge en ligne
}
`,
      placeholder: "// fn main() { ... }",
      narrator:
        "Cadet, bienvenue au chantier orbital. Le Spectre s'infiltre par les fuites mémoire des vieux systèmes. Ici, on forge en Rust : un alliage que le compilateur refuse de laisser fissurer. Allume la forge.",
      hint: `fn main() {
    println!("Forge en ligne");
}`,
      briefing: {
        title: "Premier programme : fn main et println!",
        content: `
### Pourquoi Rust
Rust produit des programmes aussi rapides que le C, mais son **compilateur** vérifie la mémoire à ta place : pas de fuite, pas d'accès à une donnée détruite. Si ça compile, toute une famille de pannes a déjà disparu.

### Le point d'entrée
Tout programme Rust démarre dans la fonction **main** :
- \`fn\` déclare une fonction
- \`main\` est celle que le système lance en premier
- les accolades \`{ }\` délimitent son corps

### Afficher un message
\`println!("Forge en ligne");\`

- \`println!\` affiche une ligne dans le terminal
- le **!** signale une **macro**, pas une fonction : sans lui, le compilateur refuse
- le texte se met entre **guillemets doubles**
- chaque instruction se termine par **;**

### Sur la station
Rust ne s'exécute pas dans le navigateur : ton code est **analysé** par la forge, comme le ferait une relecture de compilateur.

**Mission :** dans \`main\`, affiche exactement \`Forge en ligne\`.
        `,
      },
      objectives: [
        { id: "o1a", label: "Écrire dans fn main" },
        { id: "o1b", label: "Afficher avec la macro println!" },
      ],
      missionIcon: "🔥",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIÈRE ÉTINCELLE",
      bannerIcon: "🔥",
      bannerTtl: "FORGE EN LIGNE",
      bannerSub: "Ton premier programme Rust est prêt à compiler.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `fn main() {
    // 1. Déclare alliage (immuable) avec la valeur "titane"
    // 2. Déclare temperature (mutable) à 800, puis passe-la à 1200
    // 3. Affiche les deux avec println! et des {}
}
`,
      placeholder: "// let alliage = ... ; let mut temperature = ... ;",
      narrator:
        "En Rust, une variable ne bouge pas tant que tu ne l'as pas autorisée. C'est voulu : une valeur qui change sans prévenir, c'est exactement la brèche que cherche le Spectre.",
      hint: `fn main() {
    let alliage = "titane";
    let mut temperature = 800;
    temperature = 1200;
    println!("Alliage {} à {} degrés", alliage, temperature);
}`,
      briefing: {
        title: "Variables : immuables par défaut",
        content: `
### let : une valeur figée
\`let alliage = "titane";\`

Par défaut, une variable Rust est **immuable** : une fois posée, sa valeur ne change plus. Essayer de la modifier est une erreur de compilation.

### let mut : une valeur qui évolue
\`let mut temperature = 800;\`
\`temperature = 1200;\`

Le mot-clé **mut** autorise la modification. Tu l'écris seulement quand tu en as besoin : en lisant le code, on sait tout de suite ce qui peut bouger.

### Afficher des valeurs
\`println!("Alliage {} à {} degrés", alliage, temperature);\`

Chaque \`{}\` est remplacé par l'argument suivant, dans l'ordre.

### Les types
Rust devine le type tout seul (\`&str\` pour un texte littéral, \`i32\` pour un entier). Tu peux aussi l'écrire : \`let mut temperature: u32 = 800;\`

**À retenir :** immuable par défaut, \`mut\` sur demande.

**Mission :** déclare \`alliage\` et \`temperature\`, fais chauffer la forge à 1200, puis affiche les deux.
        `,
      },
      objectives: [
        { id: "o2a", label: "Déclarer une variable immuable avec let" },
        { id: "o2b", label: "Modifier une variable déclarée avec let mut" },
      ],
      missionIcon: "🌡",
      missionTag: "PROTOCOLE 02",
      missionTtl: "MONTÉE EN TEMPÉRATURE",
      bannerIcon: "🌡",
      bannerTtl: "ALLIAGE STABLE",
      bannerSub: "Tu sais ce qui peut changer, et ce qui ne changera jamais.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `// Écris la fonction calculer_poussee :
//   - deux paramètres u32 : masse et acceleration
//   - elle renvoie un u32 : masse * acceleration

fn main() {
    // Appelle calculer_poussee(120, 3) et affiche le résultat
}
`,
      placeholder: "// fn calculer_poussee(masse: u32, acceleration: u32) -> u32",
      narrator:
        "Une forge sans outils ne sert à rien. Une fonction Rust annonce ce qu'elle reçoit et ce qu'elle rend : le compilateur vérifie chaque appel avant le décollage.",
      hint: `fn calculer_poussee(masse: u32, acceleration: u32) -> u32 {
    masse * acceleration
}

fn main() {
    let poussee = calculer_poussee(120, 3);
    println!("Poussée : {}", poussee);
}`,
      briefing: {
        title: "Fonctions typées",
        content: `
### La signature
\`fn calculer_poussee(masse: u32, acceleration: u32) -> u32\`

- chaque paramètre porte son **type**, obligatoire
- \`-> u32\` annonce le type de la valeur renvoyée
- \`u32\` est un entier positif sur 32 bits

### Renvoyer une valeur
En Rust, la **dernière expression** du corps est la valeur renvoyée, à condition de ne pas mettre de point-virgule :

\`masse * acceleration\`

Avec un \`;\` à la fin, la ligne devient une instruction et ne renvoie plus rien : le compilateur te le signale. Le mot-clé \`return\` existe, mais on le réserve aux sorties anticipées.

### Les entiers courants
- \`u8\`, \`u32\`, \`u64\` : positifs uniquement
- \`i32\`, \`i64\` : positifs ou négatifs
- \`f64\` : nombres à virgule
- \`usize\` : tailles et index

### Appeler
\`let poussee = calculer_poussee(120, 3);\`

**Mission :** écris \`calculer_poussee\`, appelle-la avec 120 et 3, puis affiche le résultat.
        `,
      },
      objectives: [
        { id: "o3a", label: "Déclarer une fonction avec paramètres et retour typés" },
        { id: "o3b", label: "Appeler la fonction et afficher son résultat" },
      ],
      missionIcon: "🔧",
      missionTag: "PROTOCOLE 03",
      missionTtl: "PREMIER OUTIL",
      bannerIcon: "🔧",
      bannerTtl: "OUTIL FORGÉ",
      bannerSub: "Ta fonction annonce ses types : le compilateur veille.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `fn main() {
    let temperature = 1200;
    // 1. Avec if / else utilisé comme expression, range dans etat :
    //    "fusion" si temperature > 1000, sinon "solide"
    // 2. Affiche etat
    // 3. Avec une boucle for sur 1..=3, affiche "Coup de marteau n°{}"
}
`,
      placeholder: "// let etat = if ... { ... } else { ... };",
      narrator:
        "Le métal est chaud. Reste à décider et à répéter : en Rust, un if rend une valeur, et une boucle parcourt un intervalle sans jamais déborder.",
      hint: `fn main() {
    let temperature = 1200;
    let etat = if temperature > 1000 { "fusion" } else { "solide" };
    println!("État : {}", etat);
    for coup in 1..=3 {
        println!("Coup de marteau n°{}", coup);
    }
}`,
      briefing: {
        title: "Décider et répéter",
        content: `
### if est une expression
En Rust, \`if\` ne fait pas qu'exécuter : il **rend une valeur**.

\`let etat = if temperature > 1000 { "fusion" } else { "solide" };\`

- pas de parenthèses autour de la condition
- les deux branches doivent rendre le **même type**
- la condition doit être un vrai \`bool\` : \`if temperature\` seul ne compile pas

### La boucle for
\`for coup in 1..=3 { ... }\`

- \`1..=3\` est un intervalle **inclusif** : 1, 2, 3
- \`1..3\` s'arrête avant 3 : 1, 2
- la variable \`coup\` n'existe que dans la boucle

### Les autres boucles
- \`while condition { }\` : tant que la condition est vraie
- \`loop { }\` : boucle infinie, qu'on quitte avec \`break\`

**À retenir :** pas de débordement d'index possible, l'intervalle fait le compte pour toi.

**Mission :** calcule \`etat\` avec un \`if\` expression, affiche-le, puis donne trois coups de marteau.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser if / else comme expression" },
        { id: "o4b", label: "Parcourir l'intervalle 1..=3 avec for" },
      ],
      missionIcon: "🔨",
      missionTag: "PROTOCOLE 04",
      missionTtl: "TROIS COUPS DE MARTEAU",
      bannerIcon: "🔨",
      bannerTtl: "FORGE ALLUMÉE",
      bannerSub: "Les fondations sont posées : place à la loi de propriété.",
      bannerXp: "⚡ +41 XP",
    },
  ],
};
