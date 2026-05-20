# Changelog - Nebula Command

Ce fichier répertorie les correctifs et améliorations apportés au projet.

## [2024-05-13]

### Correctifs (Fixes)

#### 1. Alignement de la Landing Page
- **Problème :** Tous les composants étaient regroupés et collés à gauche de l'écran.
- **Cause :** Un sélecteur universel `* { margin: 0; padding: 0; }` dans `globals.css` n'était pas "layeré". En Tailwind v4, les styles hors-couche (unlayered) écrasent les utilitaires comme `mx-auto` et `px-4`.
- **Solution :** Supprimer le bloc ou le placer dans `@layer base { ... }`.

#### 2. Affichage de l'indice (Chapitre 1 HTML)
- **Problème :** Le conseil affichait "Utilise puis ." au lieu du code complet.
- **Cause :** Les balises `<!DOCTYPE html>` et `<html>` dans le champ `hint` étaient interprétées comme du code HTML réel par le navigateur via `dangerouslySetInnerHTML`.
- **Solution :** Remplacer les chevrons par des entités HTML (`&lt;` et `&gt;`) dans `data/courses/html/chapitre-1.ts`.

#### 3. Encodage du titre HintBox (ARIA)
- **Problème :** Le titre du popup d'indice affichait des caractères corrompus : `ðŸ“¡ Transmission d'ARIA`.
- **Cause :** Mauvais encodage de l'émoji satellite dans le fichier source.
- **Solution :** Corriger l'émoji `📡` directement dans `components/ui/HintBox.tsx`.
