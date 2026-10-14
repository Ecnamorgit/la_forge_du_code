"use client";

import { useEffect, useRef } from "react";

/**
 * Pixel art logo: the Coalition Nebula fleet crest, in pseudo-3D.
 *
 * Hand-drawn bitmaps upscaled without smoothing (see
 * docs/PIXEL_ART_GUIDE.md). The crest spins on its vertical axis like a
 * coin, with a golden edge visible during the rotation. A human fighter
 * chases an alien saucer on a tilted elliptical orbit, shooting
 * at it; the ships pass behind the crest.
 * With `fx` (main menu), missed shots fly across the whole screen.
 *
 * Everything is rendered into a small offscreen scene (SCENE² art pixels) then
 * upscaled, at about 15 frames/s. Still image under prefers-reduced-motion.
 */

const PALETTE: Record<string, string> = {
  K: "#03060d", // outline
  F: "#ffc844", // light gold (light from the top right)
  G: "#d9942b", // mid gold
  g: "#8a5416", // shaded gold
  n: "#1a2744", // light background
  N: "#0a1628", // background
  s: "#050a14", // shaded background
  O: "#ff6b2c", // orange star
  o: "#6b2d13", // shaded star
  W: "#ffd964", // star core
  C: "#00f0ff", // cyan code
  c: "#00a8b8", // dark cyan code
  H: "#c8d6e5", // human hull
  h: "#6b7d99", // shaded human hull
  E: "#ff6b2c", // engine
  v: "#7dffb8", // light alien dome
  V: "#00b35f", // alien hull
  u: "#006b39", // shaded alien hull
  M: "#ff2d55", // alien lights
};

/** 24×26 crest: one character per pixel, `.` for transparency. */
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

/** 13×7 human fighter, nose to the right, flipped when drawn if needed. */
const HUMAN_SHIP: string[] = [
  "....H........",
  "....HH.......",
  ".EHhHHHHHh...",
  "EEHHHCCHHHHO.",
  ".EHhHHHHHh...",
  "....HH.......",
  "....H........",
];

/** 13×6 alien saucer, symmetrical. */
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

/** Scene size in art pixels: centered crest, room for the orbit. */
const SCENE = 44;
const CX = SCENE / 2;
const CY = SCENE / 2;

/** Orbit (art px): wide ellipse, slightly lowered at the front. */
const ORBIT_RX = 15;
const ORBIT_RY = 6;
const ORBIT_Y_OFFSET = 1;

/** Crest rotation: pause facing the viewer, then a slow half-turn. */
const SPIN_PERIOD = 7; // s per half-turn cycle
const SPIN_HOLD = 4.4; // s facing the viewer in each cycle

/** About 7 s per orbit; the fighter follows the saucer. */
const SHIP_OMEGA = (2 * Math.PI) / 7;
const CHASE_GAP = 1.55; // rad between the fighter and its prey

/**
 * Time (s) of the still pose: crest facing front, both ships visible. It is
 * the prefers-reduced-motion frame, and the one saved as
 * public/brand/fleet-crest.png, shown until the animation has loaded.
 */
const STILL_POSE_TIME = Math.PI / (2 * SHIP_OMEGA);

const TWINKLE_MS = 420;
const TICK_MS = 66; // about 15 frames/s

/** Laser shots (scene space, art px). */
const BOLT_SPEED = 42; // art px/s
const BURST_EVERY = 1.7; // s between two bursts of two shots
const SCREEN_BOLT_SPEED = 1100; // CSS px/s once out of the logo
const MAX_SCREEN_BOLTS = 3;

/**
 * Twinkle: for each frame, [row, column, color] overrides
 * applied to the crest. Frame 0 is the base crest.
 */
const TWINKLE_FRAMES: Array<Array<[number, number, string]>> = [
  [],
  // The star heats up: side rays.
  [
    [5, 8, "O"],
    [5, 17, "O"],
  ],
  // Peak glow: golden tips, longer rays, bright core.
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

/** Multiplies a #rrggbb color by `f` (0..1) to darken the back face and background. */
function shade(hex: string, f: number): string {
  const val = parseInt(hex.slice(1), 16);
  const r = Math.round(((val >> 16) & 0xff) * f);
  const g = Math.round(((val >> 8) & 0xff) * f);
  const b = Math.round((val & 0xff) * f);
  return `rgb(${r},${g},${b})`;
}

/** Draws a character bitmap onto a new canvas, at 1:1 scale. */
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
    // Same pattern on both faces; the back face is only darkened.
    crestBack: TWINKLE_FRAMES.map((f) => rasterise(CREST, f, 0.85)),
    // Edge: gold silhouette of the crest, standing for the coin's thickness.
    crestRim: rasterise(CREST, [], 1, (key) =>
      key === "." ? "." : key === "K" ? "K" : "G"
    ),
    human: rasterise(HUMAN_SHIP),
    humanFar: rasterise(HUMAN_SHIP, [], 0.55),
    alien: rasterise(ALIEN_SHIP),
    alienFar: rasterise(ALIEN_SHIP, [], 0.55),
  };
}

