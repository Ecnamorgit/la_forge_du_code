# Performance & Core Web Vitals (CF-17)

État de la posture performance du projet et étapes de mesure restantes.

## Déjà en place (vérifié dans le code)

| Optimisation | Où | Effet |
|---|---|---|
| **Images optimisées** | Tous les visuels via `next/image` (0 `<img>` brut), formats **AVIF/WebP** (`next.config.ts → images.formats`) | Poids image réduit, lazy-loading natif, dimensions réservées (anti-CLS) |
| **Logo léger** | `BrandLogo` affiche `PixelLogo` : bitmaps pixel art dessinés sur un petit canvas 2D, statique sous `prefers-reduced-motion` | Aucune dépendance 3D pour le logo |
| **Three.js différé** | `await import("three")` dans `components/intro/IntroSceneCanvas.tsx` (cinématique d'intro) | `three` (~600 ko) hors du bundle initial |
| **Éditeur différé** | `MonacoEditor` charge `@monaco-editor/react` en `dynamic(ssr:false)` | Monaco chargé uniquement sur les pages de leçon |
| **Imports optimisés** | `experimental.optimizePackageImports: ["@monaco-editor/react"]` | Tree-shaking plus agressif |
| **Cache de build** | `turbopackFileSystemCacheForBuild/Dev` | Builds incrémentaux rapides |
| **Pas de framework leak** | `poweredByHeader: false` | Moins d'octets d'en-têtes |

## Mesure

Une mesure reproductible existe : `e2e/web-vitals.spec.ts`, contre un build de production
(relevé et commande dans le ticket CF-17 de [ROADMAP.md](ROADMAP.md)). Elle ne remplace pas
un relevé sur l'app déployée :

1. **Lighthouse** (DevTools → Lighthouse, mode mobile) sur :
   - `/` (landing)
   - `/dashboard` (après login)
   - une page de leçon `/learn/javascript/chapitre-1` (charge Monaco)
2. Cibler le **vert** sur **LCP**, **CLS**, **INP**.

## Budget indicatif

| Métrique | Cible |
|---|---|
| LCP | < 2,5 s |
| CLS | < 0,1 |
| INP | < 200 ms |

> La mesure doit être refaite après tout changement touchant la landing ou l'éditeur.
