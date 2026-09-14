-- Constat SRV-04 de l'audit de securite du 2026-09-12 : aucune table n'avait la
-- Row Level Security (RLS) activee. Si l'API de donnees de Supabase (PostgREST)
-- est exposee sur le schema public, la cle publique "anon" permet alors de lire
-- toutes les tables (User avec ses e-mails et hashs, OneTimeToken...).
--
-- On active la RLS SANS ajouter de politique : les roles "anon" et
-- "authenticated" de PostgREST ne voient plus aucune ligne. Le proprietaire des
-- tables (le role "postgres" qui execute les migrations et par lequel Prisma se
-- connecte) n'est PAS soumis a la RLS tant qu'on n'utilise pas FORCE : l'acces
-- de l'application, entierement via Prisma cote serveur, reste inchange.
--
-- Aucun changement de schema Prisma : la RLS n'est pas modelisee par Prisma,
-- donc cette migration ne cree aucune derive.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OneTimeToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserBadge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserUnlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StepCompletion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CinematicView" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TrackEvent" ENABLE ROW LEVEL SECURITY;
