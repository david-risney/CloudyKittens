import { describe, it, expect, beforeEach } from 'vitest';
import { openShopModal } from '../../src/ui/modals.js';
import { newGame } from '../../src/game/state.js';
import { DAILY_CAT_COUNT } from '../../src/game/constants.js';
function clockFor() {
    return { now: () => 1_000_000, today: () => '2026-06-15' };
}
let root;
let state;
beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    document.body.append(root);
    state = newGame(clockFor());
});
function mount() {
    return openShopModal(root, {
        getState: () => state,
        setState: (s) => {
            state = s;
        },
        clock: clockFor(),
        onChange: () => { },
    });
}
describe('shop modal', () => {
    it('shows exactly the 5 adoptable cats for the day', () => {
        mount();
        const adoptBtns = root.querySelectorAll('.shop-adopt');
        expect(adoptBtns).toHaveLength(DAILY_CAT_COUNT);
    });
    it('adopts the first cat for free and removes it from the list', () => {
        const handle = mount();
        const before = state.shop.adoptableCats.length;
        root.querySelector('.shop-adopt').click();
        expect(state.cats).toHaveLength(1);
        expect(state.player.firstCatClaimed).toBe(true);
        expect(state.shop.adoptableCats.length).toBe(before - 1);
        handle.close();
        expect(root.querySelector('.modal-overlay')).toBeNull();
    });
    it('buys an item, deducting coins and adding to inventory', () => {
        mount();
        state.player.money = 100;
        const buyBtn = root.querySelector('.shop-buy');
        const item = buyBtn.dataset.item;
        const have = state.player.inventory[item] ?? 0;
        buyBtn.click();
        expect(state.player.inventory[item]).toBe(have + 1);
        expect(state.player.money).toBeLessThan(100);
    });
    it('gives gentle messaging when a purchase is unaffordable', () => {
        mount();
        state.player.money = 0;
        root.querySelector('.shop-buy').click();
        const status = root.querySelector('.modal-status');
        expect(status.textContent).toMatch(/coins/i);
    });
});
