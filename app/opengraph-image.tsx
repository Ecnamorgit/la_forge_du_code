import { ImageResponse } from "next/og";

export const alt = "CodeForge — Nebula Command";
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
          color: "#00f0ff",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: 6 }}>
          NEBULA COMMAND
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            color: "#9fb3c8",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Apprends à coder dans un univers spatial gamifié
        </div>
        <div style={{ marginTop: 44, fontSize: 24, color: "#ff6b2c", letterSpacing: 8 }}>
          HTML · CSS · JAVASCRIPT · REACT
        </div>
      </div>
    ),
    size
  );
}
