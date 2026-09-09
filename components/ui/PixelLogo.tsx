"use client";

import { useEffect, useRef } from "react";

/**
 * Pixel-art brand logo — Coalition Nebula fleet crest, fake-3D edition.
 *
 * True 2D pixel art (hand-drawn bitmaps, nearest-neighbour scaling, no AA —
 * per docs/PIXEL_ART_GUIDE.md) composed into a pseudo-3D scene:
 *
 *  - the crest slowly spins on its vertical axis like a coin: the face is
 *    squashed by cos(θ), a gold rim shows the thickness while turning, and
 *    both faces carry the motif (two-sided medal, back slightly dimmed),
 *  - a space chase orbits the crest on a tilted elliptical path: an alien
 *    saucer flees, pursued by a human fighter that fires laser bolts at it;
 *    both are occluded by the crest when passing behind (drawn darker),
 *  - with the `fx` prop (main menu only), missed bolts escape the logo and
 *    streak across the whole screen on a fixed overlay canvas,
 *  - the orange star twinkles on a 4-frame cycle.
 *
 * Everything renders on a tiny offscreen scene (SCENE² art pixels) then
 * upscales without smoothing, so the animation stays on one chunky pixel
 * grid, stepped at ~15 fps for a hand-animated feel. Fully static under
 * prefers-reduced-motion (no chase, no bolts, no overlay).
 */

const PALETTE: Record<string, string> = {
  K: "#03060d", // outline
  F: "#ffc844", // gold light (light source top-right)
  G: "#d9942b", // gold mid
  g: "#8a5416", // gold shadow
  n: "#1a2744", // field light
  N: "#0a1628", // field base
  s: "#050a14", // field shadow
  O: "#ff6b2c", // star orange
  o: "#6b2d13", // star shadow
  W: "#ffd964", // star core
  C: "#00f0ff", // code cyan
  c: "#00a8b8", // code cyan deep
  H: "#c8d6e5", // human hull
  h: "#6b7d99", // human hull shadow
  E: "#ff6b2c", // engine glow
  v: "#7dffb8", // alien dome light
  V: "#00b35f", // alien hull
  u: "#006b39", // alien hull shadow
  M: "#ff2d55", // alien lights
};

/** 24×26 crest bitmap — 1 char = 1 pixel, `.` = transparent. */
const CREST: string[] = [
  "..KKKKKKKKKKKKKKKKKKKK..",
  ".KFFFFFFFFFFFFFFFFFFFFK.",
  "KGFFFFFFFFFFFFFFFFFFFFFK",
  "KGGnnnnnnnnnnOOnnnnnnFFK",
  "KGGnnnnnnnnOWWOnnnnnnFFK",
  "KGGNNNNNNOOWWWWOONNNNFFK",
  "KGGNNNNNNNNOWWONNNNNNFFK",
  "KGGNNNNNNNNNOONNNNNNNFFK",
  "KGGNNNNNNNNNNNNNNNNNNFFK",
  "KGGNNNNNNNNNNNNNNNNNNFFK",
  "KGGNNNNCCNNNCCNCCNNNNFFK",
  "KGGNNNCCNNNNCNNNCCNNNFFK",
  "KGGNNCCNNNNCCNNNNCCNNFFK",
  "KGGNCCNNNNNCNNNNNNCCNFFK",
  "KGGNNCCNNNCCNNNNNCCNNFFK",
  ".KGGNNCCNNCNNNNNCCNNFFK.",
  "..KGGNNCCNNNNNNCCNNFFK..",
  "...KGGNNNNNNNNNNNNFFK...",
  "....KGGNNNNNNNNNNFFK....",
  ".....KGGsNNNNNNsFFK.....",
  "......KGGsssssssFK......",
  ".......KGGssssFFK.......",
  "........KGGssFFK........",
  ".........KGGFFK.........",
  "..........KGFK..........",
  "...........KK...........",
];

/** 13×7 human fighter, nose pointing right. Mirrored at draw time. */
const HUMAN_SHIP: string[] = [
  "....H........",
  "....HH.......",
  ".EHhHHHHHh...",
  "EEHHHCCHHHHO.",
  ".EHhHHHHHh...",
  "....HH.......",
  "....H........",
];

