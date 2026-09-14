/**
 * Refus des requêtes venues d'une autre origine (constat SRV-09 de l'audit de
 * sécurité du 2026-09-12).
 *
 * Le cookie de session SameSite=Lax protège déjà contre un site tiers : le
 * navigateur ne l'envoie pas sur une requête POST venue d'ailleurs. Mais
 * SameSite raisonne par *site*, pas par origine : un sous-domaine de
 * laforgeducode.fr compte comme le même site. Le jour où le bac à sable
 * d'exécution passera sur un sous-domaine (constat EXE-03), le code des
 * apprenants pourrait envoyer des requêtes authentifiées aux API.
 *
 * L'en-tête Origin, posé par le navigateur et impossible à modifier depuis une
 * page, dit d'où vient la requête. On le compare à l'hôte de la requête, comme
 * Next le fait pour ses server actions (`x-forwarded-host`, puis `host`) :
 * `req.url` peut différer de l'adresse publique derrière un proxy.
 *
 * Sans Origin, on se rabat sur Sec-Fetch-Site. Sans l'un ni l'autre (client
 * hors navigateur, comme curl), aucune CSRF n'est possible : la requête passe,
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
