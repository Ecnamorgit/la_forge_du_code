/**
 * Garde d'environnement de la suite e2e.
 *
 * `e2e/global-setup.ts` fait un `DELETE FROM "User"` puis un `INSERT` contre
 * `process.env.DATABASE_URL`. Or le `.env` de ce dépôt pointe sur la base
 * Supabase du site EN PRODUCTION (docs/DEPLOYMENT.md) : sans garde, un simple
 * `pnpm test:e2e` écrit en production.
 *
 * La politique est volontairement fermée par défaut : on n'accepte que ce dont
 * on est sûr. Refuser une base de test légitime coûte une variable
 * d'environnement à corriger ; laisser passer une base de production coûte des
 * comptes réels.
 *
 * Ce module est pur (aucun accès réseau, aucun accès disque) et testé sous
 * vitest — un garde-fou non testé n'est qu'une intention.
 */

/** Hôtes considérés comme locaux : la machine du développeur ou le service CI. */
const HOTES_LOCAUX = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

/**
 * Fragments d'hôte d'hébergeurs gérés. Refusés SANS EXCEPTION, y compris avec
 * l'échappatoire ci-dessous : aucune base de test ne devrait vivre là, et
 * c'est exactement la forme qu'a l'URL de production de ce projet.
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
 * @param raw   la valeur de DATABASE_URL
 * @param env   l'environnement, pour l'échappatoire (injecté : fonction pure)
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
    // Illisible = indécidable = refusée. On ne devine pas sur une URL qui sert
    // à effacer des lignes.
    throw new UnsafeE2eDatabaseError(
      `DATABASE_URL n'est pas une URL analysable.\n\n${aide(raw)}`
    );
  }

  if (!/^postgres(ql)?:$/.test(url.protocol)) {
    throw new UnsafeE2eDatabaseError(
      `Protocole inattendu (${url.protocol}).\n\n${aide(raw)}`
    );
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
