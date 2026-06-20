import type { GameState, Cat, BreedId } from '../game/types.js';
import { tileToScreen, sortByDepth } from './iso.js';
import { GRID_MIN, GRID_MAX, TILE_W, TILE_H } from '../game/constants.js';

export interface RenderOptions {
  selectedCatId?: string | null;
  reducedMotion?: boolean;
  timeMs?: number;
}

const FLOOR_LIGHT = '#e8dcc6';
const FLOOR_DARK = '#ddcdb2';
const WALL = '#cdb79e';
const COUCH = '#a9805c';
const COUCH_DARK = '#8f6a49';
const COUCH_DARKER = '#79573b';
const COUCH_CUSHION = '#bb9168';
const COUCH_CUSHION_DARK = '#9c7551';

function originFor(canvas: { width: number; height: number }): { ox: number; oy: number } {
  // Center the isometric grid: it spans (tx+ty) 0..(2*GRID_MAX), i.e. a vertical extent of
  // GRID_MAX*TILE_H. Place the room slightly above middle to leave room for the bottom HUD.
  const gridHeight = GRID_MAX * TILE_H;
  return { ox: canvas.width / 2, oy: canvas.height / 2 - gridHeight / 2 };
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  fill: string,
): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - TILE_H / 2);
  ctx.lineTo(cx + TILE_W / 2, cy);
  ctx.lineTo(cx, cy + TILE_H / 2);
  ctx.lineTo(cx - TILE_W / 2, cy);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawFloor(ctx: CanvasRenderingContext2D, ox: number, oy: number): void {
  for (let ty = GRID_MIN; ty <= GRID_MAX; ty++) {
    for (let tx = GRID_MIN; tx <= GRID_MAX; tx++) {
      const { x, y } = tileToScreen(tx, ty, ox, oy);
      drawDiamond(ctx, x, y, (tx + ty) % 2 === 0 ? FLOOR_LIGHT : FLOOR_DARK);
    }
  }
}

/** A point in iso screen space, raised `z` pixels above the floor at tile (tx,ty). */
function isoPoint(
  tx: number,
  ty: number,
  z: number,
  ox: number,
  oy: number,
): { x: number; y: number } {
  const p = tileToScreen(tx, ty, ox, oy);
  return { x: p.x, y: p.y - z };
}

