import { feed, useToy, pet } from '../game/economy.js';
import { isFood, isToy, ITEMS } from '../game/items.js';
import { ALL_ITEM_IDS } from '../game/items.js';
/**
 * Pure dispatch: apply the current HUD selection to a target cat and describe the
 * resulting state plus any side effects for the presentation layer to perform.
 */
export function applySelectionToCat(state, selection, catId) {
    const base = { state, sfx: null, feedback: null, openLookupCatId: null };
    if (selection.kind === 'lookup') {
        return { ...base, openLookupCatId: catId };
    }
    if (selection.kind === 'pet') {
        return { ...base, state: pet(state, catId), sfx: 'pet' };
    }
    // selection.kind === 'item'
    const { item } = selection;
    if (isFood(item)) {
        const r = feed(state, catId, item);
        if (!r.consumed) {
            return { ...base, feedback: 'This cat is full right now.' };
        }
        const earned = r.moneyGained > 0 ? ` +${r.moneyGained}🪙` : '';
        return { ...base, state: r.state, sfx: 'feed', feedback: `Yum!${earned}` };
    }
    if (isToy(item)) {
        return { ...base, state: useToy(state, catId, item), sfx: 'toy', feedback: 'Playtime!' };
    }
    return base;
}
const ITEM_ORDER = [...ALL_ITEM_IDS];
/** Build the bottom HUD DOM and wire selection + dispatch. */
export function createHud(container, opts) {
    let selection = null;
    container.innerHTML = '';
    container.classList.add('hud');
    const money = document.createElement('div');
    money.className = 'hud-money';
    const items = document.createElement('div');
    items.className = 'hud-items';
    const actions = document.createElement('div');
    actions.className = 'hud-actions';
    const petBtn = makeButton('Pet', 'pet');
    const lookupBtn = makeButton('Lookup', 'lookup');
    actions.append(petBtn, lookupBtn);
    container.append(money, items, actions);
    function makeButton(label, key) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hud-btn';
        b.dataset.key = key;
        b.textContent = label;
        return b;
    }
    function setSelection(next) {
        selection = next;
        render();
    }
    petBtn.addEventListener('click', () => setSelection({ kind: 'pet' }));
    lookupBtn.addEventListener('click', () => setSelection({ kind: 'lookup' }));
    function selectionMatchesItem(item) {
        return selection?.kind === 'item' && selection.item === item;
    }
    function render() {
        const state = opts.getState();
        money.textContent = `🪙 ${state.player.money}`;
        items.innerHTML = '';
        for (const id of ITEM_ORDER) {
            const count = state.player.inventory[id] ?? 0;
            if (count <= 0)
                continue;
            const btn = makeButton(`${ITEMS[id].displayName} ×${count}`, `item:${id}`);
            btn.setAttribute('aria-pressed', String(selectionMatchesItem(id)));
            if (selectionMatchesItem(id))
                btn.classList.add('selected');
            btn.addEventListener('click', () => setSelection({ kind: 'item', item: id }));
            items.append(btn);
        }
        petBtn.setAttribute('aria-pressed', String(selection?.kind === 'pet'));
        lookupBtn.setAttribute('aria-pressed', String(selection?.kind === 'lookup'));
        petBtn.classList.toggle('selected', selection?.kind === 'pet');
        lookupBtn.classList.toggle('selected', selection?.kind === 'lookup');
    }
    function applyToCat(catId) {
        if (!selection)
            return;
        const outcome = applySelectionToCat(opts.getState(), selection, catId);
        if (outcome.openLookupCatId) {
            opts.onLookup(outcome.openLookupCatId);
            return;
        }
        if (outcome.state !== opts.getState()) {
            opts.setState(outcome.state);
            opts.onChange();
        }
        if (outcome.sfx)
            opts.playSfx(outcome.sfx);
        render();
    }
    render();
    return { render, getSelection: () => selection, applyToCat };
}
