"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import { hasSeenIntro, markIntroSeen, REPLAY_INTRO_EVENT } from "@/lib/intro";

// The crawl and its modal logic are only downloaded when the intro opens.
const IntroCrawlOverlay = dynamic(() => import("./IntroCrawlOverlay"), { ssr: false });

/**
 * Mounts the crawl on top of the landing page. It is an overlay, not a
 * redirect: the landing page stays rendered underneath for crawlers and
 * link previews. Autoplays only once per browser
 * (`nc_intro_seen` flag); the five animated scenes play on first
 * login, on the dashboard side.
 */
export default function IntroCinematicMount() {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    markIntroSeen();
    setOpen(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read on mount
    if (!hasSeenIntro()) setOpen(true);

    const onReplay = () => setOpen(true);
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, onReplay);
  }, []);

  return open ? <IntroCrawlOverlay onClose={handleClose} /> : null;
}
