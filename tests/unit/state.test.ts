import { describe, it, expect } from 'vitest';
import { newGame, generateRoster, seedFromDate } from '../../src/game/state.js';
import { START_MONEY, DAILY_CAT_COUNT } from '../../src/game/constants.js';
import type { ClockPort } from '../../src/game/ports.js';

function fakeClock(today = '2026-06-15', now = 1_000_000): ClockPort {
  return { now: () => now, today: () => today };
}

describe('newGame', () => {
  it('starts with the correct money, no owned cats, and unclaimed free cat', () => {
    const s = newGame(fakeClock());
    expect(s.player.money).toBe(START_MONEY);
    expect(s.cats).toEqual([]);
    expect(s.player.firstCatClaimed).toBe(false);
  });

  it('has default settings with music and sfx enabled', () => {
    const s = newGame(fakeClock());
    expect(s.settings).toEqual({ musicEnabled: true, sfxEnabled: true });
  });

  it('seeds a 5-cat shop roster for today and records lastSeen', () => {
    const clock = fakeClock('2026-06-15', 555);
    const s = newGame(clock);
    expect(s.shop.adoptableCats).toHaveLength(DAILY_CAT_COUNT);
    expect(s.shop.lastShopDay).toBe('2026-06-15');
    expect(s.lastSeen).toBe(555);
  });

  it('gives a non-empty starter inventory so the loop is playable', () => {
    const s = newGame(fakeClock());
    const total = Object.values(s.player.inventory).reduce((a, b) => a + (b ?? 0), 0);
    expect(total).toBeGreaterThan(0);
  });
});

describe('generateRoster / seedFromDate', () => {
  it('is deterministic per date', () => {
    expect(generateRoster('2026-06-15')).toEqual(generateRoster('2026-06-15'));
  });

  it('differs across dates', () => {
    expect(seedFromDate('2026-06-15')).not.toBe(seedFromDate('2026-06-16'));
    const a = generateRoster('2026-06-15').map((c) => c.id);
    const b = generateRoster('2026-06-16').map((c) => c.id);
    expect(a).not.toEqual(b);
  });
});
