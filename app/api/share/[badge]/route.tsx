import { ImageResponse } from "next/og";
import { getBadge } from "@/lib/badges-catalog";
import { sanitizeShareName, parseShareXp } from "@/lib/share";

/**
 * Public OG image for the shareable success card (growth loop). Validates the
 * badge against the catalog and sanitizes query params so the route can't be
 * used as an open text-to-image generator. No personal data beyond a pseudo.
 */

export const dynamic = "force-dynamic";

const SIZE = { width: 1200, height: 630 };

export async function GET(
  req: Request,
  { params }: { params: Promise<{ badge: string }> }
) {
  const { badge } = await params;
  const def = getBadge(badge);
  if (!def) {
    return new Response("Badge inconnu", { status: 404 });
  }

  const url = new URL(req.url);
  const pseudo = sanitizeShareName(url.searchParams.get("u"));
  const xp = parseShareXp(url.searchParams.get("xp"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#03060d",
          color: "#c8d6e5",
          padding: 64,
          fontFamily: "sans-serif",
          border: "6px solid #00f0ff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 30, letterSpacing: 6, color: "#00f0ff" }}>
            NEBULA COMMAND
          </div>
          <div style={{ fontSize: 26, color: "#7c8aa0" }}>{pseudo}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#7c8aa0", marginBottom: 12 }}>
            BADGE DEBLOQUE
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 120, marginRight: 32 }}>{def.icon}</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 64, fontWeight: 700, color: "#00f0ff" }}>
                {def.label}
              </div>
              <div style={{ fontSize: 30, color: "#9fb0c3", marginTop: 8 }}>
                {def.description}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 34, color: "#00ff88" }}>
            {xp > 0 ? `+${xp} XP` : "Mission accomplie"}
          </div>
          <div style={{ fontSize: 26, color: "#7c8aa0" }}>
            Rejoins la flotte
          </div>
        </div>
      </div>
    ),
    SIZE
  );
}
