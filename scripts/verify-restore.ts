/**
 * Vérifie qu'une base restaurée est exploitable (CF-19, runbook de
 * `docs/DEPLOYMENT.md`).
 *
 * Usage :
 *   npx tsx scripts/verify-restore.ts "postgresql://user:pass@hote:5432/base"
 *
 * L'URL est obligatoire et jamais lue depuis .env : le DATABASE_URL de
 * l'environnement viserait la production.
 *
 * Affiche le volume de chaque table puis un verdict ; code de sortie 0 si la
 * base est exploitable, 1 sinon.
 */
import { Client } from "pg";

/** Tables dont la présence conditionne le fonctionnement de l'application. */
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
 * Tables qui doivent contenir au moins une ligne. Seulement `User` : une base
 * restaurée peut n'avoir ni badge ni progression, mais pas zéro compte.
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
        // Guillemets requis : Prisma nomme les tables avec des majuscules.
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
