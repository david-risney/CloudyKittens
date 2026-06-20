import { describe, it, expect } from 'vitest';
import { refreshIfNewDay } from '../../src/game/shop.js';
import { isNewDay } from '../../src/game/day.js';
import { newGame } from '../../src/game/state.js';
import type { ClockPort } from '../../src/game/ports.js';
import { DAILY_CAT_COUNT } from '../../src/game/constants.js';

function clockFor(today: string, now = 1_000_000): ClockPort {
  return { now: () => now, today: () => today };
}

describe('isNewDay', () => {
  it('detects a changed calendar date', () => {
    expect(isNewDay('2026-06-15', clockFor('2026-06-16'))).toBe(true);
    expect(isNewDay('2026-06-15', clockFor('2026-06-15'))).toBe(false);
  });
});

describe('refreshIfNewDay', () => {
  it('keeps the same roster on the same day (deterministic)', () => {
    const s = newGame(clockFor('2026-06-15'));
    const next = refreshIfNewDay(s, clockFor('2026-06-15'));
    expect(next).toBe(s);
    expect(next.shop.adoptableCats.map((c) => c.id)).toEqual(
      s.shop.adoptableCats.map((c) => c.id),
    );
  });

  it('regenerates exactly 5 cats on a new day', () => {
    const s = newGame(clockFor('2026-06-15'));
    const next = refreshIfNewDay(s, clockFor('2026-06-16'));
    expect(next.shop.lastShopDay).toBe('2026-06-16');
    expect(next.shop.adoptableCats).toHaveLength(DAILY_CAT_COUNT);
    expect(next.shop.adoptableCats.map((c) => c.id)).not.toEqual(
      s.shop.adoptableCats.map((c) => c.id),
    );
  });
});
