import { TILE_W, TILE_H } from '../game/constants.js';

export interface Point {
  x: number;
  y: number;
}

/** Convert a tile coordinate to screen-space (2:1 isometric), given an origin offset. */
export function tileToScreen(tileX: number, tileY: number, originX: number, originY: number): Point {
  return {
    x: originX + (tileX - tileY) * (TILE_W / 2),
    y: originY + (tileX + tileY) * (TILE_H / 2),
  };
}

/** Depth key for painter's-algorithm sorting; larger draws later (in front). */
export function depthKey(tileX: number, tileY: number): number {
  return tileX + tileY;
}

/** Sort drawables back-to-front by tile depth (stable on ties). */
export function sortByDepth<T extends { tileX: number; tileY: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => depthKey(a.tileX, a.tileY) - depthKey(b.tileX, b.tileY));
}
