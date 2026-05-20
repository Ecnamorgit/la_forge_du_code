"use client";

import { useRef } from "react";

const COLORS = ["#00F0FF", "#00FF88", "#3D7EFF", "#ffffff", "#00B8D4"];
const SHAPES = ["⚡", "✦", "◆", "▲", "●"];

export default function ParticleLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={layerRef}
      className="fixed inset-0 pointer-events-none z-[201] overflow-hidden"
      id="particles-layer"
    />
  );
}

export function spawnParticles(): void {
  spawnBurst(40);
}

function spawnBurst(count: number): void {
  const layer = document.getElementById("particles-layer");
  if (!layer) return;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "particle";
    el.textContent = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    el.style.cssText = `
      position:absolute;
      left:${30 + Math.random() * 40}%;
      top:${20 + Math.random() * 60}%;
      font-size:${10 + Math.random() * 14}px;
      color:${COLORS[Math.floor(Math.random() * COLORS.length)]};
      --dx:${(Math.random() - 0.5) * 300}px;
      --dy:${-80 - Math.random() * 200}px;
      animation-delay:${Math.random() * 0.3}s;
      animation-duration:${0.9 + Math.random() * 0.4}s;
      opacity:0;
      animation-name:particle-fly;
      animation-fill-mode:forwards;
      width:8px;height:8px;
    `;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

/**
 * Big celebratory burst for level-up moments. Wider spread, more particles,
 * larger shapes that float upward like fireworks.
 */
export function spawnLevelUpBurst(): void {
  const layer = document.getElementById("particles-layer");
  if (!layer) return;

  const SHAPES_BIG = ["⚡", "★", "✦", "✧", "◆", "✨"];
  for (let i = 0; i < 90; i++) {
    const el = document.createElement("div");
    el.textContent = SHAPES_BIG[Math.floor(Math.random() * SHAPES_BIG.length)];
    el.style.cssText = `
      position:absolute;
      left:${10 + Math.random() * 80}%;
      top:${30 + Math.random() * 50}%;
      font-size:${14 + Math.random() * 22}px;
      color:${COLORS[Math.floor(Math.random() * COLORS.length)]};
      text-shadow:0 0 12px currentColor;
      --dx:${(Math.random() - 0.5) * 600}px;
      --dy:${-120 - Math.random() * 320}px;
      animation-delay:${Math.random() * 0.4}s;
      animation-duration:${1.1 + Math.random() * 0.6}s;
      opacity:0;
      animation-name:particle-fly;
      animation-fill-mode:forwards;
      width:8px;height:8px;
      pointer-events:none;
    `;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

/** Cyan teleport particles — spawned on real-time tag detection */
export function spawnTeleportParticles() {
  const layer = document.getElementById("particles-layer");
  if (!layer) return;

  for (let i = 0; i < 8; i++) {
    const el = document.createElement("div");
    el.textContent = "✦";
    el.style.cssText = `
      position:absolute;
      right:${10 + Math.random() * 30}%;
      top:${30 + Math.random() * 40}%;
      font-size:${8 + Math.random() * 10}px;
      color:${["#00F0FF", "#00B8D4", "#3D7EFF"][Math.floor(Math.random() * 3)]};
      --dx:${(Math.random() - 0.5) * 150}px;
      --dy:${-40 - Math.random() * 100}px;
      animation: particle-fly ${0.6 + Math.random() * 0.3}s ease forwards;
      animation-delay:${Math.random() * 0.15}s;
      opacity:0;
      width:8px;height:8px;
    `;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}
