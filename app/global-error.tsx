"use client";

/**
 * Frontière d'erreur racine : elle remplace le layout entier, d'où ses propres
 * <html> et <body>.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          background: "#03060d",
          color: "#c8d6e5",
          fontFamily: "'Courier New', monospace",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <div style={{ fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#ff5a5a" }}>
          ◈ Défaillance critique
        </div>
        <h1 style={{ fontSize: "2rem", color: "#00f0ff", margin: 0 }}>
          Le système a redémarré
        </h1>
        <p style={{ maxWidth: "28rem", fontSize: "0.9rem", color: "#6b7d99" }}>
          Une erreur critique a interrompu l&apos;application. Tu peux relancer la
          console.
        </p>
        <button
          onClick={reset}
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "0.85rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            border: "1px solid #00f0ff",
            background: "transparent",
            color: "#00f0ff",
            padding: "0.75rem 1.5rem",
            cursor: "pointer",
          }}
        >
          &gt; Relancer
        </button>
      </body>
    </html>
  );
}
