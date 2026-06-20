import { SAVE_VERSION } from './types.js';
import { newGame } from './state.js';
import { applyElapsedSinceLastSeen } from './simulation.js';
import { refreshIfNewDay } from './shop.js';
import { SAVE_KEY, HOME_CAPACITY } from './constants.js';
export { SAVE_KEY };
/** Structural/invariant validation guarding against corrupt or hand-edited saves. */
function isValidState(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const s = value;
    if (s.version !== SAVE_VERSION)
        return false;
    if (!Array.isArray(s.cats))
        return false;
    if (s.cats.length > HOME_CAPACITY)
        return false;
    if (typeof s.lastSeen !== 'number' || !Number.isFinite(s.lastSeen))
        return false;
    const player = s.player;
    if (!player || typeof player !== 'object')
        return false;
    if (typeof player.money !== 'number' || player.money < 0)
        return false;
    if (typeof player.inventory !== 'object' || player.inventory === null)
        return false;
    if (typeof player.firstCatClaimed !== 'boolean')
        return false;
    const shop = s.shop;
    if (!shop || typeof shop !== 'object')
        return false;
    if (typeof shop.lastShopDay !== 'string')
        return false;
    if (!Array.isArray(shop.adoptableCats))
        return false;
    const settings = s.settings;
    if (!settings || typeof settings !== 'object')
        return false;
    if (typeof settings.musicEnabled !== 'boolean')
        return false;
    if (typeof settings.sfxEnabled !== 'boolean')
        return false;
    return true;
}
/** Serialize and persist the game state, stamping lastSeen with the current time. */
export function save(state, storage, clock) {
    const toStore = { ...state, lastSeen: clock.now() };
    try {
        storage.write(SAVE_KEY, JSON.stringify(toStore));
    }
    catch {
        /* serialization should never fail for plain state; ignore to stay calm */
    }
}
/**
 * Load and rehydrate game state. On missing, corrupt, or invalid data this returns a
 * fresh game (never throws). Valid saves accrue offline hunger and refresh the daily shop.
 */
export function load(storage, clock) {
    let raw = null;
    try {
        raw = storage.read(SAVE_KEY);
    }
    catch {
        raw = null;
    }
    if (raw === null)
        return newGame(clock);
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return newGame(clock);
    }
    if (!isValidState(parsed))
        return newGame(clock);
    let state = parsed;
    state = applyElapsedSinceLastSeen(state, clock);
    state = refreshIfNewDay(state, clock);
    return state;
}