/** Laser shot in scene space. */
type Bolt = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** In front of or behind the crest (set at creation). */
  front: boolean;
  /** Shot aimed off-target, which can leave the scene. */
  miss: boolean;
};

/** Shot flying across the screen (CSS px). */
type ScreenBolt = { x: number; y: number; vx: number; vy: number };

/** Position on the orbit at angle `a`. */
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

  // Chase
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
      // 2 px head and a darker 1 px trail, opposite to the movement.
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

  // Crest: pause facing the viewer, then a half-turn on the vertical axis
  // (easeInOutCubic).
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
  // Golden edge, slightly wider than the face, drawn only during
  // the rotation to keep the crest crisp at rest.
  if (facing < 0.97) {
    const rimScale = facing + 2.5 / CREST_W;
    scene.save();
    scene.scale(rimScale, 1);
    scene.drawImage(sprites.crestRim, -CREST_W / 2, -CREST_H / 2);
    scene.restore();
  }
  if (facing > 0.06) {
    // Unsigned scale: the pattern is never mirrored, whichever face
    // is showing.
    scene.scale(facing, 1);
    scene.drawImage(crest[twinkle], -CREST_W / 2, -CREST_H / 2);
  }
  scene.restore();

  drawBolts(true);
  drawShips(true);
}

type PixelLogoProps = {
  /** Logo size in CSS px; the canvas overflows to fit the orbit. */
  size: number;
  /** Main menu: missed laser shots escape and fly across the screen. */
  fx?: boolean;
  /** Start on the still pose, to take over seamlessly from the still image. */
  fromStillPose?: boolean;
  /** Called once the first frame is drawn. */
  onReady?: () => void;
};

export default function PixelLogo({ size, fx = false, fromStillPose = false, onReady }: PixelLogoProps) {
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

    // Layer for shots flying across the screen (main menu only).
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
      // Some of the shots miss the saucer: those are the ones that
      // can leave the logo.
      const miss = Math.random() < 0.45;
      const wide = miss ? (Math.random() < 0.5 ? -1 : 1) * (2.5 + Math.random() * 2) : 0;
      const dx = alien.x - human.x;
      const dy = alien.y - human.y;
      const len = Math.hypot(dx, dy) || 1;
      // Perpendicular offset of missed shots.
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
      // Bursts of two shots at a steady pace.
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
        // Saucer hit: the shot disappears.
        if (!b.miss && Math.hypot(b.x - alien.x, b.y - alien.y) < 3) {
          bolts.splice(i, 1);
          continue;
        }
        const out =
          b.x < -2 || b.x > SCENE + 2 || b.y < -2 || b.y > SCENE + 2;
        if (!out) continue;
        bolts.splice(i, 1);
        // Missed shots leave the logo and fly across the screen.
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
        // Shot in art pixels: bright core and darker trail.
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
      // Still pose: crest facing front, both ships visible.
      drawScene(sceneCtx, sprites, STILL_POSE_TIME, []);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sceneCanvas, 0, 0, backing, backing);
      if (screenCanvas) window.removeEventListener("resize", sizeScreen);
      onReady?.();
      return;
    }

    const startAt = fromStillPose ? STILL_POSE_TIME : 0;
    const start = performance.now();
    let prev = startAt;
    const interval = window.setInterval(() => {
      const t = startAt + (performance.now() - start) / 1000;
      render(t, Math.min(t - prev, 0.2));
      prev = t;
    }, TICK_MS);
    render(startAt, 0);
    onReady?.();

    return () => {
      window.clearInterval(interval);
      if (screenCanvas) window.removeEventListener("resize", sizeScreen);
    };
    // `onReady` is a one-shot notification: a new callback identity must not
    // restart the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, fx, fromStillPose]);

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
