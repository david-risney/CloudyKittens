import { describe, it, expect } from 'vitest';
import { step, applyElapsedSinceLastSeen } from '../../src/game/simulation.js';
import { newGame } from '../../src/game/state.js';
import { createCat } from '../../src/game/cats.js';
import { HUNGER_MAX } from '../../src/game/constants.js';
function fakeClock(now = 1_000_000) {
    return { now: () => now, today: () => '2026-06-15' };
}
function gameWithCat(overrides = {}) {
    const s = newGame(fakeClock());
    s.cats.push({ ...createCat(99), ...overrides });
    return s;
}
describe('step — hunger', () => {
    it('raises hunger over time', () => {
        const s = gameWithCat({ hunger: 10, activity: 'wandering', sleep: 0 });
        const next = step(s, 60_000, fakeClock());
        expect(next.cats[0].hunger).toBeGreaterThan(10);
        expect(s.cats[0].hunger).toBe(10); // input unchanged
    });
    it('never exceeds the maximum (starving)', () => {
        const s = gameWithCat({ hunger: 99, sleep: 0 });
        const next = step(s, 10 * 60 * 1000, fakeClock());
        expect(next.cats[0].hunger).toBeLessThanOrEqual(HUNGER_MAX);
    });
    it('does nothing for non-positive delta', () => {
        const s = gameWithCat();
        expect(step(s, 0, fakeClock())).toBe(s);
    });
});
describe('applyElapsedSinceLastSeen', () => {
    it('accrues hunger for offline time so cats become feedable again (FR-010a)', () => {
        const s = gameWithCat({ hunger: 5 });
        s.lastSeen = 0;
        const next = applyElapsedSinceLastSeen(s, fakeClock(20 * 60 * 1000));
        expect(next.cats[0].hunger).toBeGreaterThan(5);
        expect(next.lastSeen).toBe(20 * 60 * 1000);
    });
    it('is a no-op when no time has elapsed', () => {
        const s = gameWithCat();
        s.lastSeen = 1_000_000;
        expect(applyElapsedSinceLastSeen(s, fakeClock(1_000_000))).toBe(s);
    });
});
