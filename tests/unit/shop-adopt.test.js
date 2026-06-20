import { describe, it, expect } from 'vitest';
import { adopt } from '../../src/game/shop.js';
import { newGame } from '../../src/game/state.js';
import { CAT_COST, HOME_CAPACITY } from '../../src/game/constants.js';
function clockFor(today = '2026-06-15') {
    return { now: () => 1_000_000, today: () => today };
}
describe('adopt', () => {
    it('grants the first cat free and removes it from the roster', () => {
        const s = newGame(clockFor());
        const before = s.player.money;
        const r = adopt(s, 0, clockFor());
        expect(r.adopted).toBe(true);
        expect(r.state.cats).toHaveLength(1);
        expect(r.state.player.money).toBe(before);
        expect(r.state.player.firstCatClaimed).toBe(true);
        expect(r.state.shop.adoptableCats).toHaveLength(4);
    });
    it('charges CAT_COST for subsequent adoptions', () => {
        let s = newGame(clockFor());
        s = adopt(s, 0, clockFor()).state;
        const before = s.player.money;
        const r = adopt(s, 0, clockFor());
        expect(r.adopted).toBe(true);
        expect(r.state.player.money).toBe(before - CAT_COST);
    });
    it("blocks adoption when broke with reason 'no-funds'", () => {
        let s = newGame(clockFor());
        s = adopt(s, 0, clockFor()).state; // free
        s.player.money = 0;
        const r = adopt(s, 0, clockFor());
        expect(r.adopted).toBe(false);
        expect(r.reason).toBe('no-funds');
    });
    it("blocks adoption at home capacity with reason 'full'", () => {
        const s = newGame(clockFor());
        s.player.money = 10_000;
        s.player.firstCatClaimed = true;
        // Fill the home to capacity directly (a single day's roster is smaller than capacity).
        for (let i = 0; i < HOME_CAPACITY; i++) {
            s.cats.push(structuredClone(s.shop.adoptableCats[0]));
        }
        expect(s.cats).toHaveLength(HOME_CAPACITY);
        const r = adopt(s, 0, clockFor());
        expect(r.adopted).toBe(false);
        expect(r.reason).toBe('full');
    });
    it('is a no-op for an out-of-range index', () => {
        const s = newGame(clockFor());
        const r = adopt(s, 99, clockFor());
        expect(r.adopted).toBe(false);
        expect(r.state).toBe(s);
    });
});
