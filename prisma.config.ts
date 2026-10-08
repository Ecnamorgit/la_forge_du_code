import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // La CLI (migrate, generate) préfère DIRECT_URL, connexion Supabase qui
    // accepte les requêtes préparées. L'application lit DATABASE_URL (lib/db.ts).
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
