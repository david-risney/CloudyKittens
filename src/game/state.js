import { SAVE_VERSION } from './types.js';
import { createCat } from './cats.js';
import { START_MONEY, DAILY_CAT_COUNT, STARTER_INVENTORY } from './constants.js';
export * from './types.js';
/** Deterministic numeric seed from a 'YYYY-MM-DD' date string. */
export function seedFromDate(date) {
    let h = 2166136261;
    for (let i = 0; i < date.length; i++) {
        h ^= date.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
/** Generate the deterministic daily roster of adoptable cats for a given date. */
export function generateRoster(date) {
    const base = seedFromDate(date);
    const roster = [];
    for (let i = 0; i < DAILY_CAT_COUNT; i++) {
        roster.push(createCat(base + i * 7919));
    }
    return roster;
}
/** Fresh game state for a brand-new player. */
export function newGame(clock) {
    const today = clock.today();
    return {
        version: SAVE_VERSION,
        cats: [],
        player: {
            money: START_MONEY,
            inventory: { ...STARTER_INVENTORY },
            firstCatClaimed: false,
        },
        shop: {
            lastShopDay: today,
            adoptableCats: generateRoster(today),
        },
        settings: {
            musicEnabled: true,
            sfxEnabled: true,
        },
        lastSeen: clock.now(),
    };
}
