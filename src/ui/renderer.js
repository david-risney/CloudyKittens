import { tileToScreen } from './iso.js';
import { GRID_MIN, GRID_MAX, TILE_W, TILE_H } from '../game/constants.js';
// Per-cat visual interpolation state so cats glide (and animate a walk cycle)
// between the discrete tiles the simulation moves them across.
const catRender = new Map();
let lastFrameMs = null;
const TILES_PER_SEC = 2.2;
const WALK_RATE = 9;
const WALK_THRESHOLD = 0.06;
const FLOOR_LIGHT = '#e8dcc6';
const FLOOR_DARK = '#ddcdb2';
const WALL = '#cdb79e';
const COUCH = '#a9805c';
const COUCH_DARK = '#8f6a49';
const COUCH_DARKER = '#79573b';
const COUCH_CUSHION = '#bb9168';
const COUCH_CUSHION_DARK = '#9c7551';
function originFor(canvas) {
    // Center the isometric grid: it spans (tx+ty) 0..(2*GRID_MAX), i.e. a vertical extent of
    // GRID_MAX*TILE_H. Place the room slightly above middle to leave room for the bottom HUD.
    const gridHeight = GRID_MAX * TILE_H;
    return { ox: canvas.width / 2, oy: canvas.height / 2 - gridHeight / 2 };
}
function drawDiamond(ctx, cx, cy, fill) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - TILE_H / 2);
    ctx.lineTo(cx + TILE_W / 2, cy);
    ctx.lineTo(cx, cy + TILE_H / 2);
    ctx.lineTo(cx - TILE_W / 2, cy);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}
function drawFloor(ctx, ox, oy) {
    for (let ty = GRID_MIN; ty <= GRID_MAX; ty++) {
        for (let tx = GRID_MIN; tx <= GRID_MAX; tx++) {
            const { x, y } = tileToScreen(tx, ty, ox, oy);
            drawDiamond(ctx, x, y, (tx + ty) % 2 === 0 ? FLOOR_LIGHT : FLOOR_DARK);
        }
    }
}
/** A point in iso screen space, raised `z` pixels above the floor at tile (tx,ty). */
function isoPoint(tx, ty, z, ox, oy) {
    const p = tileToScreen(tx, ty, ox, oy);
    return { x: p.x, y: p.y - z };
}
function fillPoly(ctx, pts, color) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++)
        ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}
/**
 * Draws a solid isometric box for a tile-space footprint (x0,y0)-(x1,y1),
 * rising from height `zBase` to `zTop`. Renders the two camera-facing side
 * faces plus the top face with simple directional shading.
 */
