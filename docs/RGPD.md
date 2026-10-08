# Conformité RGPD — note de traitement des données personnelles

**Projet :** La Forge du Code
**Date :** 2026-06-17

> Document de cadrage RGPD. À adapter avec une politique de confidentialité
> publiée et, le cas échéant, l'avis d'un responsable conformité.

---

## 1. Responsable de traitement

L'éditeur de la plateforme La Forge du Code. Un contact (email) doit être publié dans
la politique de confidentialité pour l'exercice des droits.

## 2. Données collectées et finalités

| Donnée | Finalité | Base légale |
|---|---|---|
| Email | Authentification, vérification du compte, emails transactionnels | Exécution du service (contrat) |
| Mot de passe (haché bcrypt) | Authentification | Exécution du service |
| Pseudo (username) | Identification publique (classement, profil) | Exécution du service |
| Progression (étapes, XP, badges) | Suivi pédagogique de l'apprenant | Exécution du service |
| Avatar (espèce, couleur, rôle) | Personnalisation cosmétique | Intérêt légitime / consentement |
| Dates (inscription, dernier jour actif) | Calcul de la liaison (série quotidienne), statistiques de compte | Exécution du service |
| Compteurs de liaison (série courante, record, relais de secours) | Suivi de la régularité d'apprentissage | Exécution du service |
| Ordres validés et briefings complets | Attribution des récompenses quotidiennes | Exécution du service |
| Cosmétiques débloqués et portés (cadre, titre, emblème, fond, uniforme) | Personnalisation cosmétique | Intérêt légitime |
| Mesure d'audience (pages vues, agrégées) | Statistiques de fréquentation | Intérêt légitime |

**Aucune donnée sensible** (au sens de l'art. 9 RGPD) n'est collectée. Le mot de
passe n'est **jamais stocké en clair** (bcrypt, coût 12).

**Mesure d'audience.** Vercel Analytics (`@vercel/analytics`, monté dans
`app/layout.tsx`) compte les pages vues **sans cookie ni identifiant
persistant** : aucun profil n'est construit, aucun visiteur n'est suivi d'une
visite à l'autre, et rien n'est rattaché à un compte. C'est ce qui la place hors
du champ du consentement préalable de l'art. 82 de la loi Informatique et
Libertés — d'où l'absence de bannière. Elle reste à mentionner dans la politique
de confidentialité publiée.

Les compteurs de la boucle quotidienne sont de la donnée de progression : ils
suivent le même cycle de vie que le reste du compte, figurent dans l'export du
§ 5 et disparaissent avec lui.

## 3. Minimisation

La collecte se limite au strict nécessaire au fonctionnement du service : pas de
nom réel obligatoire, pas de numéro de téléphone, pas de traçage publicitaire, pas
de revente de données. Le projet n'affiche pas de publicité.

## 4. Durée de conservation

Les données sont conservées tant que le compte est actif. À définir
formellement : une politique de suppression des comptes inactifs (ex. après
24 ou 36 mois d'inactivité) et la purge des tokens expirés (les
`OneTimeToken` ont déjà un `expiresAt` et un usage unique).

## 5. Droits des personnes

| Droit | État dans l'application |
|---|---|
| Accès / rectification | Profil + page avatar (pseudo, avatar) ; à compléter pour l'email |
| Effacement | Disponible depuis la page profil : `DELETE /api/me`, avec mot de passe exigé. Les relations utilisateur sont en `ON DELETE CASCADE` (supprimer un `User` purge sessions, tokens, badges, progression). |
| Réinitialisation de progression | Déjà disponible (`/api/me/reset`) |
| Portabilité | Disponible depuis la page profil : export JSON des données du compte (`GET /api/me/export`) |

## 6. Sécurité des données

- Mots de passe **hachés** (bcrypt, coût 12), jamais en clair.
- Transport **HTTPS** ; en-têtes de sécurité (HSTS, X-Frame-Options…) dans `next.config.ts`, CSP à nonce posée par `proxy.ts`.
- **Rate-limiting** sur les points d'authentification (anti brute-force).
- Endpoint « mot de passe oublié » **anti-énumération** (ne révèle pas l'existence d'un compte).
- Exécution du code étudiant **isolée** (sandbox), sans accès aux données de l'application.

## 7. Sous-traitants (transferts)

| Sous-traitant | Rôle | Donnée transmise |
|---|---|---|
| **Resend** | Envoi des emails (vérification, reset) | Adresse email |
| **Hébergeur PostgreSQL** (ex. Supabase / Neon) | Stockage de la base | Ensemble des données de compte |
| **Hébergeur applicatif** (ex. Vercel) | Exécution de l'application | Données en transit |

Vérifier que chaque sous-traitant offre des garanties RGPD (DPA, localisation UE
si possible) et le mentionner dans la politique de confidentialité.

## 8. Cookies

La session utilise un **cookie d'authentification** (JWT signé, `httpOnly`),
strictement nécessaire au fonctionnement — pas de consentement requis pour ce
seul usage. Aucun cookie publicitaire ni de mesure d'audience tierce.

Un **comptage interne** enregistre trois évènements agrégés (`landing_vue`,
`essai_lance`, `inscription`) : un nom et un horodatage, sans adresse IP, sans
cookie et sans identifiant de visiteur. Il ne permet pas de reconstituer un
parcours individuel et n'implique aucun sous-traitant tiers.

## 9. À finaliser

- Publier une **politique de confidentialité** et des **mentions légales**.
- Définir et appliquer les **durées de conservation** (comptes inactifs).
