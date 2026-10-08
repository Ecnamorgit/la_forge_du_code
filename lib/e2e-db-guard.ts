/**
 * Garde d'environnement de la suite e2e.
 *
 * `e2e/global-setup.ts` fait un `DELETE FROM "User"` puis un `INSERT` sur
 * `process.env.DATABASE_URL`, alors que le `.env` du dépôt pointe sur la base
 * Supabase de production (docs/DEPLOYMENT.md). La politique est donc fermée
 * par défaut : on n'accepte que ce dont on est sûr.
 *
 * Module pur (ni réseau ni disque), testé sous vitest.
 */

/** Hôtes considérés comme locaux : la machine du développeur ou le service CI. */
const HOTES_LOCAUX = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

/**
 * Fragments d'hôte d'hébergeurs gérés, refusés même avec la variable
 * d'échappement : l'URL de production de ce projet a cette forme.
 */
const HOTES_INTERDITS = [
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

/** Variable d'échappement, pour une base de test réellement distante. */
export const VARIABLE_ECHAPPEMENT = "E2E_ALLOW_NON_LOCAL_DB";

/** Marqueurs acceptés dans le nom de base quand l'hôte n'est pas local. */
const MARQUEURS_DE_TEST = ["test", "e2e"];

export class UnsafeE2eDatabaseError extends Error {}

function aide(url: string): string {
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
    `Base de test réellement distante ? Nomme-la avec « test » ou « e2e » et pose ${VARIABLE_ECHAPPEMENT}=1.`,
    "Les hébergeurs gérés (Supabase, Neon, RDS…) restent refusés dans tous les cas.",
  ].join("\n");
}

function hote(u: URL): string {
  // `new URL` rend « [::1] » pour une adresse IPv6 : on retire les crochets
  // pour comparer à la liste ci-dessus.
  return u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

/** Nom de base, sans le « / » initial ni les paramètres. */
function baseDeDonnees(u: URL): string {
  return decodeURIComponent(u.pathname.replace(/^\//, "")).toLowerCase();
}

/**
 * Lève si `raw` ne désigne pas manifestement une base de test.
 *
 * @param raw valeur de DATABASE_URL
 * @param env environnement, pour l'échappatoire (injecté : fonction pure)
 */
export function assertTestDatabaseUrl(
  raw: string | undefined,
  env: Record<string, string | undefined> = process.env
): asserts raw is string {
  if (!raw || raw.trim() === "") {
    throw new UnsafeE2eDatabaseError(
      `DATABASE_URL est vide.\n\n${aide("(vide)")}`
    );
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    // URL illisible : cible indécidable, donc refusée.
    throw new UnsafeE2eDatabaseError(
      `DATABASE_URL n'est pas une URL analysable.\n\n${aide(raw)}`
    );
  }

  if (!/^postgres(ql)?:$/.test(url.protocol)) {
    throw new UnsafeE2eDatabaseError(
      `Protocole inattendu (${url.protocol}).\n\n${aide(raw)}`
    );
  }

  // `pg` (pg-connection-string) laisse un paramètre « host » ou « hostaddr »
  // écraser l'hôte de l'URL : `localhost:5432/codeforge_test?host=db.xxx.supabase.co`
  // se connecte ailleurs. Cible indécidable, donc refusée.
  for (const cle of ["host", "hostaddr"]) {
    if (url.searchParams.has(cle)) {
      throw new UnsafeE2eDatabaseError(
        `Paramètre « ${cle} » dans l'URL : il écrase l'hôte et rend la cible réelle indécidable.\n\n${aide(raw)}`
      );
    }
  }

  const h = hote(url);
  const base = baseDeDonnees(url);

  if (base === "") {
    throw new UnsafeE2eDatabaseError(
      `DATABASE_URL ne nomme aucune base de données.\n\n${aide(raw)}`
    );
  }

  const interdit = HOTES_INTERDITS.find((f) => h.includes(f));
  if (interdit) {
    throw new UnsafeE2eDatabaseError(
      `Hôte d'hébergeur géré (« ${interdit} ») : c'est la forme de la base de production.\n\n${aide(raw)}`
    );
  }

  if (HOTES_LOCAUX.has(h)) return;

  const marque = MARQUEURS_DE_TEST.some((m) => base.includes(m));
  if (env[VARIABLE_ECHAPPEMENT] === "1" && marque) return;

  throw new UnsafeE2eDatabaseError(
    `Hôte non local (« ${h} ») et base « ${base} ».\n\n${aide(raw)}`
  );
}

// Application testée

/**
 * Variable d'échappement pour tester une application réellement distante.
 * Distincte de celle de la base : ce sont deux risques différents.
 */
export const VARIABLE_ECHAPPEMENT_APP = "E2E_ALLOW_REMOTE_APP";

export class UnsafeE2eTargetError extends Error {}

function aideApp(url: string): string {
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
    `Cible distante volontaire ? Pose ${VARIABLE_ECHAPPEMENT_APP}=1.`,
  ].join("\n");
}

/**
 * Lève si l'application visée par la suite n'est pas locale. Complète
 * `assertTestDatabaseUrl`, qui ne voit que la base ensemencée par
 * `global-setup`, pas celle à laquelle l'application parle. Un serveur local
 * déjà lancé et réutilisé par `reuseExistingServer` n'est pas détecté.
 *
 * @param raw URL de base visée ; vide ou absente pour l'application locale
 *            démarrée par Playwright
 * @param env environnement, pour l'échappatoire (injecté : fonction pure)
 */
export function assertLocalAppUnderTest(
  raw: string | undefined,
  env: Record<string, string | undefined> = process.env
): void {
  if (!raw || raw.trim() === "") return;
  if (env[VARIABLE_ECHAPPEMENT_APP] === "1") return;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeE2eTargetError(
      `E2E_BASE_URL n'est pas une URL analysable.\n\n${aideApp(raw)}`
    );
  }

  const h = hote(url);
  // `*.localhost` résout en boucle locale et sert au multi-tenant en dev.
  if (HOTES_LOCAUX.has(h) || h.endsWith(".localhost")) return;

  throw new UnsafeE2eTargetError(
    `Application distante (« ${h} ») : sa base n'est pas celle qui vient d'être ensemencée.\n\n${aideApp(raw)}`
  );
}