function drawIsoBox(ctx, ox, oy, x0, y0, x1, y1, zBase, zTop, topColor, rightColor, leftColor) {
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
function drawCouch(ctx, ox, oy) {
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
    fillPoly(ctx, [
        isoPoint(x0, y0, 0, ox, oy),
        isoPoint(x1 + 0.1, y0, 0, ox, oy),
        isoPoint(x1 + 0.1, y1 + 0.15, 0, ox, oy),
        isoPoint(x0, y1 + 0.15, 0, ox, oy),
    ], '#5b4329');
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
        drawIsoBox(ctx, ox, oy, cx0, cushY0, cx1, cushY1, seatTop, seatTop + 7, COUCH_CUSHION, COUCH_CUSHION_DARK, COUCH_CUSHION_DARK);
    }
}
const BREED_PALETTES = {
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
function paletteFor(cat) {
    return BREED_PALETTES[cat.breed] ?? BREED_PALETTES.tabby;
}
/** Breed-specific markings, clipped to the standing body ellipse. */
function drawBodyMarkings(ctx, cat, x, baseY, pal) {
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
/** Two alternating front paws that lift in a stepping rhythm while walking. */
function drawWalkingFeet(ctx, x, baseY, color, phase) {
    const lift = 3.2;
    const yL = baseY + 20 - Math.max(0, Math.sin(phase)) * lift;
    const yR = baseY + 20 - Math.max(0, Math.sin(phase + Math.PI)) * lift;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x - 7, yL, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 7, yR, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
}
function drawCat(ctx, cat, render, ox, oy, selected, reducedMotion) {
    const { x, y } = tileToScreen(render.rx, render.ry, ox, oy);
    const walking = render.walking && !reducedMotion;
    // Body lifts a touch on each step for a gentle walk bounce.
    const bob = walking ? Math.abs(Math.sin(render.phase)) * 2.5 : 0;
    const baseY = y - 16 - bob;
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
    }
    else {
        // Stepping feet beneath the body while walking (drawn first so the body overlaps).
        if (walking) {
            const footColor = cat.breed === 'siamese' || cat.breed === 'tuxedo' ? pal.point : coat;
            drawWalkingFeet(ctx, x, baseY, footColor, render.phase);
        }
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
/**
 * Advance a cat's interpolated render position toward its logical tile, and track
 * whether it is currently walking (so the renderer can animate a step cycle).
 */
function updateCatRender(cat, dt, reducedMotion) {
    let r = catRender.get(cat.id);
    if (!r) {
        r = { rx: cat.tileX, ry: cat.tileY, walking: false, phase: 0 };
        catRender.set(cat.id, r);
    }
    const dx = cat.tileX - r.rx;
    const dy = cat.tileY - r.ry;
    const dist = Math.hypot(dx, dy);
    if (reducedMotion) {
        r.rx = cat.tileX;
        r.ry = cat.tileY;
        r.walking = false;
        return r;
    }
    const maxStep = TILES_PER_SEC * (dt / 1000);
    if (dist <= maxStep || dist < 1e-3) {
        r.rx = cat.tileX;
        r.ry = cat.tileY;
    }
    else {
        r.rx += (dx / dist) * maxStep;
        r.ry += (dy / dist) * maxStep;
    }
    const walking = dist > WALK_THRESHOLD && cat.activity !== 'sleeping';
    r.walking = walking;
    r.phase = walking ? r.phase + (dt / 1000) * WALK_RATE : 0;
    return r;
}
/** Draws the whole scene: floor, couch, and depth-sorted cats. */
export function renderScene(ctx, canvas, state, opts = {}) {
    const timeMs = opts.timeMs ?? 0;
    const reducedMotion = opts.reducedMotion ?? false;
    let dt = lastFrameMs == null ? 16 : timeMs - lastFrameMs;
    if (!(dt > 0))
        dt = 16;
    if (dt > 100)
        dt = 100;
    lastFrameMs = timeMs;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = WALL;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const { ox, oy } = originFor(canvas);
    drawFloor(ctx, ox, oy);
    drawCouch(ctx, ox, oy);
    // Update interpolated positions, then prune state for departed cats.
    const liveIds = new Set();
    for (const cat of state.cats) {
        liveIds.add(cat.id);
        updateCatRender(cat, dt, reducedMotion);
    }
    for (const id of catRender.keys()) {
        if (!liveIds.has(id))
            catRender.delete(id);
    }
    // Depth-sort by interpolated position so overlap stays correct while walking.
    const order = [...state.cats].sort((a, b) => {
        const ra = catRender.get(a.id);
        const rb = catRender.get(b.id);
        return ra.rx + ra.ry - (rb.rx + rb.ry);
    });
    for (const cat of order) {
        const r = catRender.get(cat.id);
        drawCat(ctx, cat, r, ox, oy, opts.selectedCatId === cat.id, reducedMotion);
    }
}
/** Hit-test a screen point to the nearest cat (for click targeting). */
export function catAtPoint(canvas, state, px, py) {
    const { ox, oy } = originFor(canvas);
    let best = null;
    let bestD = Infinity;
    for (const cat of state.cats) {
        const r = catRender.get(cat.id);
        const tx = r ? r.rx : cat.tileX;
        const ty = r ? r.ry : cat.tileY;
        const { x, y } = tileToScreen(tx, ty, ox, oy);
        const d = Math.hypot(px - x, py - (y - 14));
        if (d < 36 && d < bestD) {
            best = cat;
            bestD = d;
        }
    }
    return best;
}
