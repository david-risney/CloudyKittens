import { describe, it, expect } from 'vitest';
import { feed } from '../../src/game/economy.js';
import { newGame } from '../../src/game/state.js';
import { createCat } from '../../src/game/cats.js';
import type { ClockPort } from '../../src/game/ports.js';
import type { GameState } from '../../src/game/types.js';
import { FEED_HUNGER_REDUCTION } from '../../src/game/constants.js';

function fakeClock(today = '2026-06-15', now = 1_000_000): ClockPort {
  return { now: () => now, today: () => today };
}

function gameWithCat(overrides: Partial<ReturnType<typeof createCat>> = {}): GameState {
  const s = newGame(fakeClock());
  const cat = { ...createCat(42), ...overrides };
  s.cats.push(cat);
  s.player.inventory = { salmon: 3, tuna: 2 };
  return s;
}

describe('feed', () => {
  it('consumes a food, lowers hunger, and does not mutate the input state', () => {
    const s = gameWithCat({ hunger: 80, trust: 0, likes: { salmon: 5 } });
    const before = structuredClone(s);
    const r = feed(s, s.cats[0].id, 'salmon');

    expect(r.consumed).toBe(true);
    expect(r.state.cats[0].hunger).toBe(80 - FEED_HUNGER_REDUCTION);
    expect(r.state.player.inventory.salmon).toBe(2);
    // input untouched
    expect(s).toEqual(before);
  });

  it('awards money scaled by trust when a liked food raises trust above zero', () => {
    const s = gameWithCat({ hunger: 80, trust: 50, likes: { salmon: 8 } });
    const r = feed(s, s.cats[0].id, 'salmon');
    expect(r.trustDelta).toBe(8);
    expect(r.moneyGained).toBeGreaterThan(0);
    expect(r.state.player.money).toBe(s.player.money + r.moneyGained);
  });

  it('awards no money when resulting trust is zero or negative', () => {
    const s = gameWithCat({ hunger: 80, trust: 0, likes: {} });
    const r = feed(s, s.cats[0].id, 'salmon'); // disliked → trust delta negative
    expect(r.trustDelta).toBeLessThan(0);
    expect(r.moneyGained).toBe(0);
    expect(r.state.player.money).toBe(s.player.money);
  });

  it('cancels feeding a full cat (hunger already at minimum)', () => {
    const s = gameWithCat({ hunger: 0 });
    const r = feed(s, s.cats[0].id, 'salmon');
    expect(r.consumed).toBe(false);
    expect(r.state).toBe(s);
  });

  it('does nothing when the item is not in inventory', () => {
    const s = gameWithCat({ hunger: 80 });
    s.player.inventory = {};
    const r = feed(s, s.cats[0].id, 'salmon');
    expect(r.consumed).toBe(false);
  });

  it('rejects non-food items', () => {
    const s = gameWithCat({ hunger: 80 });
    s.player.inventory = { mouseToy: 1 } as GameState['player']['inventory'];
    const r = feed(s, s.cats[0].id, 'mouseToy');
    expect(r.consumed).toBe(false);
  });
});