/** 13×6 alien saucer — symmetric, no mirroring needed. */
const ALIEN_SHIP: string[] = [
  "....vvvvv....",
  "..vVVVVVVVv..",
  ".VVVVVVVVVVV.",
  "uMuuMuuMuuMuu",
  ".uVVVVVVVVVu.",
  "...uu...uu...",
];

const CREST_W = CREST[0].length;
const CREST_H = CREST.length;
const SHIP_W = HUMAN_SHIP[0].length;
const SHIP_H = HUMAN_SHIP.length;
const ALIEN_W = ALIEN_SHIP[0].length;
const ALIEN_H = ALIEN_SHIP.length;

/** Scene size in art pixels — crest centred, room for the chase orbit. */
const SCENE = 44;
const CX = SCENE / 2;
const CY = SCENE / 2;

/** Orbit (art px) — wide ellipse, slightly tilted downward at the front. */
const ORBIT_RX = 15;
const ORBIT_RY = 6;
const ORBIT_Y_OFFSET = 1;

/**
 * Crest spin: showcase rhythm — hold the face readable, then a slow smooth
 * half-turn (both faces carry the same motif).
 */
const SPIN_PERIOD = 7; // s per half-turn cycle
const SPIN_HOLD = 4.4; // s spent facing the viewer each cycle

/** Chase ≈ 7 s/orbit; the human fighter trails the saucer. */
const SHIP_OMEGA = (2 * Math.PI) / 7;
const CHASE_GAP = 1.55; // rad between hunter and prey

const TWINKLE_MS = 420;
const TICK_MS = 66; // ~15 fps, chunky hand-animated feel

/** Laser bolts (scene space, art px). */
const BOLT_SPEED = 42; // art px/s
const BURST_EVERY = 1.7; // s between two-shot bursts
const SCREEN_BOLT_SPEED = 1100; // css px/s once escaped
const MAX_SCREEN_BOLTS = 3;

/**
 * Twinkle cycle — per frame, [row, col, colorKey] overrides applied on top
 * of the base crest. Frame 0 = base crest untouched.
 */
const TWINKLE_FRAMES: Array<Array<[number, number, string]>> = [
  [],
  // Star heats up: side rays appear.
  [
    [5, 8, "O"],
    [5, 17, "O"],
  ],
  // Full flash: golden tips, longer rays, hot core.
  [
    [5, 7, "O"],
    [5, 8, "O"],
    [5, 17, "O"],
    [5, 18, "O"],
    [3, 12, "W"],
    [3, 13, "W"],
    [7, 12, "W"],
    [7, 13, "W"],
    [5, 10, "W"],
    [5, 15, "W"],
  ],
  // Cooling down.
  [
    [5, 8, "O"],
    [5, 17, "O"],
  ],
];

/** Multiplies a #rrggbb colour by `f` (0..1) — used for back/far shading. */
function shade(hex: string, f: number): string {
  const val = parseInt(hex.slice(1), 16);
  const r = Math.round(((val >> 16) & 0xff) * f);
  const g = Math.round(((val >> 8) & 0xff) * f);
  const b = Math.round((val & 0xff) * f);
  return `rgb(${r},${g},${b})`;
}

/** Rasterises a char bitmap onto a fresh 1:1 canvas. */
function rasterise(
  bitmap: string[],
  overrides: Array<[number, number, string]> = [],
  brightness = 1,
  remap?: (key: string) => string
): HTMLCanvasElement {
  const rows = bitmap.length;
  const cols = bitmap[0].length;
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d")!;
  const over = new Map<number, string>();
  for (const [r, c, key] of overrides) over.set(r * cols + c, key);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let key = over.get(r * cols + c) ?? bitmap[r][c];
      if (remap) key = remap(key);
      const color = PALETTE[key];
      if (!color) continue;
      ctx.fillStyle = brightness === 1 ? color : shade(color, brightness);
      ctx.fillRect(c, r, 1, 1);
    }
  }
  return canvas;
}

