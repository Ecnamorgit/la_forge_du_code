-- Les tokens à usage unique sont désormais stockés hachés (SHA-256) plutôt
-- qu'en clair (voir lib/tokens.ts). On purge les tokens pré-existants en clair :
-- ils ne seraient plus vérifiables et leurs liens (vérif email / reset) doivent
-- être invalidés. Les utilisateurs concernés en redemanderont un nouveau.
-- Aucun changement de schéma : la colonne "token" reste TEXT UNIQUE.
DELETE FROM "OneTimeToken";
