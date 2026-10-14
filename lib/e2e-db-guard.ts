/**
 * Environment guard for the e2e suite.
 *
 * `e2e/global-setup.ts` runs a `DELETE FROM "User"` then an `INSERT` against
 * `process.env.DATABASE_URL`, while the repo's `.env` points to the production
 * Supabase database (docs/DEPLOYMENT.md). The policy is therefore deny by
 * default: we only accept what we are sure about.
 *
 * Pure module (no network, no disk), tested under vitest.
 */

/** Hosts considered local: the developer's machine or the CI service. */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

/**
 * Host fragments of managed providers, rejected even with the override
 * variable: this project's production URL has that shape.
 */
const FORBIDDEN_HOSTS = [
  "supabase",
  "neon.tech",
  "rds.amazonaws.com",
  "render.com",
  "railway",
  "planetscale",
  "cockroachlabs",
  "digitalocean",
  "azure",
  "heroku",
  "aiven",
  "timescale",
];

/** Override variable, for a test database that really is remote. */
export const DB_OVERRIDE_VARIABLE = "E2E_ALLOW_NON_LOCAL_DB";

/** Markers accepted in the database name when the host is not local. */
const TEST_MARKERS = ["test", "e2e"];

export class UnsafeE2eDatabaseError extends Error {}

function help(url: string): string {
  return [
    `Base refusée par la garde e2e : ${url}`,
    "",
    "La suite e2e SUPPRIME puis recrée des lignes de la table User. Elle ne",
    "doit jamais tourner contre la base de production (le .env de ce dépôt y",
    "pointe : docs/DEPLOYMENT.md).",
    "",
    "Pour lancer la suite :",
    "  1. démarre un PostgreSQL local, p. ex.",
    "     docker run --rm -e POSTGRES_PASSWORD=test -p 5432:5432 postgres:16",
    "  2. pointe DATABASE_URL (et DIRECT_URL) dessus, p. ex. dans .env.test.local :",
    "     DATABASE_URL=postgresql://postgres:test@localhost:5432/codeforge_test",
    "  3. applique le schéma :  pnpm prisma migrate deploy",
    "  4. relance :             pnpm test:e2e",
    "",
    `Base de test réellement distante ? Nomme-la avec « test » ou « e2e » et pose ${DB_OVERRIDE_VARIABLE}=1.`,
    "Les hébergeurs gérés (Supabase, Neon, RDS…) restent refusés dans tous les cas.",
  ].join("\n");
}

function hostOf(u: URL): string {
  // `new URL` returns "[::1]" for an IPv6 address: strip the brackets
  // to compare against the list above.
  return u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

/** Database name, without the leading "/" or the parameters. */
function databaseName(u: URL): string {
  return decodeURIComponent(u.pathname.replace(/^\//, "")).toLowerCase();
}

/**
 * Throws unless `raw` clearly designates a test database.
 *
 * @param raw value of DATABASE_URL
 * @param env environment, for the override (injected: pure function)
 */
export function assertTestDatabaseUrl(
  raw: string | undefined,
  env: Record<string, string | undefined> = process.env
): asserts raw is string {
  if (!raw || raw.trim() === "") {
    throw new UnsafeE2eDatabaseError(
      `DATABASE_URL est vide.\n\n${help("(vide)")}`
    );
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    // Unparseable URL: undecidable target, so rejected.
    throw new UnsafeE2eDatabaseError(
      `DATABASE_URL n'est pas une URL analysable.\n\n${help(raw)}`
    );
  }

  if (!/^postgres(ql)?:$/.test(url.protocol)) {
    throw new UnsafeE2eDatabaseError(
      `Protocole inattendu (${url.protocol}).\n\n${help(raw)}`
    );
  }

  // `pg` (pg-connection-string) lets a "host" or "hostaddr" parameter
  // override the URL's host: `localhost:5432/codeforge_test?host=db.xxx.supabase.co`
  // connects elsewhere. Undecidable target, so rejected.
  for (const key of ["host", "hostaddr"]) {
    if (url.searchParams.has(key)) {
      throw new UnsafeE2eDatabaseError(
        `Paramètre « ${key} » dans l'URL : il écrase l'hôte et rend la cible réelle indécidable.\n\n${help(raw)}`
      );
    }
  }

  const h = hostOf(url);
  const base = databaseName(url);

  if (base === "") {
    throw new UnsafeE2eDatabaseError(
      `DATABASE_URL ne nomme aucune base de données.\n\n${help(raw)}`
    );
  }

  const forbidden = FORBIDDEN_HOSTS.find((f) => h.includes(f));
  if (forbidden) {
    throw new UnsafeE2eDatabaseError(
      `Hôte d'hébergeur géré (« ${forbidden} ») : c'est la forme de la base de production.\n\n${help(raw)}`
    );
  }

  if (LOCAL_HOSTS.has(h)) return;

  const hasTestMarker = TEST_MARKERS.some((m) => base.includes(m));
  if (env[DB_OVERRIDE_VARIABLE] === "1" && hasTestMarker) return;

  throw new UnsafeE2eDatabaseError(
    `Hôte non local (« ${h} ») et base « ${base} ».\n\n${help(raw)}`
  );
}

// Application under test

/**
 * Override variable to test an application that really is remote.
 * Separate from the database one: these are two different risks.
 */
export const APP_OVERRIDE_VARIABLE = "E2E_ALLOW_REMOTE_APP";

export class UnsafeE2eTargetError extends Error {}

function appHelp(url: string): string {
  return [
    `Application testée refusée par la garde e2e : ${url}`,
    "",
    "`assertTestDatabaseUrl` protège la base que la suite ensemence, mais la",
    "suite écrit surtout par l'APPLICATION : valider une étape crée des lignes,",
    "porter un cosmétique modifie le compte. Or c'est l'application qui choisit",
    "sa base, pas nous.",
    "",
    "Une application distante parle donc à une base que nous n'avons pas",
    "ensemencée — et qui peut être la production. Le compte de test n'y existe",
    "pas : la suite échouerait de toute façon, mais après avoir écrit.",
    "",
    "Laisse E2E_BASE_URL vide pour que Playwright démarre lui-même",
    "l'application (webServer), sur la base que la garde a validée.",
    "",
    `Cible distante volontaire ? Pose ${APP_OVERRIDE_VARIABLE}=1.`,
  ].join("\n");
}

/**
 * Throws if the application targeted by the suite is not local. Complements
 * `assertTestDatabaseUrl`, which only sees the database seeded by
 * `global-setup`, not the one the application talks to. A local server
 * already running and reused via `reuseExistingServer` is not detected.
 *
 * @param raw targeted base URL; empty or missing for the local application
 *            started by Playwright
 * @param env environment, for the override (injected: pure function)
 */
export function assertLocalAppUnderTest(
  raw: string | undefined,
  env: Record<string, string | undefined> = process.env
): void {
  if (!raw || raw.trim() === "") return;
  if (env[APP_OVERRIDE_VARIABLE] === "1") return;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeE2eTargetError(
      `E2E_BASE_URL n'est pas une URL analysable.\n\n${appHelp(raw)}`
    );
  }

  const h = hostOf(url);
  // `*.localhost` resolves to loopback and is used for multi-tenant in dev.
  if (LOCAL_HOSTS.has(h) || h.endsWith(".localhost")) return;

  throw new UnsafeE2eTargetError(
    `Application distante (« ${h} ») : sa base n'est pas celle qui vient d'être ensemencée.\n\n${appHelp(raw)}`
  );
}
