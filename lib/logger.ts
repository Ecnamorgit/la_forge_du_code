/**
 * Logger structuré minimal (edge et node) : une ligne JSON par évènement en
 * production, un format lisible en développement.
 *
 * L'appelant ne doit jamais passer de données sensibles (mot de passe, jeton
 * brut, secret, données personnelles inutiles) dans `meta`.
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
