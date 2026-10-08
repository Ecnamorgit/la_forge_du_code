/**
 * Refus des requêtes venues d'une autre origine (audit SRV-09).
 *
 * Le cookie de session SameSite=Lax n'est pas envoyé sur un POST venu d'un
 * site tiers, mais SameSite raisonne par site et non par origine : le bac à
 * sable, servi depuis un sous-domaine (audit EXE-03), pourrait sinon envoyer
 * des requêtes authentifiées aux API.
 *
 * L'en-tête Origin, posé par le navigateur, est comparé à l'hôte de la requête
 * comme le fait Next pour ses server actions (`x-forwarded-host`, puis `host`) :
 * derrière un proxy, `req.url` peut différer de l'adresse publique. Sans
 * Origin, on se rabat sur Sec-Fetch-Site. Sans l'un ni l'autre (client hors
 * navigateur comme curl), aucune CSRF n'est possible : la requête passe et
 * l'authentification fait le reste.
 */
export function isCrossOriginRequest(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    try {
      return new URL(origin).host !== host;
    } catch {
      // Origin « null » : iframe sandboxée ou document opaque, jamais légitime ici.
      return true;
    }
  }
  const site = req.headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}

/** Réponse 403 si la requête vient d'une autre origine, sinon `null`. */
export function crossOriginRefusal(req: Request): Response | null {
  return isCrossOriginRequest(req)
    ? Response.json({ error: "Origine de la requête non autorisée" }, { status: 403 })
    : null;
}
