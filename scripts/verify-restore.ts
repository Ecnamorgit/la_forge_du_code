/**
 * Verifie qu'une base restauree est reellement exploitable (CF-19).
 *
 * Le runbook de `docs/DEPLOYMENT.md` demande de « verifier que l'app demarre et
 * que les comptes/progression sont presents ». C'etait une phrase ; ceci en
 * fait une commande, pour qu'un test de restauration soit reproductible plutot
 * que laisse a l'appreciation du moment.
 *
 * Usage :
 *   npx tsx scripts/verify-restore.ts "postgresql://user:pass@hote:5432/base"
 *
 * L'URL est un ARGUMENT OBLIGATOIRE, jamais lue depuis .env : ce script
 * s'execute contre une base jetable, et prendre par defaut le DATABASE_URL de
 * l'environnement reviendrait a viser la production.
 *
 * Sortie : un tableau des volumes par table, puis un verdict.
 * Code de sortie 0 si la base est exploitable, 1 sinon.
 */
import { Client } from "pg";

/** Tables dont la presence conditionne le fonctionnement de l'application. */
const TABLES_ATTENDUES = [
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
 * Tables qui doivent contenir au moins une ligne pour qu'on parle d'une
 * restauration reussie plutot que d'un schema vide.
 *
 * Volontairement limite a `User` : une base restauree peut legitimement n'avoir
 * ni badge ni progression (compte neuf), mais une base sans aucun compte n'est
 * pas une restauration — c'est une migration a blanc.
 */
const TABLES_NON_VIDES = ["User"] as const;

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

  const manquantes: string[] = [];
  const vides: string[] = [];
  const volumes: Array<{ table: string; lignes: number | null }> = [];

  try {
    for (const table of TABLES_ATTENDUES) {
      try {
        // Nom de table entre guillemets : le schema Prisma les cree en CamelCase.
        const r = await client.query(`SELECT COUNT(*)::int AS n FROM "${table}"`);
        const lignes = r.rows[0].n as number;
        volumes.push({ table, lignes });
        if (lignes === 0 && (TABLES_NON_VIDES as readonly string[]).includes(table)) {
          vides.push(table);
        }
      } catch {
        manquantes.push(table);
        volumes.push({ table, lignes: null });
      }
    }
  } finally {
    await client.end();
  }

  console.table(
    volumes.map(({ table, lignes }) => ({
      table,
      lignes: lignes === null ? "TABLE ABSENTE" : lignes,
    }))
  );

  if (manquantes.length > 0) {
    console.error(
      `\nEchec : ${manquantes.length} table(s) absente(s) — ${manquantes.join(", ")}.\n` +
        "La restauration est incomplete, ou le dump provient d'un autre schema."
    );
    process.exit(1);
  }

  if (vides.length > 0) {
    console.error(
      `\nEchec : ${vides.join(", ")} ne contient aucune ligne.\n` +
        "Le schema est la mais les donnees ne le sont pas — c'est une migration\n" +
        "a blanc, pas une restauration."
    );
    process.exit(1);
  }

  const total = volumes.reduce((s, v) => s + (v.lignes ?? 0), 0);
  console.log(
    `\nBase exploitable : ${TABLES_ATTENDUES.length} tables presentes, ${total} lignes au total.\n` +
      "Il reste a demarrer l'application contre cette base et a se connecter avec\n" +
      "un compte reel — ce script prouve la structure et le volume, pas le vecu."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
