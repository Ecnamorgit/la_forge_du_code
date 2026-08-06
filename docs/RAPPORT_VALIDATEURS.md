# Rapport — questions ouvertes sur les validateurs

**Chantier :** CF-18, couverture de tests des validateurs
**Spec :** `docs/superpowers/specs/2026-08-06-couverture-validateurs-design.md`

Ce document liste les **arbitrages pédagogiques** rencontrés en écrivant les
tests — les cas où un validateur refuse une réponse défendable, ou en accepte
une discutable. Ils ne sont **pas tranchés ici** : décider de ce qu'un apprenant
a le droit d'écrire n'est pas une décision d'implémentation.

Les bugs techniques nets (regex fausse, condition inversée, message décrivant
une autre exigence que celle testée) ne figurent pas ici : ils sont corrigés
directement, avec le test qui les prouve.

---

## Balayage structurel — 2026-08-06

`lib/validators/parcours-integrite.test.ts`, 189 tests sur les 48 chapitres.

**Aucune anomalie.** Les deux invariants passent du premier coup :

- chaque chapitre a exactement autant de validateurs que d'étapes ;
- aucun `startCode` ne valide sa propre étape — aucune étape n'est vide.

Le balayage n'a donc rien réparé. Sa valeur est en avant : il couvre les 191
étapes, y compris celles des chapitres qui n'existent pas encore, et il échoue
si quelqu'un ajoute un chapitre sans validateur ou assouplit un validateur au
point que le code de départ suffise.

Vérifié en le sabotant volontairement : un validateur rendu permissif fait
échouer le test avec le chapitre, l'étape et la conséquence nommés.

---

## Questions ouvertes

*Aucune à ce stade — les lots de tests par chapitre n'ont pas encore été écrits.*
