import { generateRoster } from './state.js';
import { isNewDay } from './day.js';
import { ITEMS } from './items.js';
import { CAT_COST, HOME_CAPACITY } from './constants.js';
function clone(state) {
    return structuredClone(state);
}
/** Regenerate the daily 5-cat roster when the calendar date has changed. */
export function refreshIfNewDay(state, clock) {
    if (!isNewDay(state.shop.lastShopDay, clock))
        return state;
    const today = clock.today();
    const next = clone(state);
    next.shop.lastShopDay = today;
    next.shop.adoptableCats = generateRoster(today);
    return next;
}
/**
 * Adopt the cat at catIndex from today's roster. First adoption is free; subsequent
 * adoptions cost CAT_COST. Blocked at HOME_CAPACITY ('full') or insufficient money
 * ('no-funds'). Adopted cats are removed from the roster.
 */
export function adopt(state, catIndex, clock) {
    const synced = refreshIfNewDay(state, clock);
    const roster = synced.shop.adoptableCats;
    if (catIndex < 0 || catIndex >= roster.length) {
        return { state: synced, adopted: false };
    }
    if (synced.cats.length >= HOME_CAPACITY) {
        return { state: synced, adopted: false, reason: 'full' };
    }
    const free = !synced.player.firstCatClaimed;
    const cost = free ? 0 : CAT_COST;
    if (synced.player.money < cost) {
        return { state: synced, adopted: false, reason: 'no-funds' };
    }
    const next = clone(synced);
    const [cat] = next.shop.adoptableCats.splice(catIndex, 1);
    next.cats.push(cat);
    next.player.money -= cost;
    next.player.firstCatClaimed = true;
    return { state: next, adopted: true };
}
/** Buy one of an item, deducting its catalog price. Blocked when unaffordable. */
export function buyItem(state, item) {
    const price = ITEMS[item].price;
    if (state.player.money < price) {
        return { state, bought: false };
    }
    const next = clone(state);
    next.player.money -= price;
    next.player.inventory[item] = (next.player.inventory[item] ?? 0) + 1;
    return { state: next, bought: true };
}
