# Performance & Core Web Vitals (CF-17)

État de la posture performance du projet et étapes de mesure restantes.

## Déjà en place (vérifié dans le code)

| Optimisation | Où | Effet |
|---|---|---|
| **Images optimisées** | Tous les visuels via `next/image` (0 `<img>` brut), formats **AVIF/WebP** (`next.config.ts → images.formats`) | Poids image réduit, lazy-loading natif, dimensions réservées (anti-CLS) |
| **Logo 3D différé** | `BrandLogo` charge `ThreeLogoCanvas` en `dynamic(ssr:false)` | `three` (~600 ko) hors du chemin critique, pas de blocage du rendu initial |
| **Éditeur différé** | `MonacoEditor` charge `@monaco-editor/react` en `dynamic(ssr:false)` | Monaco chargé uniquement sur les pages de leçon |
| **Imports optimisés** | `experimental.optimizePackageImports: ["@monaco-editor/react"]` | Tree-shaking plus agressif |
| **Cache de build** | `turbopackFileSystemCacheForBuild/Dev` | Builds incrémentaux rapides |
| **Pas de framework leak** | `poweredByHeader: false` | Moins d'octets d'en-têtes |

## Étape restante : mesure (manuelle, navigateur requis)

Le code est optimisé ; il reste à **mesurer** sur l'app déployée (impossible sans navigateur) :

1. **Lighthouse** (DevTools → Lighthouse, mode mobile) sur :
   - `/` (landing — contient le logo 3D)
   - `/dashboard` (après login)
   - une page de leçon `/learn/javascript/chapitre-1` (charge Monaco)
2. Cibler le **vert** sur **LCP**, **CLS**, **INP**.
3. Point de vigilance principal : le **logo 3D Three.js**. Plusieurs instances simultanées (nav + page) = plusieurs canvases WebGL. Si l'INP/CPU souffre sur mobile bas de gamme, envisager :
   - une seule instance partagée du canvas, ou
   - un fallback statique (PNG/SVG) sous `prefers-reduced-motion` ou petit écran.

## Budget indicatif

| Métrique | Cible |
|---|---|
| LCP | < 2,5 s |
| CLS | < 0,1 |
| INP | < 200 ms |

> La mesure Lighthouse fait partie de la checklist de déploiement (`docs/DEPLOYMENT.md`) et doit être refaite après tout changement touchant la landing ou l'éditeur.
