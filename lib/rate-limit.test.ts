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
  it("takes the last XFF entry (added by the trusted proxy) by default", () => {
    // The client prepended a forged IP; the proxy appended the real one on the right.
    delete process.env.TRUSTED_PROXY_HOPS;
    const ip = getClientIp(reqWith({ "x-forwarded-for": "1.2.3.4, 203.0.113.7" }));
    expect(ip).toBe("203.0.113.7");
  });

  it("ignores a spoofed IP at the start of the chain", () => {
    delete process.env.TRUSTED_PROXY_HOPS;
    const spoofed = getClientIp(reqWith({ "x-forwarded-for": "9.9.9.9" }));
    // A single entry: it is the one added by the proxy, so it is legitimate.
    expect(spoofed).toBe("9.9.9.9");
    // But prepending does not change the key if the proxy appends the real IP.
    const withRealHop = getClientIp(
      reqWith({ "x-forwarded-for": "9.9.9.9, 203.0.113.7" })
    );
    expect(withRealHop).toBe("203.0.113.7");
  });

  it("honors TRUSTED_PROXY_HOPS for several trusted proxies", () => {
    process.env.TRUSTED_PROXY_HOPS = "2";
    const ip = getClientIp(
      reqWith({ "x-forwarded-for": "spoof, 203.0.113.7, 10.0.0.1" })
    );
    // Two trusted proxies on the right: we walk back to the real client IP.
    expect(ip).toBe("203.0.113.7");
  });

  it("clamps the hops to the chain length", () => {
    process.env.TRUSTED_PROXY_HOPS = "5";
    const ip = getClientIp(reqWith({ "x-forwarded-for": "203.0.113.7" }));
    expect(ip).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip then 'unknown'", () => {
    delete process.env.TRUSTED_PROXY_HOPS;
    expect(getClientIp(reqWith({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
    expect(getClientIp(reqWith({}))).toBe("unknown");
  });

  it("ignores an XFF value that is empty or made of commas", () => {
    delete process.env.TRUSTED_PROXY_HOPS;
    expect(getClientIp(reqWith({ "x-forwarded-for": "  , ,", "x-real-ip": "203.0.113.9" }))).toBe(
      "203.0.113.9"
    );
  });
});
