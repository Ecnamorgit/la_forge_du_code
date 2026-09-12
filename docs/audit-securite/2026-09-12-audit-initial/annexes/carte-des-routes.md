# Carte des routes API - La Forge du Code (2026-09-12)

Relevé en lecture seule du code de la branche main. `proxy.ts` exclut `/api` : chaque route fait son propre contrôle.

| Route | Méthode | Auth requise | Contrôle propriétaire / rôle | Validation |
|---|---|---|---|---|
| /api/auth/[...nextauth] | GET, POST | (next-auth) | - | zod dans authorize |
| /api/signup | POST | non | - | zod + 5/h/IP |
| /api/auth/forgot-password | POST | non | - | zod + 5/15 min/IP |
| /api/auth/reset-password | POST | jeton | le jeton désigne le compte | zod + 10/15 min/IP |
| /api/auth/resend-verification | POST | non | - | zod + 5/15 min/IP |
| /api/auth/check-verification | POST | non | - | zod + compteur partagé avec la connexion |
| /api/health | GET | non | - | aucune (SELECT 1) |
| /api/track | POST | non | - | liste blanche + 30/min/IP |
| /api/share/[badge] | GET | non | - | badge du catalogue, pseudo nettoyé |
| /api/leaderboard | GET | oui | lecture globale, pseudos seulement | - |
| /api/me | GET, DELETE | oui | id de session | - |
| /api/me/avatar | POST | oui | id de session + possession | zod + listes fixes |
| /api/me/cosmetics | POST | oui | id de session + possession | zod + catalogue |
| /api/me/step | POST | oui | id de session | zod + étape existante, **aucune preuve de réussite** |
| /api/me/trial-import | POST | oui | id de session | chapitres d'essai + 10/15 min/utilisateur |
| /api/me/username | PATCH | oui | id de session | zod + regex |
| /api/me/cinematic | GET, POST | oui | id de session | regex |
| /api/me/visit | POST | oui | id de session | longueur |
| /api/me/onboarded, /api/me/reset | POST | oui | id de session | pas de corps |
| /api/me/export | GET | oui | id de session | - |
