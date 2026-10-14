"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import PixelImage from "./PixelImage";

// The animation (about 12 KB gzipped, plus a 15 frames/s timer) stays out of
// the initial bundle: it is fetched once the page is idle.
const PixelLogo = dynamic(() => import("./PixelLogo"), { ssr: false });

/** Fleet crest in its still pose: same pixels as the first animated frame. */
const STILL_CREST = "/brand/fleet-crest.png";

function whenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 1500);
  return () => window.clearTimeout(id);
}

/**
 * Renders the still crest from the server HTML, then swaps in the animated
 * `PixelLogo` once the browser is idle. Under prefers-reduced-motion the
 * animation would only show this same still frame, so it is never loaded.
 */
export default function LazyPixelLogo({ size, fx = false }: { size: number; fx?: boolean }) {
  const [animate, setAnimate] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelIdle = () => {};
    const start = () => {
      cancelIdle = whenIdle(() => setAnimate(true));
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      cancelIdle();
    };
  }, []);

  const box = size * 1.5;
  const glow = Math.max(4, Math.round(size / 14));
  return (
    <>
      {!animationReady && (
        <PixelImage
          src={STILL_CREST}
          alt="Blason de la flotte Coalition Nebula, logo de La Forge du Code"
          width={box}
          height={box}
          eager
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "none",
            width: box,
            height: box,
            filter: `drop-shadow(0 0 ${glow}px rgba(0,240,255,0.28))`,
          }}
        />
      )}
      {animate && (
        <PixelLogo size={size} fx={fx} fromStillPose onReady={() => setAnimationReady(true)} />
      )}
    </>
  );
}
