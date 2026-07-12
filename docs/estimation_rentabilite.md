# Estimation de Tarification et Modèle de Rentabilité — Nebula Command

Ce document présente une étude financière complète pour la plateforme **Nebula Command**. Il détaille les coûts d'infrastructure (charges), la stratégie de tarification (produits) et les projections de rentabilité selon différents scénarios d'acquisition.

---

## 💸 1. Coûts d'Infrastructure Mensuels (Charges)

L'architecture serverless du site (Next.js + Prisma + Supabase + Redis + Resend) permet de démarrer avec des coûts fixes extrêmement bas, évoluant de manière proportionnelle à l'audience.

### Phase 1 : Démarrage (0 à 1 000 utilisateurs actifs)
*   **Hébergement (Vercel) :** Plan Gratuit (Hobby) — `0 €`
*   **Base de données (Supabase / Neon) :** Plan Gratuit — `0 €`
*   **Emails (Resend) :** Plan Gratuit (jusqu'à 3 000 emails/mois) — `0 €`
*   **Rate-limiting (Upstash Redis) :** Plan Gratuit (10 000 requêtes/jour) — `0 €`
*   **Total Frais Fixes :** **`0 € / mois`** (Parfait pour la phase de test et de validation).

### Phase 2 : Croissance (1 000 à 10 000 utilisateurs actifs)
*   **Hébergement (Vercel Pro) :** Bande passante accrue, builds rapides — `20 $` (~18 €)
*   **Base de données (Supabase Pro) :** Espace disque et connexions augmentés — `25 $` (~23 €)
*   **Emails (Resend Standard) :** Jusqu'à 50 000 emails/mois — `20 $` (~18 €)
*   **Rate-limiting (Upstash Redis Pay-as-you-go) :** ~`10 €`
*   **Crash reporting (Sentry Developer) :** — `0 €`
*   **Total Frais Fixes :** **`~70 € / mois`**

---

## 🎯 2. Stratégie de Tarification (Prix Mensuel)

Pour s'insérer sur le marché tout en restant compétitif face à des abonnements à 30-40 €/mois (Codecademy), nous recommandons un **modèle Freemium** avec un abonnement premium mensuel ou annuel.

### L'Offre Gratuite (Freemium)
*   **Contenu accessible :** Le cursus HTML complet + les premiers chapitres de CSS et JavaScript.
*   **Objectif :** Servir d'aimant à prospects (lead magnet) et faire tester la qualité de la Sandbox et de l'éditeur Monaco sans friction.

### L'Abonnement "Nebula Premium"
*   **Prix Mensuel :** **`9,99 € / mois`** (sans engagement)
*   **Prix Annuel (Engagement) :** **`79,00 € / an`** (soit environ `6,58 € / mois`, réduction de ~35%).
*   **Fonctionnalités débloquées :**
    - Accès illimité à l'ensemble des 14 cursus (React, TS, SQL, Node, DevOps...).
    - Classement complet (Leaderboard) et fonctionnalités multijoueurs.
    - Personnalisations d'avatar et de badges exclusives.
    - Certificats de réussite de la Flotte téléchargeables en PDF.

---

## 📈 3. Projections de Rentabilité (Scénarios)

Le taux de conversion moyen constaté sur les plateformes SaaS éducatives (du gratuit vers le payant) se situe entre **3 % et 5 %**.

### Scénario A : Démarrage Réussi (500 Utilisateurs Actifs / mois)
*   **Audience :** 485 apprenants gratuits, 15 abonnés payants (conversion de 3 %).
*   **Répartition abonnés :** 10 abonnements mensuels, 5 abonnements annuels (lissés à 6,58 €/mois).
*   **Revenus mensuels :** (10 × 9,99 €) + (5 × 6,58 €) = **`132,80 € / mois`**
*   **Coûts d'infrastructure :** `0 €` (utilisation des tiers gratuits)
*   **Bénéfice Net :** **`132,80 € / mois`** (Marge de 100 %).

### Scénario B : Vitesse de Croisière (3 000 Utilisateurs Actifs / mois)
*   **Audience :** 2 880 gratuits, 120 abonnés payants (conversion de 4 %).
*   **Répartition abonnés :** 80 abonnements mensuels, 40 abonnements annuels.
*   **Revenus mensuels :** (80 × 9,99 €) + (40 × 6,58 €) = **`1 062,40 € / mois`**
*   **Coûts d'infrastructure :** `70 €` (Vercel Pro + Supabase Pro + Resend Pro)
*   **Bénéfice Net :** **`992,40 € / mois`** (Marge de ~93 %).

### Scénario C : Phase de Maturité (15 000 Utilisateurs Actifs / mois)
*   **Audience :** 14 250 gratuits, 750 abonnés payants (conversion de 5 %).
*   **Répartition abonnés :** 500 abonnements mensuels, 250 abonnements annuels.
*   **Revenus mensuels :** (500 × 9,99 €) + (250 × 6,58 €) = **`6 640,00 € / mois`**
*   **Coûts d'infrastructure :** `150 €` (Scale de la base de données et services)
*   **Bénéfice Net :** **`6 490,00 € / mois`** (Marge de ~97 %).

---

## 💡 4. Conclusion sur le Modèle Économique

Le projet CodeForge/Nebula Command présente un **excellent ratio coût/rentabilité**. Grâce aux technos serverless, vous ne payez l'infrastructure que si vous gagnez déjà de l'argent. 

Avec un abonnement très attractif à **`9,99 € / mois`** (ou moins de **`7 €`** avec engagement annuel), le produit est très facile à vendre à des étudiants ou des développeurs juniors en reconversion professionnelle, tout en assurant un revenu récurrent solide dès la première centaine d'abonnés.
