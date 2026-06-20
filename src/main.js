import { createCat } from './game/cats.js';
import { step } from './game/simulation.js';
import { load, save } from './game/persistence.js';
import { renderScene, catAtPoint, triggerPet, triggerFloat } from './ui/renderer.js';
import { createHud } from './ui/hud.js';
import { openShopModal, openLookupModal } from './ui/modals.js';
import { SystemClock } from './platform/clock.js';
import { LocalStorageAdapter } from './platform/storage.js';
import { createAutosave } from './platform/autosave.js';
import { createAudio, createWebAudioBackend } from './audio/audio.js';
import { createIntro } from './ui/intro.js';
const clock = SystemClock;
const storage = LocalStorageAdapter;
let state = load(storage, clock);
ensureStarterCat();
const autosave = createAutosave(() => save(state, storage, clock), 500);
function persist() {
    autosave.schedule();
}
const audio = createAudio(() => state.settings, createWebAudioBackend());
let selectedCatId = state.cats[0]?.id ?? null;
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const hudRoot = document.getElementById('ui');
const modalRoot = document.getElementById('modal-root');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Dedicated bottom HUD bar so it stays pinned to the bottom rather than filling the
// full-screen overlay root.
const hudBar = document.createElement('div');
hudRoot.append(hudBar);
function ensureStarterCat() {
    if (state.cats.length === 0 && !state.player.firstCatClaimed) {
        const first = state.shop.adoptableCats[0] ?? createCat(Date.now());
        state.cats.push(structuredClone(first));
        state.player.firstCatClaimed = true;
    }
}
function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
const hud = createHud(hudBar, {
    getState: () => state,
    setState: (s) => {
        state = s;
    },
    getSelectedCatId: () => selectedCatId,
    onLookup: (catId) => {
        selectedCatId = catId;
        openLookupModal(modalRoot, {
            getCat: () => state.cats.find((c) => c.id === catId),
        });
    },
    playSfx: (name) => {
        audio.playSfx(name);
    },
    onPet: (catId) => {
        triggerPet(catId);
    },
    onFloat: (catId, emojis) => {
        triggerFloat(catId, emojis);
    },
    onChange: () => {
        hud.render();
        persist();
    },
});
const shopBtn = document.createElement('button');
shopBtn.type = 'button';
shopBtn.className = 'shop-open-btn';
shopBtn.textContent = '🛒 Shop';
hudRoot.append(shopBtn);
let shopOpen = false;
shopBtn.addEventListener('click', () => {
    if (shopOpen)
        return;
    shopOpen = true;
    const handle = openShopModal(modalRoot, {
        getState: () => state,
        setState: (s) => {
            state = s;
        },
        clock,
        onChange: () => {
            hud.render();
            persist();
        },
        onClose: () => {
            shopOpen = false;
        },
    });
    void handle;
});
function logicalSize() {
    const dpr = window.devicePixelRatio || 1;
    return { width: canvas.width / dpr, height: canvas.height / dpr };
}
canvas.addEventListener('click', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    const cat = catAtPoint(logicalSize(), state, px, py);
    if (cat) {
        selectedCatId = cat.id;
        hud.applyToCat(cat.id);
        hud.render();
    }
});
canvas.tabIndex = 0;
canvas.setAttribute('role', 'application');
canvas.setAttribute('aria-label', 'Home with your cats');
canvas.addEventListener('keydown', (ev) => {
    if (state.cats.length === 0)
        return;
    if (ev.key === 'Tab')
        return;
    const idx = state.cats.findIndex((c) => c.id === selectedCatId);
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
        selectedCatId = state.cats[(idx + 1 + state.cats.length) % state.cats.length].id;
        hud.render();
        ev.preventDefault();
    }
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
        selectedCatId = state.cats[(idx - 1 + state.cats.length) % state.cats.length].id;
        hud.render();
        ev.preventDefault();
    }
    else if ((ev.key === 'Enter' || ev.key === ' ') && selectedCatId) {
        hud.applyToCat(selectedCatId);
        ev.preventDefault();
    }
});
let last = performance.now();
let meowTimer = 0;
function frame(nowMs) {
    const delta = nowMs - last;
    last = nowMs;
    state = step(state, delta, clock);
    // Random calm meows from awake cats.
    meowTimer -= delta;
    if (meowTimer <= 0) {
        meowTimer = 8000 + Math.random() * 12000;
        if (state.cats.some((c) => c.activity !== 'sleeping')) {
            audio.playSfx('meow');
        }
    }
    renderScene(ctx, logicalSize(), state, {
        selectedCatId,
        reducedMotion,
        timeMs: nowMs,
    });
    hud.renderStats();
    requestAnimationFrame(frame);
}
const intro = createIntro(modalRoot, {
    getSettings: () => state.settings,
    setMusicEnabled: (enabled) => {
        state = { ...state, settings: { ...state.settings, musicEnabled: enabled } };
        audio.syncMusic();
        persist();
    },
    setSfxEnabled: (enabled) => {
        state = { ...state, settings: { ...state.settings, sfxEnabled: enabled } };
        persist();
    },
    onStart: () => {
        audio.markStarted();
        audio.syncMusic();
        canvas.focus();
    },
});
window.addEventListener('resize', resize);
window.addEventListener('pagehide', () => autosave.flush());
window.addEventListener('beforeunload', () => autosave.flush());
// Periodic background save so long sessions persist simulation drift.
setInterval(() => persist(), 30_000);
resize();
hud.render();
intro.show();
persist();
requestAnimationFrame(frame);
