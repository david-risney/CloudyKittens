import { describe, it, expect } from 'vitest';
import { applySelectionToCat } from '../../src/ui/hud.js';
import { newGame } from '../../src/game/state.js';
import { createCat } from '../../src/game/cats.js';
import type { ClockPort } from '../../src/game/ports.js';
import type { GameState } from '../../src/game/types.js';

function fakeClock(): ClockPort {
  return { now: () => 1_000_000, today: () => '2026-06-15' };
}

function gameWithCat(overrides: Partial<ReturnType<typeof createCat>> = {}): GameState {
  const s = newGame(fakeClock());
  s.cats.push({ ...createCat(11), ...overrides });
  s.player.inventory = { salmon: 2, mouseToy: 1 };
  return s;
}

describe('applySelectionToCat', () => {
  it('feeds a food item, signals feed sfx, and consumes inventory', () => {
    const s = gameWithCat({ hunger: 80, likes: { salmon: 5 } });
    const out = applySelectionToCat(s, { kind: 'item', item: 'salmon' }, s.cats[0].id);
    expect(out.sfx).toBe('feed');
    expect(out.state.player.inventory.salmon).toBe(1);
    expect(out.feedback).toMatch(/yum/i);
  });

  it('gives gentle feedback and no sfx when the cat is full', () => {
    const s = gameWithCat({ hunger: 0 });
    const out = applySelectionToCat(s, { kind: 'item', item: 'salmon' }, s.cats[0].id);
    expect(out.sfx).toBeNull();
    expect(out.feedback).toMatch(/full/i);
    expect(out.state).toBe(s);
  });

  it('uses a toy without consuming it', () => {
    const s = gameWithCat({ likes: { mouseToy: 4 } });
    const out = applySelectionToCat(s, { kind: 'item', item: 'mouseToy' }, s.cats[0].id);
    expect(out.sfx).toBe('toy');
    expect(out.state.player.inventory.mouseToy).toBe(1);
  });

  it('pets the cat and raises trust', () => {
    const s = gameWithCat({ trust: 5 });
    const out = applySelectionToCat(s, { kind: 'pet' }, s.cats[0].id);
    expect(out.sfx).toBe('pet');
    expect(out.state.cats[0].trust).toBeGreaterThan(5);
  });

  it('requests the lookup modal without changing state', () => {
    const s = gameWithCat();
    const out = applySelectionToCat(s, { kind: 'lookup' }, s.cats[0].id);
    expect(out.openLookupCatId).toBe(s.cats[0].id);
    expect(out.state).toBe(s);
  });
});
