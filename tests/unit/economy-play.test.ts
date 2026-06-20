import { describe, it, expect } from 'vitest';
import { useToy, pet } from '../../src/game/economy.js';
import { newGame } from '../../src/game/state.js';
import { createCat } from '../../src/game/cats.js';
import type { ClockPort } from '../../src/game/ports.js';
import type { GameState } from '../../src/game/types.js';
import { PET_TRUST_GAIN } from '../../src/game/constants.js';

function fakeClock(): ClockPort {
  return { now: () => 1_000_000, today: () => '2026-06-15' };
}

function gameWithCat(overrides: Partial<ReturnType<typeof createCat>> = {}): GameState {
  const s = newGame(fakeClock());
  s.cats.push({ ...createCat(7), ...overrides });
  return s;
}

describe('useToy', () => {
  it('raises trust for a liked toy without consuming it', () => {
    const s = gameWithCat({ trust: 0, likes: { mouseToy: 6 } });
    const next = useToy(s, s.cats[0].id, 'mouseToy');
    expect(next.cats[0].trust).toBe(6);
    expect(next).not.toBe(s);
    expect(s.cats[0].trust).toBe(0);
  });

  it('ignores non-toy items', () => {
    const s = gameWithCat({ trust: 3 });
    const next = useToy(s, s.cats[0].id, 'salmon');
    expect(next).toBe(s);
  });
});

describe('pet', () => {
  it('gently raises trust', () => {
    const s = gameWithCat({ trust: 10 });
    const next = pet(s, s.cats[0].id);
    expect(next.cats[0].trust).toBe(10 + PET_TRUST_GAIN);
  });

  it('clamps trust at the maximum', () => {
    const s = gameWithCat({ trust: 100 });
    const next = pet(s, s.cats[0].id);
    expect(next.cats[0].trust).toBe(100);
  });
});
