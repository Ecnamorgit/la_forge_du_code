import { ImageResponse } from "next/og";

export const alt = "Codex — Nebula Command";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#03060d",
          color: "#ff6b2c",
        }}
      >
        <div style={{ fontSize: 30, color: "#00f0ff", letterSpacing: 10 }}>
          ARCHIVES DE LA COALITION
        </div>
        <div style={{ marginTop: 24, fontSize: 92, fontWeight: 700, letterSpacing: 8 }}>
          CODEX
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#9fb3c8" }}>
          La Coalition · Spectre · Le Cadet
        </div>
      </div>
    ),
    size
  );
}
