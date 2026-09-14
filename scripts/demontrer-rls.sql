-- Démonstration du constat SRV-04 (audit de sécurité du 2026-09-12) : la Row
-- Level Security bloque un rôle non privilégié (comme la clé publique « anon »
-- de Supabase / PostgREST), sans gêner le propriétaire des tables (le rôle par
-- lequel Prisma se connecte).
--
-- À lancer sur une base de TEST, jamais la production :
--   docker exec -i codeforge-e2e psql -U postgres -d codeforge_test < scripts/demontrer-rls.sql
--
-- La migration 20260914102000_enable_row_level_security active la RLS ; ce
-- script la bascule temporairement pour montrer l'avant / après, puis remet
-- l'état activé et nettoie ses objets de test.

INSERT INTO "User" (id, email, username, password, "lastVisit")
VALUES ('rls-temoin', 'rls@codeforge.test', 'rlstemoin', 'x', '') ON CONFLICT (id) DO NOTHING;
CREATE ROLE anon_test NOLOGIN;
GRANT USAGE ON SCHEMA public TO anon_test;
GRANT SELECT ON "User" TO anon_test;

\echo 'AVANT (RLS desactivee) : le role anon (cle publique Supabase) lit toute la table User'
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
SET ROLE anon_test;
SELECT count(*) AS lignes_vues_par_anon FROM "User";
RESET ROLE;

\echo 'APRES (RLS activee, sans politique) : le role anon ne voit plus aucune ligne'
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
SET ROLE anon_test;
SELECT count(*) AS lignes_vues_par_anon FROM "User";
RESET ROLE;

\echo 'Le proprietaire (role par lequel Prisma se connecte) voit toujours les lignes'
SELECT count(*) AS lignes_vues_par_owner FROM "User";

REVOKE ALL ON "User" FROM anon_test;
REVOKE ALL ON SCHEMA public FROM anon_test;
DROP ROLE anon_test;
DELETE FROM "User" WHERE id = 'rls-temoin';
