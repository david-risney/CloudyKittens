import { TILE_W, TILE_H } from '../game/constants.js';
/** Convert a tile coordinate to screen-space (2:1 isometric), given an origin offset. */
export function tileToScreen(tileX, tileY, originX, originY) {
    return {
        x: originX + (tileX - tileY) * (TILE_W / 2),
        y: originY + (tileX + tileY) * (TILE_H / 2),
    };
}
/** Depth key for painter's-algorithm sorting; larger draws later (in front). */
export function depthKey(tileX, tileY) {
    return tileX + tileY;
}
/** Sort drawables back-to-front by tile depth (stable on ties). */
export function sortByDepth(items) {
    return [...items].sort((a, b) => depthKey(a.tileX, a.tileY) - depthKey(b.tileX, b.tileY));
}
