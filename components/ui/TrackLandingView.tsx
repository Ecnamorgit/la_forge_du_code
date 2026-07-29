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
      /* le comptage ne doit jamais casser la page */
    });
  }, []);

  return null;
}
