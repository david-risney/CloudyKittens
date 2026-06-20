import { describe, it, expect } from 'vitest';
import { buyItem } from '../../src/game/shop.js';
import { newGame } from '../../src/game/state.js';
import type { ClockPort } from '../../src/game/ports.js';
import { ITEMS } from '../../src/game/items.js';

function clockFor(): ClockPort {
  return { now: () => 1_000_000, today: () => '2026-06-15' };
}

describe('buyItem', () => {
  it('deducts the price and adds one to inventory', () => {
    const s = newGame(clockFor());
    s.player.money = 100;
    const have = s.player.inventory.salmon ?? 0;
    const r = buyItem(s, 'salmon');
    expect(r.bought).toBe(true);
    expect(r.state.player.money).toBe(100 - ITEMS.salmon.price);
    expect(r.state.player.inventory.salmon).toBe(have + 1);
  });

  it('blocks an unaffordable purchase without changing state', () => {
    const s = newGame(clockFor());
    s.player.money = 0;
    const r = buyItem(s, 'salmon');
    expect(r.bought).toBe(false);
    expect(r.state).toBe(s);
  });

  it('does not mutate the input state', () => {
    const s = newGame(clockFor());
    s.player.money = 100;
    const before = structuredClone(s);
    buyItem(s, 'tuna');
    expect(s).toEqual(before);
  });
});
