import type { ChapterData } from "@/data/courses/html/types";

export const chapitre9: ChapterData = {
  slug: "chapitre-9",
  tag: "MISSION : DYNAMIQUE VISUELLE",
  title: "TRANSITIONS\n& ANIMATIONS",
  subtitle: "Anime les éléments du dock",
  totalXp: 260,
  completionBadge: "💫",
  completionBadgeLabel: "ANIMATEUR DE PIXELS",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Animations</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .btn { background: #00b8d4; color: black; padding: 12px 24px; font-weight: bold; border: none; cursor: pointer; }\n      .btn:hover { background: #00ff88; }\n      \n    </style>\n  </head>\n  <body>\n    <button class="btn">Survole-moi</button>\n  </body>\n</html>',
      placeholder: "/* Adoucis le changement de couleur avec une transition */",
      narrator:
        "Le changement de couleur du bouton est brutal. Ajoute une transition pour l'adoucir sur 0.3s.",
      hint: "Ajoute a .btn : transition: background 0.3s ease;",
      briefing: {
        title: "transition",
        content: `
*« Un changement brutal fatigue l'œil en poste long. Une \`transition\`, et l'état passe en douceur — le confort aussi, c'est de l'ingénierie. »* — **Kira**

### Le problème
Sans transition, un changement de propriété est **instantane** au :hover ou :focus. Visuellement brutal.

### transition: propriété duree easing
\`.btn {\`
\`  transition: background 0.3s ease;\`
\`}\`

### Ce qu'on peut animer
Presque toute propriété numérique : **color, background, border, transform, opacity, width, height, padding, margin, font-size**...

### Easings (courbes)
- **linear** : vitesse constante (mécanique).
- **ease** (défaut) : démarre vite, ralentit.
- **ease-in** : démarre lent, finit vite.
- **ease-out** : démarre vite, finit lent (plus naturel).
- **ease-in-out** : doux des deux cotes.
- **cubic-bezier(...)** : courbe personnalisee.

### Animer plusieurs propriétés
\`transition: background 0.3s ease, color 0.2s ease;\`
ou simplement :
\`transition: all 0.3s ease;\` (a utiliser avec parcimonie — peut animer des choses inattendues)

**À retenir :** la transition se met sur l'état **de base**, pas sur :hover. Sinon elle ne marchera qu'a l'activation, pas au retour.
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter transition sur .btn" },
        { id: "o1b", label: "Spécifier une duree (0.2s a 0.5s)" },
      ],
      docRefs: ["css/transition"],
      missionIcon: "🌀",
      missionTag: "PROTOCOLE 01",
      missionTtl: "ADOUCISSEMENT",
      bannerIcon: "🌀",
      bannerTtl: "TRANSITION FLUIDE",
      bannerSub: "Le changement de couleur s'etale dans le temps.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Animations</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .card { background: #00b8d4; color: black; padding: 24px; width: 200px; transition: transform 0.3s ease; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="card">Module orbital</div>\n  </body>\n</html>',
      placeholder: "/* Au survol, agrandis la carte de 10% avec transform: scale */",
      narrator:
        "Quand le curseur passe sur la carte, agrandis-la de 10 % avec transform: scale. La transition est déjà en place.",
      hint: "Ajoute : .card:hover { transform: scale(1.1); }",
      briefing: {
        title: "transform",
        content: `
### transform = manipulation visuelle
**transform** modifie l'apparence sans toucher au flux. Très performant car le navigateur l'optimise sur le GPU.

### Les fonctions courantes
- **scale(n)** : agrandir/retrecir (1 = taille normale).
- **rotate(deg)** : tourner (45deg, -90deg, 1turn).
- **translate(x, y)** : décaler (translateX, translateY).
- **skew(deg)** : incliner.

### Combiner
\`transform: scale(1.1) rotate(5deg) translateY(-10px);\`
(ordre = de droite à gauche dans le rendu)

### Pourquoi transform ?
**Performance.** Modifier width/height force le navigateur à recalculer la mise en page (reflow). transform fait juste un calcul GPU (compose).

### Cas d'usage typique
\`.card { transition: transform 0.3s ease; }\`
\`.card:hover { transform: scale(1.05); }\`

### Point d'origine
**transform-origin: center** par défaut. Tu peux changer : top left, 50% 100%, etc.

**À retenir :** préfère TOUJOURS transform a width/height/top/left pour les animations.
        `,
      },
      objectives: [
        { id: "o2a", label: "Cibler .card:hover" },
        { id: "o2b", label: "Appliquer transform: scale(...) ou transform: rotate(...)" },
      ],
      missionIcon: "🔍",
      missionTag: "PROTOCOLE 02",
      missionTtl: "TRANSFORMATION GPU",
      bannerIcon: "🔍",
      bannerTtl: "EFFET D'ECHELLE",
      bannerSub: "La carte réagit au survol par une transformation fluide.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Animations</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .pulse { background: #00ff88; color: black; padding: 20px; width: 200px; text-align: center; font-weight: bold; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="pulse">ALERTE</div>\n  </body>\n</html>',
      placeholder: "/* Cree une animation 'blink' qui fait pulser .pulse */",
      narrator:
        "L'alerte est statique. Cree une animation @keyframes blink qui fait varier l'opacite de 1 a 0.3, et applique-la a .pulse en boucle infinie sur 1s.",
      hint: "Ajoute :\n@keyframes blink { 0%{opacity:1;} 50%{opacity:0.3;} 100%{opacity:1;} }\n.pulse { animation: blink 1s infinite; }",
      briefing: {
        title: "@keyframes et animation",
        content: `
### transition vs animation
- **transition** : passe de A a B au declenchement (hover, focus).
- **animation** : sequence définie, peut tourner en boucle, sans déclencheur.

### Définir une animation
\`@keyframes blink {\`
\`  0%   { opacity: 1; }\`
\`  50%  { opacity: 0.3; }\`
\`  100% { opacity: 1; }\`
\`}\`

### L'appliquer
\`.pulse {\`
\`  animation: blink 1s infinite;\`
\`}\`

### Propriétés d'animation
- **animation-name** : nom du @keyframes.
- **animation-duration** : duree (1s, 2.5s).
- **animation-iteration-count** : nombre de cycles (3, infinite).
- **animation-timing-function** : easing (ease, linear...).
- **animation-delay** : attente avant le début.
- **animation-direction** : normal, reverse, alternate (pong).
- **animation-fill-mode** : état avant/après (forwards garde le dernier frame).

### Shorthand
\`animation: blink 1s ease-in-out infinite alternate;\`

**Astuce :** pour une animation declenchee (et pas en boucle), utilise transition. @keyframes c'est pour les sequences complexes ou repetitives.
        `,
      },
      objectives: [
        { id: "o3a", label: "Définir une @keyframes (n'importe quel nom)" },
        { id: "o3b", label: "Appliquer animation: ... sur .pulse" },
      ],
      missionIcon: "💓",
      missionTag: "PROTOCOLE 03",
      missionTtl: "ANIMATION CYCLIQUE",
      bannerIcon: "💓",
      bannerTtl: "PULSATION ACTIVE",
      bannerSub: "L'alerte attire l'oeil par sa pulsation.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Animations</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .icon { background: #00b8d4; color: black; padding: 20px; width: 60px; height: 60px; text-align: center; font-size: 24px; line-height: 60px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="icon">🛸</div>\n  </body>\n</html>',
      placeholder: "/* Cree une animation spin qui fait tourner l'icone */",
      narrator:
        "Fais tourner l'icône en boucle sur elle-même grâce a une animation spin de 2s lineaire infinie qui fait passer rotate(0) a rotate(360deg).",
      hint: "Ajoute :\n@keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }\n.icon { animation: spin 2s linear infinite; }",
      briefing: {
        title: "Animer une transformation",
        content: `
### Combiner @keyframes + transform
La combinaison la plus puissante : une animation qui fait varier **transform**. Performance GPU + sequence repetable.

### Le classique spinner
\`@keyframes spin {\`
\`  from { transform: rotate(0deg); }\`
\`  to   { transform: rotate(360deg); }\`
\`}\`

\`.icon {\`
\`  animation: spin 2s linear infinite;\`
\`}\`

### from / to vs %
- **from { ... } to { ... }** : équivalent a 0 % / 100 %, plus lisible pour 2 étapes.
- **0% / N% / 100%** : pour 3+ étapes.

### Autres effets typiques
- **Float** : translateY(0) -> translateY(-10px) -> translateY(0) en boucle.
- **Bounce** : combinaison de scale et translateY.
- **Shake** : translateX rapide alterne.
- **Fade in** : opacity 0 -> 1.

### Astuce performance
- **Anime transform et opacity en priorité** (les seules vraiment "gratuites" côté GPU).
- **Évite d'animer width, height, top, left** sur des éléments visibles — ca declenche un reflow couteux.

**À retenir :** les meilleures animations sont **breves, repetables, et utilisent transform/opacity**.
        `,
      },
      objectives: [
        { id: "o4a", label: "Définir une @keyframes utilisant transform: rotate" },
        { id: "o4b", label: "Appliquer animation: ... linear infinite sur .icon" },
      ],
      missionIcon: "🌀",
      missionTag: "PROTOCOLE 04",
      missionTtl: "ROTATION CONTINUE",
      bannerIcon: "🌀",
      bannerTtl: "MOUVEMENT PERMANENT",
      bannerSub: "L'icône tourne sans fin, prête pour ton prochain spinner.",
      bannerXp: "⚡ +65 XP",
    },
  ],
};