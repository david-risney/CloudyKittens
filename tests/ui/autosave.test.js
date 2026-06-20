import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAutosave } from '../../src/platform/autosave.js';
import { save, load } from '../../src/game/persistence.js';
import { newGame } from '../../src/game/state.js';
import { createMemoryStorage } from '../../src/platform/storage.js';
function clockFor(now = 1_000_000) {
    return { now: () => now, today: () => '2026-06-15' };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
describe('autosave wiring', () => {
    it('debounces many schedule() calls into a single save', () => {
        const doSave = vi.fn();
        const auto = createAutosave(doSave, 500);
        auto.schedule();
        auto.schedule();
        auto.schedule();
        expect(doSave).not.toHaveBeenCalled();
        vi.advanceTimersByTime(500);
        expect(doSave).toHaveBeenCalledTimes(1);
    });
    it('flush() saves immediately when a save is pending', () => {
        const doSave = vi.fn();
        const auto = createAutosave(doSave, 500);
        auto.schedule();
        auto.flush();
        expect(doSave).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(500);
        expect(doSave).toHaveBeenCalledTimes(1);
    });
    it('a state-changing action persists state that startup load restores', () => {
        const storage = createMemoryStorage();
        const clock = clockFor();
        let state = newGame(clock);
        const auto = createAutosave(() => save(state, storage, clock), 500);
        state = { ...state, player: { ...state.player, money: 777 } };
        auto.schedule();
        vi.advanceTimersByTime(500);
        const restored = load(storage, clock);
        expect(restored.player.money).toBe(777);
    });
});
