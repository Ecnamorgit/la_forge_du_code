# Mini-cinématiques three.js pixelisées pour l'intro — Design

**Date** : 2026-07-19
**Statut** : validé (approche hybride image + 3D choisie par Joan)

## Objectif

Remplacer les 5 images statiques de la cinématique d'intro par des
mini-cinématiques animées : chaque PNG existant devient le décor d'une scène
three.js rendue en basse résolution pixelisée, avec dérive de caméra et
effets animés par-dessus. L'art actuel est conservé tel quel.

## Contraintes

- **Bundle** : three.js est réintroduit mais chargé en import dynamique
  *uniquement à l'ouverture de l'intro*. Aucun impact sur le chemin critique
  du site (le logo reste en canvas 2D pur).
- **Rendu** : résolution interne ~320×180 upscalée avec
  `image-rendering: pixelated`, pas d'anti-aliasing — cohérent avec
  `docs/PIXEL_ART_GUIDE.md`.
- **Accessibilité / robustesse** : en `prefers-reduced-motion` ou si WebGL
  est indisponible, fallback sur l'`<Image>` statique actuelle (zéro
  régression).
- **Cycle** : chaque scène boucle pendant `INTRO_SCENE_DURATION_MS`
  (4,5 s) ; les effets sont périodiques, sans état de fin.

## Architecture

| Unité | Rôle |
|---|---|
| `lib/intro-fx.ts` | Config pure par scène : liste d'effets typés avec positions en coordonnées normalisées (0..1) de l'image. Testable unitairement (validité des bornes, 5 scènes couvertes). |
| `components/intro/IntroSceneCanvas.tsx` | Moteur three.js : renderer unique réutilisé entre les scènes, plan texturé du PNG en fond, caméra en dérive lente, calques d'effets instanciés depuis la config. Dispose tout à la fermeture. |
| `components/intro/IntroCinematic.tsx` | `SceneVisual` monte `IntroSceneCanvas` (mêmes dimensions/cadre que l'`<Image>` actuelle) avec fallback statique. |

## Types d'effets (implémentés une fois, paramétrés par scène)

- `flicker` : plan additif qui clignote (glitch rouge, alertes).
- `pulse` : halo qui respire (consoles, panneaux, wireframe).
- `sparks` : particules brèves à un point (impacts).
- `particles` : flux de particules directionnel (données qui montent, code le long des faisceaux, étoiles en parallaxe).
- `beam` : faisceau lumineux animé entre deux points (lasers verts).
- `drift` : sprite qui dérive lentement (épaves derrière la verrière).
- `scanlines` : bande de scanlines animée sur une zone (hologramme KIRA).
- `sweep` : balayage lumineux périodique sur une zone (panneau du portail).

## Composition par scène

| Scène | Caméra | Effets |
|---|---|---|
| 0 — station attaquée | pan latéral lent | glitch rouge (2-3 zones), panneaux « SPECTRE DETECTED » pulsants, étincelles d'impacts, étoiles en parallaxe |
| 1 — cockpit | balancement léger (respiration) | lueur cyan des consoles (pulse), panneaux rouges (flicker), épaves en dérive derrière la verrière |
| 2 — KIRA | zoom avant très lent | scanlines sur KIRA, halo cyan pulsant, particules de données ascendantes |
| 3 — réparation | zoom avant très lent | 3-4 faisceaux verts pulsants vers le vaisseau, particules de code le long des faisceaux |
| 4 — portail | zoom arrière très lent | sweep sur le panneau, wireframe vert pulsant, panneaux « SYSTEM STABLE » en pulse vert, particules de célébration |

## Gestion d'erreurs

- Échec de création du contexte WebGL → fallback `<Image>`.
- Texture PNG non chargée → fond noir étoilé + effets seuls (jamais d'écran cassé).

## Tests

- **Vitest** (`lib/intro-fx.test.ts`) : 5 scènes configurées, positions dans
  [0,1], durées/périodes > 0, types d'effets connus.
- **E2E manuel** (preview browser) : chaque scène animée, fallback
  reduced-motion, fermeture sans fuite (pas d'erreur console, renderer disposé).
