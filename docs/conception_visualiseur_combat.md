# Spécifications : Visualiseur de Combat Spatial Interactif (Style CodinGame)

Ce document décrit comment concevoir et intégrer un **Visualiseur de Combat Spatial** interactif dans **Nebula Command**, similaire au rendu visuel en temps réel de *CodinGame*, tout en respectant l'esthétique pixel art rétro 16-bit et l'architecture Next.js / React.

---

## 🎮 1. Le Concept du Rendu

L'objectif est d'insérer un panneau visuel interactif (Canvas 2D) qui s'anime lors de chaque clic sur **DÉPLOYER**. Au lieu d'afficher instantanément un message d'erreur ou de succès, l'application joue une courte séquence de combat résolvant visuellement le code soumis par l'étudiant.

```
       [ ZONE DE COMBAT SPATIAL - CANVAS 2D ]
┌───────────────────────────────────────────────────┐
│  🛸 [Joueur]  === (Laser Cyan) ===>   👾 [Ennemi] │
│                                                   │
│  [Bouclier: 100%]             [Surchauffe: 0%]    │
└───────────────────────────────────────────────────┘
```

### A. Scénario de Succès (Code Validé)
1. **Phase de tir :** Le vaisseau du cadet charge ses réacteurs (propulseurs animés) et tire un puissant rayon laser cyan sur le drone ennemi.
2. **Phase d'impact :** Le bouclier du drone se fissure en émettant des étincelles de pixels.
3. **Phase de destruction :** Le drone explose dans une animation de particules 16-bit. Le vaisseau du joueur passe en vitesse supraluminique (effet de traînée d'étoiles) vers le secteur suivant.
4. **Rendu UI :** La modal de réussite (`CompletionScreen`) apparaît après l'explosion.

### B. Scénario d'Échec (Erreur de Code ou de Syntaxe)
1. **Phase de tir raté :** Le vaisseau tire un rayon faible ou dévié, ou n'arrive pas à armer ses systèmes.
2. **Phase de contre-attaque :** Le drone ennemi s'active (les yeux clignotent en rouge) et tire un missile plasma orange.
3. **Phase d'impact joueur :** Le missile touche le vaisseau. L'écran de la console tremble (effet de secousse CSS), des étincelles rouges jaillissent, et l'alerte de brèche système s'affiche.
4. **Rendu UI :** Le message d'erreur du compilateur ou du validateur s'affiche dans la barre de feedback.

---

## 🛠️ 2. Architecture Technique (React & HTML5 Canvas)

Pour implémenter cette fonctionnalité de manière performante et fluide, nous recommandons de créer un composant `<CombatVisualizer />` basé sur un **Canvas HTML5 2D** :

```tsx
// components/lesson/CombatVisualizer.tsx
import { useEffect, useRef } from "react";

interface CombatVisualizerProps {
  status: "idle" | "running" | "success" | "error";
  onAnimationComplete: () => void;
}

export default function CombatVisualizer({ status, onAnimationComplete }: CombatVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Charger les spritesheets pré-calculées
    const playerSheet = new Image();
    playerSheet.src = "/sprites/player-ship.png";
    const enemySheet = new Image();
    enemySheet.src = "/sprites/enemy-sprites.png";

    let animationFrameId: number;
    
    // Boucle d'animation (Game Loop)
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. Dessiner le fond (défilement d'étoiles en parallaxe)
      // 2. Animer et dessiner le vaisseau joueur (frame-by-frame)
      // 3. Animer et dessiner l'ennemi
      // 4. Gérer les projectiles et explosions selon l'état 'status'
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [status]);

  return <canvas ref={canvasRef} className="w-full h-48 bg-nebula-bg-darkest border border-nebula-border/50 rounded-sm" />;
}
```

---

## 👾 3. Résolution des Animations Pixel Art avec CSS Steps

Si nous souhaitons conserver un rendu purement CSS/HTML sans passer par un Canvas lourd, nous pouvons utiliser l'astuce des **CSS steps()** en corrigeant le bug actuel de positionnement.

### Correction du Bug de Positionnement (Inline Styles)
Actuellement, [EnemySprite.tsx](file:///c:/Users/joan7/Desktop/projet%20fil%20rouge/codeforge/components/ui/EnemySprite.tsx) écrase l'animation de translation X car il définit `backgroundPosition: "0px 0px"` en dur dans l'attribut `style`. 

**Correction CSS/React :**
1. Supprimer `backgroundPosition: "0px 0px"` de l'attribut `style` inline.
2. Définir uniquement la ligne Y dans le style inline pour cibler le bon type d'ennemi :
   ```tsx
   style={{
     backgroundPositionY: "0px", // Ligne 1 pour le premier ennemi
     backgroundSize: `${2816 * scale}px ${1536 * scale}px`,
     imageRendering: "pixelated",
   }}
   ```
3. Laisser la classe CSS `.sprite-enemy-anim` animer la coordonnée X via steps :
   ```css
   @keyframes sprite-enemy-frames {
     from { background-position-x: 0px; }
     to { background-position-x: -144px; } /* 4 frames de 36px de large */
   }
   .sprite-enemy-anim {
     animation: sprite-enemy-frames 0.6s steps(4) infinite;
   }
   ```

---

## 🧠 4. Niveau Supérieur : Le Code Interactif (CodinGame Pur)

Pour aller encore plus loin et offrir une expérience véritablement identique à *CodinGame*, le code de l'élève peut être exécuté **pendant** l'animation en lui transmettant des données de jeu à chaque tick :

1. **Le Défi :** L'élève doit écrire une fonction JavaScript pour détruire des météores arrivant à des distances différentes.
2. **Le Code Étudiant :**
   ```js
   function ecrireStrategieTir(meteores) {
     // Trouver le météore le plus proche
     return meteores.sort((a, b) => a.distance - b.distance)[0].id;
   }
   ```
3. **L'Exécution Interactive :** 
   Le bac à sable (`run-js.ts`) fait tourner cette fonction en boucle, rafraîchissant les positions des météores dans le Canvas de l'application à chaque frame.
   - Si la fonction renvoie le bon ID, le laser détruit le météore.
   - Si la logique est fausse, le météore s'écrase sur le vaisseau, déclenchant l'animation de défaite.
