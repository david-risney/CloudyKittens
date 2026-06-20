import { describe, it, expect, beforeEach } from 'vitest';
import { createIntro } from '../../src/ui/intro.js';
let root;
let settings;
let saved;
beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    document.body.append(root);
    settings = { musicEnabled: true, sfxEnabled: true };
    saved = 0;
});
function mount(onStart = () => { }) {
    return createIntro(root, {
        getSettings: () => settings,
        setMusicEnabled: (b) => {
            settings.musicEnabled = b;
            saved++;
        },
        setSfxEnabled: (b) => {
            settings.sfxEnabled = b;
            saved++;
        },
        onStart,
    });
}
describe('intro screen', () => {
    it('shows the title, designer credit, cat face, Start and Settings', () => {
        mount();
        expect(root.querySelector('.intro-title')?.textContent).toBe('Cloudy Kittens');
        expect(root.querySelector('.intro-credit')?.textContent).toBe('Elisabeth Risney');
        expect(root.querySelector('canvas.intro-cat')).not.toBeNull();
        expect(root.querySelector('.intro-start')).not.toBeNull();
        expect(root.querySelector('.intro-settings')).not.toBeNull();
    });
    it('hides the intro and calls onStart when Start is pressed', () => {
        let started = false;
        const handle = mount(() => {
            started = true;
        });
        handle.show();
        root.querySelector('.intro-start').click();
        expect(started).toBe(true);
        expect(handle.root.hidden).toBe(true);
    });
    it('binds the music and sfx toggles to settings and persists changes', () => {
        mount();
        root.querySelector('.intro-settings').click();
        const music = root.querySelector('.toggle-music');
        const sfx = root.querySelector('.toggle-sfx');
        expect(music.checked).toBe(true);
        music.checked = false;
        music.dispatchEvent(new Event('change'));
        expect(settings.musicEnabled).toBe(false);
        sfx.checked = false;
        sfx.dispatchEvent(new Event('change'));
        expect(settings.sfxEnabled).toBe(false);
        expect(saved).toBe(2);
    });
});
