/**
 * Logger structuré minimal, sans dépendance (edge + node).
 *
 * - En production : une ligne JSON par évènement (parsable par un agrégateur).
 * - En développement : format lisible.
 *
 * ⚠️ Ne jamais passer de données sensibles (mot de passe, token brut, secret,
 * PII inutile) dans `meta` — c'est la responsabilité de l'appelant.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMeta = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";

function emit(level: LogLevel, message: string, meta?: LogMeta): void {
  const entry = { level, message, time: new Date().toISOString(), ...meta };
  const line = isProd
    ? JSON.stringify(entry)
    : `[${level.toUpperCase()}] ${message}${meta ? ` ${JSON.stringify(meta)}` : ""}`;

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => {
    if (!isProd) emit("debug", message, meta);
  },
  info: (message: string, meta?: LogMeta) => emit("info", message, meta),
  warn: (message: string, meta?: LogMeta) => emit("warn", message, meta),
  error: (message: string, meta?: LogMeta) => emit("error", message, meta),
};
