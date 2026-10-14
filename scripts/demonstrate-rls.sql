-- Row Level Security demonstration (audit SRV-04): it blocks an unprivileged
-- role, such as Supabase's public "anon" key, without hindering the table
-- owner, the role Prisma connects with.
--
-- Run it on a test database, never in production:
--   docker exec -i codeforge-e2e psql -U postgres -d codeforge_test < scripts/demonstrate-rls.sql
--
-- Migration 20260914102000_enable_row_level_security enables RLS; this
-- script disables it long enough to show the difference, then re-enables it
-- and removes its test objects.

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
