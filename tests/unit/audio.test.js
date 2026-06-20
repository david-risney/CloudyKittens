import { describe, it, expect } from 'vitest';
import { createAudio } from '../../src/audio/audio.js';
function fakeBackend() {
    const calls = { startMusic: 0, stopMusic: 0, oneShots: [] };
    const backend = {
        startMusic: () => {
            calls.startMusic++;
        },
        stopMusic: () => {
            calls.stopMusic++;
        },
        playOneShot: (name) => {
            calls.oneShots.push(name);
        },
    };
    return { backend, calls };
}
describe('audio gating', () => {
    it('does not start music before the Start gesture', () => {
        const settings = { musicEnabled: true, sfxEnabled: true };
        const { backend, calls } = fakeBackend();
        const audio = createAudio(() => settings, backend);
        audio.startMusic();
        expect(calls.startMusic).toBe(0);
        audio.markStarted();
        audio.startMusic();
        expect(calls.startMusic).toBe(1);
    });
    it('respects musicEnabled', () => {
        const settings = { musicEnabled: false, sfxEnabled: true };
        const { backend, calls } = fakeBackend();
        const audio = createAudio(() => settings, backend);
        audio.markStarted();
        audio.startMusic();
        expect(calls.startMusic).toBe(0);
    });
    it('syncMusic stops music when disabled and starts it when enabled', () => {
        const settings = { musicEnabled: true, sfxEnabled: true };
        const { backend, calls } = fakeBackend();
        const audio = createAudio(() => settings, backend);
        audio.markStarted();
        audio.syncMusic();
        expect(calls.startMusic).toBe(1);
        settings.musicEnabled = false;
        audio.syncMusic();
        expect(calls.stopMusic).toBe(1);
    });
    it('plays sfx only when enabled and after start', () => {
        const settings = { musicEnabled: true, sfxEnabled: false };
        const { backend, calls } = fakeBackend();
        const audio = createAudio(() => settings, backend);
        audio.markStarted();
        audio.playSfx('feed');
        expect(calls.oneShots).toHaveLength(0);
        settings.sfxEnabled = true;
        audio.playSfx('feed');
        expect(calls.oneShots).toEqual(['feed']);
    });
    it('does not play sfx before the start gesture', () => {
        const settings = { musicEnabled: true, sfxEnabled: true };
        const { backend, calls } = fakeBackend();
        const audio = createAudio(() => settings, backend);
        audio.playSfx('pet');
        expect(calls.oneShots).toHaveLength(0);
    });
});
