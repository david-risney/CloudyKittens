import { describe, it, expect } from 'vitest';
import { save, load, SAVE_KEY } from '../../src/game/persistence.js';
import { newGame } from '../../src/game/state.js';
import { createMemoryStorage } from '../../src/platform/storage.js';
import { DAILY_CAT_COUNT } from '../../src/game/constants.js';
function clockFor(today = '2026-06-15', now = 1_000_000) {
    return { now: () => now, today: () => today };
}
describe('persistence', () => {
    it('round-trips state through save/load', () => {
        const storage = createMemoryStorage();
        const clock = clockFor();
        const s = newGame(clock);
        s.player.money = 250;
        save(s, storage, clock);
        const loaded = load(storage, clock);
        expect(loaded.player.money).toBe(250);
        expect(loaded.shop.adoptableCats).toHaveLength(DAILY_CAT_COUNT);
    });
    it('stamps lastSeen on save', () => {
        const storage = createMemoryStorage();
        const s = newGame(clockFor('2026-06-15', 1000));
        save(s, storage, clockFor('2026-06-15', 9999));
        const raw = JSON.parse(storage.read(SAVE_KEY));
        expect(raw.lastSeen).toBe(9999);
    });
    it('returns a fresh game when no save exists', () => {
        const storage = createMemoryStorage();
        const loaded = load(storage, clockFor());
        expect(loaded.cats).toEqual([]);
        expect(loaded.player.firstCatClaimed).toBe(false);
    });
    it('falls back to a fresh game on corrupt JSON without throwing', () => {
        const storage = createMemoryStorage({ [SAVE_KEY]: '{not valid json' });
        expect(() => load(storage, clockFor())).not.toThrow();
        const loaded = load(storage, clockFor());
        expect(loaded.player.firstCatClaimed).toBe(false);
    });
    it('falls back to a fresh game when invariants fail', () => {
        const storage = createMemoryStorage({
            [SAVE_KEY]: JSON.stringify({ version: 1, cats: [], player: { money: -5 } }),
        });
        const loaded = load(storage, clockFor());
        expect(loaded.player.money).toBeGreaterThanOrEqual(0);
    });
    it('accrues offline hunger and refreshes the shop on load', () => {
        const storage = createMemoryStorage();
        const saveClock = clockFor('2026-06-15', 0);
        const s = newGame(saveClock);
        s.cats.push({ ...s.shop.adoptableCats[0], hunger: 5 });
        save(s, storage, saveClock);
        const loadClock = clockFor('2026-06-16', 20 * 60 * 1000);
        const loaded = load(storage, loadClock);
        expect(loaded.cats[0].hunger).toBeGreaterThan(5);
        expect(loaded.shop.lastShopDay).toBe('2026-06-16');
    });
});
