import { describe, it, expect } from 'vitest';
import { step } from '../../src/game/simulation.js';
import { newGame } from '../../src/game/state.js';
import { createCat } from '../../src/game/cats.js';
import { SLEEP_FALL_ASLEEP, SLEEP_WAKE } from '../../src/game/constants.js';
function clockAt(now) {
    return { now: () => now, today: () => '2026-06-15' };
}
function gameWithCat(overrides = {}) {
    const s = newGame(clockAt(0));
    s.cats.push({ ...createCat(123), ...overrides });
    return s;
}
describe('step — activity', () => {
    it('accrues tiredness while awake', () => {
        const s = gameWithCat({ activity: 'wandering', sleep: 0 });
        const next = step(s, 30_000, clockAt(0));
        expect(next.cats[0].sleep).toBeGreaterThan(0);
    });
    it('falls asleep when tiredness reaches the threshold', () => {
        const s = gameWithCat({ activity: 'wandering', sleep: SLEEP_FALL_ASLEEP - 1 });
        const next = step(s, 60_000, clockAt(0));
        expect(next.cats[0].activity).toBe('sleeping');
    });
    it('recovers while sleeping and wakes at the wake threshold', () => {
        const s = gameWithCat({ activity: 'sleeping', sleep: SLEEP_WAKE + 1 });
        const next = step(s, 60_000, clockAt(0));
        expect(next.cats[0].sleep).toBeLessThanOrEqual(SLEEP_WAKE);
        expect(next.cats[0].activity).toBe('wandering');
    });
    it('moves wandering cats around the room over time', () => {
        let s = gameWithCat({ activity: 'wandering', sleep: 0, tileX: 2, tileY: 2 });
        const start = `${s.cats[0].tileX},${s.cats[0].tileY}`;
        let moved = false;
        for (let i = 1; i <= 40; i++) {
            s = step(s, 200, clockAt(i * 200));
            if (`${s.cats[0].tileX},${s.cats[0].tileY}` !== start) {
                moved = true;
                break;
            }
        }
        expect(moved).toBe(true);
    });
    it('is deterministic for identical inputs', () => {
        const a = gameWithCat({ activity: 'wandering', sleep: 5, tileX: 3, tileY: 1 });
        const b = structuredClone(a);
        expect(step(a, 250, clockAt(7777))).toEqual(step(b, 250, clockAt(7777)));
    });
});
