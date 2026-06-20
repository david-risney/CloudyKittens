import { feed, useToy, pet } from '../game/economy.js';
import { isFood, isToy, ITEMS } from '../game/items.js';
import { ALL_ITEM_IDS } from '../game/items.js';
/**
 * Pure dispatch: apply the current HUD selection to a target cat and describe the
 * resulting state plus any side effects for the presentation layer to perform.
 */
export function applySelectionToCat(state, selection, catId) {
    const base = { state, sfx: null, feedback: null, openLookupCatId: null, floatEmojis: null };
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
        // 🍗 marks the hunger drop; ❤️/💔 reflect the trust shift from preference.
        const emojis = ['🍗', trustEmoji(r.trustDelta)].filter(Boolean);
        return { ...base, state: r.state, sfx: 'feed', feedback: `Yum!${earned}`, floatEmojis: emojis };
    }
    if (isToy(item)) {
        const next = useToy(state, catId, item);
        const delta = catTrust(next, catId) - catTrust(state, catId);
        const emojis = [trustEmoji(delta) ?? '🧶'];
        return { ...base, state: next, sfx: 'toy', feedback: 'Playtime!', floatEmojis: emojis };
    }
    return base;
}
function catTrust(state, catId) {
    return state.cats.find((c) => c.id === catId)?.trust ?? 0;
}
function trustEmoji(delta) {
    if (delta > 0)
        return '❤️';
    if (delta < 0)
        return '💔';
    return null;
}
const ITEM_ORDER = [...ALL_ITEM_IDS];
const ACTIVITY_ICON = {
    wandering: '🐾',
    sitting: '🪑',
    sleeping: '💤',
};
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
/** Build the bottom HUD DOM and wire selection + dispatch. */
export function createHud(container, opts) {
    let selection = null;
    container.innerHTML = '';
    container.classList.add('hud');
    const money = document.createElement('div');
    money.className = 'hud-money';
    const catStats = document.createElement('div');
    catStats.className = 'hud-cat-stats';
    catStats.hidden = true;
    const items = document.createElement('div');
    items.className = 'hud-items';
    const actions = document.createElement('div');
    actions.className = 'hud-actions';
    const petBtn = makeButton('Pet', 'pet');
    const lookupBtn = makeButton('Lookup', 'lookup');
    actions.append(petBtn, lookupBtn);
    container.append(money, catStats, items, actions);
    function makeButton(label, key) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hud-btn';
        b.dataset.key = key;
        b.textContent = label;
        return b;
    }
    function statChip(icon, label, value) {
        const chip = document.createElement('span');
        chip.className = 'hud-stat';
        chip.title = label;
        chip.setAttribute('aria-label', `${label}: ${value}`);
        const ic = document.createElement('span');
        ic.className = 'hud-stat-icon';
        ic.setAttribute('aria-hidden', 'true');
        ic.textContent = icon;
        const val = document.createElement('span');
        val.className = 'hud-stat-value';
        val.textContent = String(value);
        chip.append(ic, val);
        return chip;
    }
    /** Show the currently selected cat's important stats as icons in the HUD. */
    function renderStats() {
        const id = opts.getSelectedCatId?.() ?? null;
        const cat = id ? opts.getState().cats.find((c) => c.id === id) : null;
        if (!cat) {
            catStats.hidden = true;
            catStats.replaceChildren();
            return;
        }
        catStats.hidden = false;
        const name = document.createElement('span');
        name.className = 'hud-cat-name';
        name.textContent = `🐈 ${cat.name}`;
        const activity = cat.activity;
        const activityChip = statChip(ACTIVITY_ICON[activity] ?? '🐈', 'Activity', capitalize(activity));
        activityChip.classList.add('hud-stat-activity');
        catStats.replaceChildren(name, statChip('❤️', 'Trust', Math.round(cat.trust)), statChip('🍗', 'Hunger', Math.round(cat.hunger)), statChip('😴', 'Sleepiness', Math.round(cat.sleep)), activityChip);
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
        renderStats();
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
        if (selection.kind === 'pet')
            opts.onPet?.(catId);
        if (outcome.floatEmojis?.length)
            opts.onFloat?.(catId, outcome.floatEmojis);
        render();
    }
    render();
    return { render, renderStats, getSelection: () => selection, applyToCat };
}
