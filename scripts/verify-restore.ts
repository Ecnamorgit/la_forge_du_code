/**
 * Checks that a restored database is usable (CF-19, runbook in
 * `docs/DEPLOYMENT.md`).
 *
 * Usage:
 *   npx tsx scripts/verify-restore.ts "postgresql://user:pass@host:5432/db"
 *
 * The URL is required and never read from .env: the environment's
 * DATABASE_URL would target production.
 *
 * Prints the row count of each table then a verdict; exit code 0 if the
 * database is usable, 1 otherwise.
 */
import { Client } from "pg";

/** Tables the application needs in order to work. */
const EXPECTED_TABLES = [
  "User",
  "OneTimeToken",
  "Account",
  "Session",
  "VerificationToken",
  "UserBadge",
  "StepCompletion",
  "TrackEvent",
] as const;

/**
 * Tables that must contain at least one row. Only `User`: a restored database
 * may have no badges and no progress, but not zero accounts.
 */
const NON_EMPTY_TABLES = ["User"] as const;

async function main(): Promise<void> {
  const url = process.argv[2];

  if (!url) {
    console.error(
      "Usage : npx tsx scripts/verify-restore.ts <DATABASE_URL de la base restauree>\n" +
        "\n" +
        "L'URL doit etre passee explicitement. Ce script ne lit pas .env pour\n" +
        "eviter de viser la production par inadvertance."
    );
    process.exit(1);
  }

  const client = new Client({ connectionString: url });

  try {
    await client.connect();
  } catch (e) {
    console.error(`Connexion impossible : ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  const missingTables: string[] = [];
  const emptyTables: string[] = [];
  const volumes: Array<{ table: string; rows: number | null }> = [];

  try {
    for (const table of EXPECTED_TABLES) {
      try {
        // Quotes required: Prisma names tables with capital letters.
        const r = await client.query(`SELECT COUNT(*)::int AS n FROM "${table}"`);
        const rows = r.rows[0].n as number;
        volumes.push({ table, rows });
        if (rows === 0 && (NON_EMPTY_TABLES as readonly string[]).includes(table)) {
          emptyTables.push(table);
        }
      } catch {
        missingTables.push(table);
        volumes.push({ table, rows: null });
      }
    }
  } finally {
    await client.end();
  }

  console.table(
    volumes.map(({ table, rows }) => ({
      table,
      rows: rows === null ? "TABLE ABSENTE" : rows,
    }))
  );

  if (missingTables.length > 0) {
    console.error(
      `\nEchec : ${missingTables.length} table(s) absente(s) — ${missingTables.join(", ")}.\n` +
        "La restauration est incomplete, ou le dump provient d'un autre schema."
    );
    process.exit(1);
  }

  if (emptyTables.length > 0) {
    console.error(
      `\nEchec : ${emptyTables.join(", ")} ne contient aucune ligne.\n` +
        "Le schema est la mais les donnees ne le sont pas — c'est une migration\n" +
        "a blanc, pas une restauration."
    );
    process.exit(1);
  }

  const total = volumes.reduce((s, v) => s + (v.rows ?? 0), 0);
  console.log(
    `\nBase exploitable : ${EXPECTED_TABLES.length} tables presentes, ${total} lignes au total.\n` +
      "Il reste a demarrer l'application contre cette base et a se connecter avec\n" +
      "un compte reel — ce script prouve la structure et le volume, pas le vecu."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