type Sprites = {
  crestFront: HTMLCanvasElement[];
  crestBack: HTMLCanvasElement[];
  crestRim: HTMLCanvasElement;
  human: HTMLCanvasElement;
  humanFar: HTMLCanvasElement;
  alien: HTMLCanvasElement;
  alienFar: HTMLCanvasElement;
};

function buildSprites(): Sprites {
  return {
    crestFront: TWINKLE_FRAMES.map((f) => rasterise(CREST, f)),
    // Same motif on both faces (two-sided medal); the back is only dimmed.
    crestBack: TWINKLE_FRAMES.map((f) => rasterise(CREST, f, 0.85)),
    // Rim = crest silhouette in gold, shown as the coin's thickness.
    crestRim: rasterise(CREST, [], 1, (key) =>
      key === "." ? "." : key === "K" ? "K" : "G"
    ),
    human: rasterise(HUMAN_SHIP),
    humanFar: rasterise(HUMAN_SHIP, [], 0.55),
    alien: rasterise(ALIEN_SHIP),
    alienFar: rasterise(ALIEN_SHIP, [], 0.55),
  };
}

/** A laser bolt living in scene space. */
type Bolt = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Drawn in front of / behind the crest (decided at spawn). */
  front: boolean;
  /** Whether this bolt was aimed to miss and may escape the scene. */
  miss: boolean;
};

/** A bolt streaking across the viewport (css px). */
type ScreenBolt = { x: number; y: number; vx: number; vy: number };

/** Orbital position at angle `a`. */
function orbitPos(a: number) {
  return {
    x: CX + Math.cos(a) * ORBIT_RX,
    y: CY + ORBIT_Y_OFFSET + Math.sin(a) * ORBIT_RY,
    front: Math.sin(a) > 0,
    movingRight: -Math.sin(a) > 0,
  };
}

function drawShipSprite(
  scene: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  flip: boolean
) {
  const px = Math.round(x - w / 2);
  const py = Math.round(y - h / 2);
  scene.save();
  if (flip) {
    scene.translate(px + w, py);
    scene.scale(-1, 1);
    scene.drawImage(sprite, 0, 0);
  } else {
    scene.drawImage(sprite, px, py);
  }
  scene.restore();
}

function drawScene(
  scene: CanvasRenderingContext2D,
  sprites: Sprites,
  t: number,
  bolts: Bolt[]
) {
  scene.imageSmoothingEnabled = false;
  scene.clearRect(0, 0, SCENE, SCENE);

  const twinkle = Math.floor((t * 1000) / TWINKLE_MS) % TWINKLE_FRAMES.length;

  // --- Chase state --------------------------------------------------------
  const alienA = t * SHIP_OMEGA;
  const humanA = alienA - CHASE_GAP;
  const alien = orbitPos(alienA);
  const human = orbitPos(humanA);

  const drawBolts = (front: boolean) => {
    scene.fillStyle = PALETTE.C;
    for (const b of bolts) {
      if (b.front !== front) continue;
      const x = Math.round(b.x);
      const y = Math.round(b.y);
      // 2px bolt head + 1px dimmer tail against the travel direction.
      scene.fillStyle = PALETTE.C;
      scene.fillRect(x, y, Math.abs(b.vx) > Math.abs(b.vy) ? 2 : 1, Math.abs(b.vx) > Math.abs(b.vy) ? 1 : 2);
      scene.fillStyle = PALETTE.c;
      scene.fillRect(
        Math.round(x - Math.sign(b.vx)),
        Math.round(y - Math.sign(b.vy)),
        1,
        1
      );
    }
  };

  const drawShips = (front: boolean) => {
    if (alien.front === front) {
      drawShipSprite(
        scene,
        front ? sprites.alien : sprites.alienFar,
        alien.x,
        alien.y,
        ALIEN_W,
        ALIEN_H,
        !alien.movingRight
      );
    }
    if (human.front === front) {
      drawShipSprite(
        scene,
        front ? sprites.human : sprites.humanFar,
        human.x,
        human.y,
        SHIP_W,
        SHIP_H,
        !human.movingRight
      );
    }
  };

  drawShips(false);
  drawBolts(false);

  // --- Crest, spinning on its vertical axis ------------------------------
  // Hold facing the viewer, then ease through a half-turn (easeInOutCubic).
  const cycle = t % SPIN_PERIOD;
  const halfTurns = Math.floor(t / SPIN_PERIOD);
  let progress = 0;
  if (cycle > SPIN_HOLD) {
    const u = (cycle - SPIN_HOLD) / (SPIN_PERIOD - SPIN_HOLD);
    progress = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  }
  const cos = Math.cos(Math.PI * (halfTurns + progress));
  const facing = Math.abs(cos);
  const crest = cos >= 0 ? sprites.crestFront : sprites.crestBack;

  scene.save();
  scene.translate(CX, CY);
  // Gold rim, slightly wider than the face — the coin's thickness. Only
  // drawn while actually turning so the resting crest stays crisp.
  if (facing < 0.97) {
    const rimScale = facing + 2.5 / CREST_W;
    scene.save();
    scene.scale(rimScale, 1);
    scene.drawImage(sprites.crestRim, -CREST_W / 2, -CREST_H / 2);
    scene.restore();
  }
  if (facing > 0.06) {
    // Unsigned scale: the motif stays readable (never mirrored) on both
    // faces — like a medal struck on both sides.
    scene.scale(facing, 1);
    scene.drawImage(crest[twinkle], -CREST_W / 2, -CREST_H / 2);
  }
  scene.restore();

  drawBolts(true);
  drawShips(true);
}

