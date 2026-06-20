import { itemPreference } from './cats.js';
import { isFood, isToy } from './items.js';
import { TRUST_MIN, TRUST_MAX, HUNGER_MAX, FEED_HUNGER_REDUCTION, PET_TRUST_GAIN, MONEY_PER_TRUST, } from './constants.js';
function clampTrust(t) {
    return Math.max(TRUST_MIN, Math.min(TRUST_MAX, t));
}
function clone(state) {
    return structuredClone(state);
}
function findCat(state, catId) {
    return state.cats.find((c) => c.id === catId);
}
function moneyForTrust(trust) {
    if (trust <= 0)
        return 0;
    return Math.max(1, Math.round(trust * MONEY_PER_TRUST));
}
/**
 * Feed a food item to a cat. Foods are consumed. Feeding a full cat (hunger<=0) is
 * canceled. Trust changes by preference; a cat with positive resulting trust earns money
 * scaled by trust.
 */
export function feed(state, catId, item) {
    const noop = { state, consumed: false, moneyGained: 0, trustDelta: 0 };
    const current = findCat(state, catId);
    if (!current)
        return noop;
    if (!isFood(item))
        return noop;
    if ((state.player.inventory[item] ?? 0) <= 0)
        return noop;
    if (current.hunger <= 0)
        return noop; // already full → cancel (FR-005)
    const next = clone(state);
    const cat = findCat(next, catId);
    next.player.inventory[item] = (next.player.inventory[item] ?? 0) - 1;
    cat.hunger = Math.max(0, cat.hunger - FEED_HUNGER_REDUCTION);
    const trustDelta = itemPreference(cat, item);
    cat.trust = clampTrust(cat.trust + trustDelta);
    const moneyGained = moneyForTrust(cat.trust);
    next.player.money += moneyGained;
    return { state: next, consumed: true, moneyGained, trustDelta };
}
/** Use a toy on a cat. Toys are not consumed; trust changes by preference. */
export function useToy(state, catId, item) {
    const current = findCat(state, catId);
    if (!current)
        return state;
    if (!isToy(item))
        return state;
    const next = clone(state);
    const cat = findCat(next, catId);
    cat.trust = clampTrust(cat.trust + itemPreference(cat, item));
    return next;
}
/** Pet a cat to gently raise trust. */
export function pet(state, catId) {
    const current = findCat(state, catId);
    if (!current)
        return state;
    const next = clone(state);
    const cat = findCat(next, catId);
    cat.trust = clampTrust(cat.trust + PET_TRUST_GAIN);
    return next;
}
export { HUNGER_MAX };