function fillPoly(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  color: string,
): void {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a solid isometric box for a tile-space footprint (x0,y0)-(x1,y1),
 * rising from height `zBase` to `zTop`. Renders the two camera-facing side
 * faces plus the top face with simple directional shading.
 */
function drawIsoBox(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  zBase: number,
  zTop: number,
  topColor: string,
  rightColor: string,
  leftColor: string,
): void {
  const tA = isoPoint(x0, y0, zTop, ox, oy);
  const tB = isoPoint(x1, y0, zTop, ox, oy);
  const tC = isoPoint(x1, y1, zTop, ox, oy);
  const tD = isoPoint(x0, y1, zTop, ox, oy);
  const bB = isoPoint(x1, y0, zBase, ox, oy);
  const bC = isoPoint(x1, y1, zBase, ox, oy);
  const bD = isoPoint(x0, y1, zBase, ox, oy);

  // Left-front face (the y = y1 edge), then right-front face (the x = x1 edge).
  fillPoly(ctx, [tD, tC, bC, bD], leftColor);
  fillPoly(ctx, [tB, tC, bC, bB], rightColor);
  // Top face last so it sits above the sides.
  fillPoly(ctx, [tA, tB, tC, tD], topColor);
}

function drawCouch(ctx: CanvasRenderingContext2D, ox: number, oy: number): void {
  // Footprint on the back tiles. Long axis runs along +tx; depth along +ty.
  const x0 = 0.15;
  const x1 = 2.55;
  const y0 = -0.15;
  const y1 = 0.75;
  const seatTop = 16;
  const backTop = 50;
  const armTop = 30;

  // Soft contact shadow on the floor under the couch.
  ctx.save();
  ctx.globalAlpha = 0.16;
  fillPoly(
    ctx,
    [
      isoPoint(x0, y0, 0, ox, oy),
      isoPoint(x1 + 0.1, y0, 0, ox, oy),
      isoPoint(x1 + 0.1, y1 + 0.15, 0, ox, oy),
      isoPoint(x0, y1 + 0.15, 0, ox, oy),
    ],
    '#5b4329',
  );
  ctx.restore();

  // Seat base block.
  drawIsoBox(ctx, ox, oy, x0, y0, x1, y1, 0, seatTop, COUCH, COUCH_DARK, COUCH_DARKER);

  // Backrest along the far (small-ty) edge.
  drawIsoBox(ctx, ox, oy, x0, y0, x1, y0 + 0.28, seatTop, backTop, COUCH, COUCH_DARK, COUCH_DARKER);

  // Two armrests at the ends, running the full depth.
  drawIsoBox(ctx, ox, oy, x0, y0, x0 + 0.3, y1, seatTop, armTop, COUCH, COUCH_DARK, COUCH_DARKER);
  drawIsoBox(ctx, ox, oy, x1 - 0.3, y0, x1, y1, seatTop, armTop, COUCH, COUCH_DARK, COUCH_DARKER);

  // Seat cushions: rounded lighter tops sitting between the arms, in front of the back.
  const cushY0 = y0 + 0.3;
  const cushY1 = y1 - 0.06;
  const span = x1 - 0.3 - (x0 + 0.3);
  const seats = 2;
  const gap = 0.06;
  const cw = (span - gap * (seats - 1)) / seats;
  for (let i = 0; i < seats; i++) {
    const cx0 = x0 + 0.3 + i * (cw + gap);
    const cx1 = cx0 + cw;
    // A short cushion block so the seat reads as padded.
    drawIsoBox(
      ctx,
      ox,
      oy,
      cx0,
      cushY0,
      cx1,
      cushY1,
      seatTop,
      seatTop + 7,
      COUCH_CUSHION,
      COUCH_CUSHION_DARK,
      COUCH_CUSHION_DARK,
    );
  }
}

interface BreedPalette {
  /** Three coat shades, indexed by the cat's `appearance` (0..2) for variety. */
  coats: [string, string, string];
  /** Lighter underside / chest. */
  belly: string;
  /** Stripe / patch colour. */
  marking: string;
  /** Colour of the darker "points": ears, face mask, tail tip. */
  point: string;
  /** Inner-ear colour. */
  innerEar: string;
  /** Eye colour. */
  eye: string;
}

const BREED_PALETTES: Record<BreedId, BreedPalette> = {
  tabby: {
    coats: ['#a87d4c', '#946b3c', '#b78f5e'],
    belly: '#e7d7be',
    marking: '#5f4a30',
    point: '#5f4a30',
    innerEar: '#caa57f',
    eye: '#82ad55',
  },
  calico: {
    coats: ['#f1e7d6', '#ece1cd', '#f6efe1'],
    belly: '#ffffff',
    marking: '#3a2f28',
    point: '#db8a44',
    innerEar: '#e9b78b',
    eye: '#c79a3a',
  },
  siamese: {
    coats: ['#e9dcc4', '#efe3cd', '#e2d2b6'],
    belly: '#f4ecd9',
    marking: '#4a3528',
    point: '#4a3528',
    innerEar: '#7a5c46',
    eye: '#5fb4d8',
  },
  tuxedo: {
    coats: ['#2e2a28', '#34302d', '#262220'],
    belly: '#f4f1ea',
    marking: '#1b1917',
    point: '#1b1917',
    innerEar: '#6b5a55',
    eye: '#d2b24a',
  },
  ginger: {
    coats: ['#e0904c', '#d6823e', '#ea9d58'],
    belly: '#f7e6c9',
    marking: '#bf6a2c',
    point: '#bf6a2c',
    innerEar: '#f0b078',
    eye: '#9bb04a',
  },
};

function paletteFor(cat: Cat): BreedPalette {
  return BREED_PALETTES[cat.breed] ?? BREED_PALETTES.tabby;
}

/** Breed-specific markings, clipped to the standing body ellipse. */
function drawBodyMarkings(
  ctx: CanvasRenderingContext2D,
  cat: Cat,
  x: number,
  baseY: number,
  pal: BreedPalette,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, baseY + 6, 18, 16, 0, 0, Math.PI * 2);
  ctx.clip();

  switch (cat.breed) {
    case 'tabby':
    case 'ginger': {
      // Darker curved back stripes.
      ctx.strokeStyle = pal.marking;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      for (const dx of [-9, -3, 3, 9]) {
        ctx.beginPath();
        ctx.moveTo(x + dx, baseY - 8);
        ctx.quadraticCurveTo(x + dx + 3, baseY + 4, x + dx, baseY + 16);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'calico': {
      // Orange and dark patches over a pale coat, plus a soft belly.
      ctx.fillStyle = pal.point;
      ctx.beginPath();
      ctx.ellipse(x - 9, baseY + 2, 9, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pal.marking;
      ctx.beginPath();
      ctx.ellipse(x + 8, baseY + 9, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'siamese': {
      // Body stays pale; a subtle shaded saddle toward the rear.
      ctx.fillStyle = pal.point;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.ellipse(x + 10, baseY + 8, 12, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'tuxedo': {
      // White bib down the chest/belly.
      ctx.fillStyle = pal.belly;
      ctx.beginPath();
      ctx.ellipse(x, baseY + 12, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

function drawCat(
  ctx: CanvasRenderingContext2D,
  cat: Cat,
  ox: number,
  oy: number,
  selected: boolean,
  reducedMotion: boolean,
): void {
  const { x, y } = tileToScreen(cat.tileX, cat.tileY, ox, oy);
  const bob =
    !reducedMotion && cat.activity === 'wandering'
      ? Math.sin((cat.tileX + cat.tileY) * 1.3) * 2
      : 0;
  const baseY = y - 16 + bob;
  const pal = paletteFor(cat);
  const coat = pal.coats[cat.appearance] ?? pal.coats[0];

  // Soft ground shadow so cats read clearly against the floor.
  ctx.fillStyle = 'rgba(80, 60, 40, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  if (selected) {
    ctx.beginPath();
    ctx.ellipse(x, y + 6, TILE_W / 2.4, TILE_H / 2.4, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#7a5a3a';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  if (cat.activity === 'sleeping') {
    // Curled-up body.
    ctx.fillStyle = coat;
    ctx.beginPath();
    ctx.ellipse(x, baseY + 12, 30, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail curling around the front.
    ctx.strokeStyle = cat.breed === 'siamese' || cat.breed === 'tuxedo' ? pal.point : coat;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 24, baseY + 14);
    ctx.quadraticCurveTo(x + 30, baseY + 26, x + 6, baseY + 24);
    ctx.stroke();
    // Curled head.
    ctx.fillStyle = cat.breed === 'siamese' ? pal.point : coat;
    ctx.beginPath();
    ctx.ellipse(x - 20, baseY + 10, 12, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tuxedo muzzle / siamese mask hint.
    if (cat.breed === 'tuxedo') {
      ctx.fillStyle = pal.belly;
      ctx.beginPath();
      ctx.ellipse(x - 25, baseY + 12, 5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Tail (darker point for siamese/tuxedo).
    ctx.strokeStyle = cat.breed === 'siamese' || cat.breed === 'tuxedo' ? pal.point : coat;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 18, baseY + 8);
    ctx.quadraticCurveTo(x + 34, baseY + 2, x + 30, baseY - 14);
    ctx.stroke();

    // Body.
    ctx.fillStyle = coat;
    ctx.beginPath();
    ctx.ellipse(x, baseY + 6, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    drawBodyMarkings(ctx, cat, x, baseY, pal);

    // Head.
    ctx.fillStyle = coat;
    ctx.beginPath();
    ctx.ellipse(x, baseY - 12, 14, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Siamese dark face mask.
    if (cat.breed === 'siamese') {
      ctx.fillStyle = pal.point;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(x, baseY - 7, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Tabby forehead "M" / ginger stripes on the head.
    if (cat.breed === 'tabby' || cat.breed === 'ginger') {
      ctx.strokeStyle = pal.marking;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x - 5, baseY - 22);
      ctx.lineTo(x - 3, baseY - 16);
      ctx.moveTo(x, baseY - 23);
      ctx.lineTo(x, baseY - 17);
      ctx.moveTo(x + 5, baseY - 22);
      ctx.lineTo(x + 3, baseY - 16);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Tuxedo white muzzle.
    if (cat.breed === 'tuxedo') {
      ctx.fillStyle = pal.belly;
      ctx.beginPath();
      ctx.ellipse(x, baseY - 6, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Calico dark patch over one ear/eye.
    if (cat.breed === 'calico') {
      ctx.fillStyle = pal.marking;
      ctx.beginPath();
      ctx.ellipse(x - 7, baseY - 16, 6, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ears (outer coat + inner ear).
    const earColor = cat.breed === 'siamese' || cat.breed === 'tuxedo' ? pal.point : coat;
    ctx.fillStyle = earColor;
    ctx.beginPath();
    ctx.moveTo(x - 13, baseY - 20);
    ctx.lineTo(x - 6, baseY - 32);
    ctx.lineTo(x - 1, baseY - 20);
    ctx.moveTo(x + 13, baseY - 20);
    ctx.lineTo(x + 6, baseY - 32);
    ctx.lineTo(x + 1, baseY - 20);
    ctx.fill();
    ctx.fillStyle = pal.innerEar;
    ctx.beginPath();
    ctx.moveTo(x - 10, baseY - 21);
    ctx.lineTo(x - 6, baseY - 28);
    ctx.lineTo(x - 3, baseY - 21);
    ctx.moveTo(x + 10, baseY - 21);
    ctx.lineTo(x + 6, baseY - 28);
    ctx.lineTo(x + 3, baseY - 21);
    ctx.fill();

    // Eyes (breed-tinted iris + dark pupil).
    ctx.fillStyle = pal.eye;
    ctx.beginPath();
    ctx.ellipse(x - 5, baseY - 12, 2.6, 3.2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 5, baseY - 12, 2.6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#241a12';
    ctx.beginPath();
    ctx.ellipse(x - 5, baseY - 12, 1.1, 2.4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 5, baseY - 12, 1.1, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose.
    ctx.fillStyle = cat.breed === 'tuxedo' ? '#3a2a26' : '#a86b5b';
    ctx.beginPath();
    ctx.moveTo(x - 2, baseY - 7);
    ctx.lineTo(x + 2, baseY - 7);
    ctx.lineTo(x, baseY - 4);
    ctx.fill();
  }

  // Sleeping "z" marker
  if (cat.activity === 'sleeping') {
    ctx.fillStyle = '#7d6b54';
    ctx.font = '16px system-ui';
    ctx.fillText('z', x + 18, baseY - 8);
  }
}

/** Draws the whole scene: floor, couch, and depth-sorted cats. */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  canvas: { width: number; height: number },
  state: GameState,
  opts: RenderOptions = {},
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const { ox, oy } = originFor(canvas);

  drawFloor(ctx, ox, oy);
  drawCouch(ctx, ox, oy);

  for (const cat of sortByDepth(state.cats)) {
    drawCat(ctx, cat, ox, oy, opts.selectedCatId === cat.id, opts.reducedMotion ?? false);
  }
}

/** Hit-test a screen point to the nearest cat (for click targeting). */
export function catAtPoint(
  canvas: { width: number; height: number },
  state: GameState,
  px: number,
  py: number,
): Cat | null {
  const { ox, oy } = originFor(canvas);
  let best: Cat | null = null;
  let bestD = Infinity;
  for (const cat of state.cats) {
    const { x, y } = tileToScreen(cat.tileX, cat.tileY, ox, oy);
    const d = Math.hypot(px - x, py - (y - 14));
    if (d < 36 && d < bestD) {
      best = cat;
      bestD = d;
    }
  }
  return best;
}
