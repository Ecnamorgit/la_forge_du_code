"use client";

import { useEffect } from "react";

export default function TrackLandingView() {
  useEffect(() => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "landing_vue" }),
      keepalive: true,
    }).catch(() => {
      /* counting must never break the page */
    });
  }, []);

  return null;
}