type PixelLogoProps = {
  /** Logo box size in CSS pixels — the canvas overflows it for the orbit. */
  size: number;
  /** Main-menu extra: missed laser bolts escape and cross the screen. */
  fx?: boolean;
};

export default function PixelLogo({ size, fx = false }: PixelLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const cssSize = size * 1.5;
    const backing = Math.round(cssSize * dpr);
    canvas.width = backing;
    canvas.height = backing;

    const sprites = buildSprites();
    const sceneCanvas = document.createElement("canvas");
    sceneCanvas.width = SCENE;
    sceneCanvas.height = SCENE;
    const sceneCtx = sceneCanvas.getContext("2d")!;

    // --- Screen-crossing bolt overlay (main menu only) --------------------
    const screenCanvas = screenRef.current;
    const screenCtx = screenCanvas?.getContext("2d") ?? null;
    const screenBolts: ScreenBolt[] = [];
    const sizeScreen = () => {
      if (!screenCanvas) return;
      screenCanvas.width = Math.round(window.innerWidth * dpr);
      screenCanvas.height = Math.round(window.innerHeight * dpr);
    };
    sizeScreen();
    if (screenCanvas) window.addEventListener("resize", sizeScreen);

    const bolts: Bolt[] = [];
    let lastBurst = -Infinity;
    let burstShots = 0;
    let nextShotAt = 0;

    const fireBolt = (t: number) => {
      const alien = orbitPos(t * SHIP_OMEGA);
      const human = orbitPos(t * SHIP_OMEGA - CHASE_GAP);
      // Aim at the saucer with pixel-gunner accuracy: some shots go wide
      // (those are the ones that may escape the logo).
      const miss = Math.random() < 0.45;
      const wide = miss ? (Math.random() < 0.5 ? -1 : 1) * (2.5 + Math.random() * 2) : 0;
      const dx = alien.x - human.x;
      const dy = alien.y - human.y;
      const len = Math.hypot(dx, dy) || 1;
      // Perpendicular offset for wide shots.
      const px = (-dy / len) * wide;
      const py = (dx / len) * wide;
      const tx = dx + px;
      const ty = dy + py;
      const tlen = Math.hypot(tx, ty) || 1;
      bolts.push({
        x: human.x + (tx / tlen) * 4,
        y: human.y + (ty / tlen) * 2,
        vx: (tx / tlen) * BOLT_SPEED,
        vy: (ty / tlen) * BOLT_SPEED,
        front: human.front,
        miss,
      });
    };

    const stepBolts = (t: number, dt: number) => {
      // Two-shot bursts on a steady rhythm.
      if (t - lastBurst >= BURST_EVERY) {
        lastBurst = t;
        burstShots = 2;
        nextShotAt = t;
      }
      if (burstShots > 0 && t >= nextShotAt) {
        fireBolt(t);
        burstShots--;
        nextShotAt = t + 0.14;
      }

      const alien = orbitPos(t * SHIP_OMEGA);
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        // Direct hit on the saucer: bolt is absorbed.
        if (!b.miss && Math.hypot(b.x - alien.x, b.y - alien.y) < 3) {
          bolts.splice(i, 1);
          continue;
        }
        const out =
          b.x < -2 || b.x > SCENE + 2 || b.y < -2 || b.y > SCENE + 2;
        if (!out) continue;
        bolts.splice(i, 1);
        // Missed shots escape the logo and cross the whole screen.
        if (
          screenCtx &&
          b.miss &&
          screenBolts.length < MAX_SCREEN_BOLTS
        ) {
          const rect = canvas.getBoundingClientRect();
          const artScale = rect.width / SCENE;
          const vlen = Math.hypot(b.vx, b.vy) || 1;
          screenBolts.push({
            x: rect.left + b.x * artScale,
            y: rect.top + b.y * artScale,
            vx: (b.vx / vlen) * SCREEN_BOLT_SPEED,
            vy: (b.vy / vlen) * SCREEN_BOLT_SPEED,
          });
        }
      }
    };

    const drawScreenBolts = (dt: number) => {
      if (!screenCtx || !screenCanvas) return;
      screenCtx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
      if (screenBolts.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const artScale = Math.max(2, rect.width / SCENE);
      for (let i = screenBolts.length - 1; i >= 0; i--) {
        const b = screenBolts[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const margin = 80;
        if (
          b.x < -margin ||
          b.x > window.innerWidth + margin ||
          b.y < -margin ||
          b.y > window.innerHeight + margin
        ) {
          screenBolts.splice(i, 1);
          continue;
        }
        screenCtx.save();
        screenCtx.scale(dpr, dpr);
        screenCtx.translate(b.x, b.y);
        screenCtx.rotate(Math.atan2(b.vy, b.vx));
        screenCtx.imageSmoothingEnabled = false;
        // Chunky bolt: bright core + dimmer tail, in art-pixel units.
        screenCtx.fillStyle = PALETTE.C;
        screenCtx.fillRect(0, -artScale / 2, artScale * 3, artScale);
        screenCtx.fillStyle = PALETTE.c;
        screenCtx.fillRect(-artScale * 2, -artScale / 2, artScale * 2, artScale);
        screenCtx.restore();
      }
    };

    const render = (t: number, dt: number) => {
      stepBolts(t, dt);
      drawScene(sceneCtx, sprites, t, bolts);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, backing, backing);
      ctx.drawImage(sceneCanvas, 0, 0, backing, backing);
      drawScreenBolts(dt);
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) {
      // Static pose: crest facing forward, both ships visible.
      drawScene(sceneCtx, sprites, Math.PI / (2 * SHIP_OMEGA), []);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sceneCanvas, 0, 0, backing, backing);
      if (screenCanvas) window.removeEventListener("resize", sizeScreen);
      return;
    }

    const start = performance.now();
    let prev = 0;
    const interval = window.setInterval(() => {
      const t = (performance.now() - start) / 1000;
      render(t, Math.min(t - prev, 0.2));
      prev = t;
    }, TICK_MS);
    render(0, 0);

    return () => {
      window.clearInterval(interval);
      if (screenCanvas) window.removeEventListener("resize", sizeScreen);
    };
  }, [size, fx]);

  const glow = Math.max(4, Math.round(size / 14));
  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 1.5,
          height: size * 1.5,
          imageRendering: "pixelated",
          filter: `drop-shadow(0 0 ${glow}px rgba(0,240,255,0.28))`,
        }}
      />
      {fx && (
        <canvas
          ref={screenRef}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 40,
            imageRendering: "pixelated",
          }}
        />
      )}
    </>
  );
}
