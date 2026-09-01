import { afterEach, describe, expect, it } from "vitest";

import { getClientIp } from "./rate-limit";

function reqWith(headers: Record<string, string>): Request {
  return new Request("https://example.com", { headers });
}

const ORIGINAL_HOPS = process.env.TRUSTED_PROXY_HOPS;

afterEach(() => {
  if (ORIGINAL_HOPS === undefined) delete process.env.TRUSTED_PROXY_HOPS;
  else process.env.TRUSTED_PROXY_HOPS = ORIGINAL_HOPS;
});

describe("getClientIp", () => {
  it("prend la dernière entrée XFF (ajoutée par le proxy de confiance) par défaut", () => {
    // Le client a préfixé une IP falsifiée ; le proxy a ajouté la vraie à droite.
    delete process.env.TRUSTED_PROXY_HOPS;
    const ip = getClientIp(reqWith({ "x-forwarded-for": "1.2.3.4, 203.0.113.7" }));
    expect(ip).toBe("203.0.113.7");
  });

  it("ignore une IP spoofée en tête de chaîne", () => {
    delete process.env.TRUSTED_PROXY_HOPS;
    const spoofed = getClientIp(reqWith({ "x-forwarded-for": "9.9.9.9" }));
    // Une seule entrée : c'est celle ajoutée par le proxy, donc légitime.
    expect(spoofed).toBe("9.9.9.9");
    // Mais préfixer ne change pas la clé si le proxy ajoute la vraie IP.
    const withRealHop = getClientIp(
      reqWith({ "x-forwarded-for": "9.9.9.9, 203.0.113.7" })
    );
    expect(withRealHop).toBe("203.0.113.7");
  });

  it("respecte TRUSTED_PROXY_HOPS pour plusieurs proxys de confiance", () => {
    process.env.TRUSTED_PROXY_HOPS = "2";
    const ip = getClientIp(
      reqWith({ "x-forwarded-for": "spoof, 203.0.113.7, 10.0.0.1" })
    );
    // 2 hops de confiance à droite → on remonte à l'IP client réelle.
    expect(ip).toBe("203.0.113.7");
  });

  it("borne les hops à la longueur de la chaîne", () => {
    process.env.TRUSTED_PROXY_HOPS = "5";
    const ip = getClientIp(reqWith({ "x-forwarded-for": "203.0.113.7" }));
    expect(ip).toBe("203.0.113.7");
  });

  it("retombe sur x-real-ip puis 'unknown'", () => {
    delete process.env.TRUSTED_PROXY_HOPS;
    expect(getClientIp(reqWith({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
    expect(getClientIp(reqWith({}))).toBe("unknown");
  });

  it("ignore une valeur XFF vide ou composée de virgules", () => {
    delete process.env.TRUSTED_PROXY_HOPS;
    expect(getClientIp(reqWith({ "x-forwarded-for": "  , ,", "x-real-ip": "203.0.113.9" }))).toBe(
      "203.0.113.9"
    );
  });
});
