import { describe, it, expect, beforeEach } from 'vitest';
import { openLookupModal } from '../../src/ui/modals.js';
import { createCat } from '../../src/game/cats.js';
let root;
let cat;
beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    document.body.append(root);
    cat = { ...createCat(321), trust: 40, hunger: 20, sleep: 10, likes: { salmon: 6 } };
});
describe('lookup modal', () => {
    it('renders the cat name, breed, personality, likes, and live stats in book pages', () => {
        openLookupModal(root, { getCat: () => cat });
        expect(root.querySelector('.lookup-name')?.textContent).toBe(cat.name);
        expect(root.querySelector('.lookup-breed')?.textContent).toContain(cat.breed);
        expect(root.querySelector('.lookup-personality')?.textContent).toContain(cat.personality);
        expect(root.querySelector('.lookup-likes')?.textContent).toContain('Salmon');
        expect(root.querySelector('.lookup-trust')?.textContent).toContain('40');
        expect(root.querySelector('.lookup-hunger')?.textContent).toContain('20');
        expect(root.querySelector('.lookup-sleep')?.textContent).toContain('10');
        expect(root.querySelectorAll('.book-page').length).toBeGreaterThanOrEqual(2);
    });
    it('closes via the Close button', () => {
        const h = openLookupModal(root, { getCat: () => cat });
        root.querySelector('.modal-close').click();
        expect(root.querySelector('.modal-overlay')).toBeNull();
        void h;
    });
    it('closes via the Escape key', () => {
        openLookupModal(root, { getCat: () => cat });
        const dialog = root.querySelector('.lookup-modal');
        dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(root.querySelector('.modal-overlay')).toBeNull();
    });
});
