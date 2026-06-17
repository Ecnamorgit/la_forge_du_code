# Plan d'implémentation — Logo 3D Interactif avec Three.js

Ce plan décrit l'approche technique pour remplacer l'étoile 2D du logo par une étoile 3D interactive à faible nombre de polygones (low-poly), animée en temps réel avec **Three.js**, tout en conservant le style rétro-futuriste du site.

---

## ⚠️ User Review Required

### Choix technologique : Vanilla Three.js vs React Three Fiber
- **Vanilla Three.js (Recommandé)** : Nous utiliserons la bibliothèque pure `three` dans un hook `useEffect` React. Étant donné que le projet utilise **React 19**, utiliser React Three Fiber pourrait entraîner des conflits de dépendances de packages (peer dependencies). Vanilla Three.js est 100% stable, léger et sans conflit de version.
- **Rendu Rétro Low-Poly** : Pour rester raccord avec le style pixel art du site, la géométrie 3D de l'étoile centrale sera un octaèdre (double pyramide) avec un ombrage plat (`flatShading: true`). Cela créera des facettes nettes qui réfléchiront la lumière de manière rétro-futuriste.

---

## ⚙️ Modifications Proposées

### 1. Installation de la Dépendance
Nous devons installer `three` et ses types TypeScript :
- Commande : `pnpm add three` et `pnpm add -D @types/three`

---

### 2. Composants de l'Application

#### [NEW] [ThreeLogoCanvas.tsx](file:///c:/Users/joan7/Desktop/projet%20fil%20rouge/codeforge/components/ui/ThreeLogoCanvas.tsx)
Composant autonome encapsulant le canvas 3D.
- Initialise une scène, une caméra de perspective, et un rendu WebGL.
- Crée une étoile centrale (octaèdre low-poly) dorée métallique avec `THREE.OctahedronGeometry`.
- Ajoute une lumière directionnelle orange et une lumière ponctuelle cyan en rotation pour créer des reflets dynamiques sur les facettes de l'étoile.
- Gère le nettoyage de la mémoire (garbage collection) lors du démontage du composant pour éviter les fuites de mémoire.

#### [MODIFY] [BrandLogo.tsx](file:///c:/Users/joan7/Desktop/projet%20fil%20rouge/codeforge/components/ui/BrandLogo.tsx)
- Remplacement du dessin d'étoile 2D par le nouveau composant interactif `<ThreeLogoCanvas />` au centre.
- Conservation de l'anneau extérieur rotatif en SVG et des textes courbés "NEBULA COMMAND" pour garantir une netteté vectorielle parfaite autour du rendu 3D.

---

## 🔍 Plan de Vérification

### Tests Automatisés
- Lancement de `pnpm run build` pour valider que le code compile sans erreurs TypeScript ou Next.js (SSR).

### Vérification Manuelle
- Vérification visuelle sur la page d'accueil et le tableau de bord :
  - L'étoile 3D doit tourner sur elle-même.
  - Les facettes doivent scintiller sous les reflets lumineux cyan et orange.
  - Aucun crash ni fuite mémoire lors des changements de page (navigation Dashboard ↔ Learn).
