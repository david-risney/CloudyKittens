import { describe, it, expect } from 'vitest';
import { tileToScreen, depthKey, sortByDepth } from '../../src/ui/iso.js';
import { TILE_W, TILE_H } from '../../src/game/constants.js';

describe('tileToScreen', () => {
  it('maps the origin tile to the origin offset', () => {
    expect(tileToScreen(0, 0, 100, 50)).toEqual({ x: 100, y: 50 });
  });

  it('applies a 2:1 isometric projection', () => {
    expect(tileToScreen(1, 0, 0, 0)).toEqual({ x: TILE_W / 2, y: TILE_H / 2 });
    expect(tileToScreen(0, 1, 0, 0)).toEqual({ x: -TILE_W / 2, y: TILE_H / 2 });
  });
});

describe('depthKey / sortByDepth', () => {
  it('orders drawables back-to-front by tileX + tileY', () => {
    expect(depthKey(2, 3)).toBe(5);
    const items = [
      { tileX: 3, tileY: 3, id: 'far' },
      { tileX: 0, tileY: 0, id: 'near' },
      { tileX: 1, tileY: 1, id: 'mid' },
    ];
    expect(sortByDepth(items).map((i) => i.id)).toEqual(['near', 'mid', 'far']);
  });

  it('does not mutate the input array', () => {
    const items = [
      { tileX: 1, tileY: 1 },
      { tileX: 0, tileY: 0 },
    ];
    const copy = [...items];
    sortByDepth(items);
    expect(items).toEqual(copy);
  });
});
