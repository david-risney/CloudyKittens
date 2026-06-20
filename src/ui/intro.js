function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className)
        node.className = className;
    if (text !== undefined)
        node.textContent = text;
    return node;
}
/** Draw a simple large cat face onto a canvas (no external asset needed). */
function drawCatFace(canvas) {
    let ctx = null;
    try {
        ctx = canvas.getContext('2d');
    }
    catch {
        return;
    }
    if (!ctx)
        return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2 + 6;
    ctx.fillStyle = '#c79a72';
    // ears
    ctx.beginPath();
    ctx.moveTo(cx - 42, cy - 30);
    ctx.lineTo(cx - 22, cy - 64);
    ctx.lineTo(cx - 8, cy - 34);
    ctx.moveTo(cx + 42, cy - 30);
    ctx.lineTo(cx + 22, cy - 64);
    ctx.lineTo(cx + 8, cy - 34);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.ellipse(cx, cy, 50, 44, 0, 0, Math.PI * 2);
    ctx.fill();
    // eyes
    ctx.fillStyle = '#4a3826';
    ctx.beginPath();
    ctx.ellipse(cx - 18, cy - 4, 6, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 18, cy - 4, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // nose
    ctx.fillStyle = '#a86b5b';
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 10);
    ctx.lineTo(cx + 5, cy + 10);
    ctx.lineTo(cx, cy + 16);
    ctx.fill();
}
/** Build the intro screen with title, credit, cat face, Start and Settings. */
export function createIntro(root, opts) {
    const overlay = el('div', 'intro');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Cloudy Kittens');
    const title = el('h1', 'intro-title', 'Cloudy Kittens');
    const credit = el('p', 'intro-credit', 'Elisabeth Risney');
    const face = document.createElement('canvas');
    face.className = 'intro-cat';
    face.width = 140;
    face.height = 140;
    drawCatFace(face);
    const startBtn = el('button', 'intro-start', 'Start');
    startBtn.type = 'button';
    const settingsBtn = el('button', 'intro-settings', 'Settings');
    settingsBtn.type = 'button';
    const panel = el('div', 'intro-settings-panel');
    panel.hidden = true;
    const musicLabel = el('label', 'setting-row');
    const musicToggle = document.createElement('input');
    musicToggle.type = 'checkbox';
    musicToggle.className = 'toggle-music';
    musicLabel.append(musicToggle, document.createTextNode(' Music'));
    const sfxLabel = el('label', 'setting-row');
    const sfxToggle = document.createElement('input');
    sfxToggle.type = 'checkbox';
    sfxToggle.className = 'toggle-sfx';
    sfxLabel.append(sfxToggle, document.createTextNode(' Sound effects'));
    panel.append(musicLabel, sfxLabel);
    function syncToggles() {
        const s = opts.getSettings();
        musicToggle.checked = s.musicEnabled;
        sfxToggle.checked = s.sfxEnabled;
    }
    musicToggle.addEventListener('change', () => opts.setMusicEnabled(musicToggle.checked));
    sfxToggle.addEventListener('change', () => opts.setSfxEnabled(sfxToggle.checked));
    settingsBtn.addEventListener('click', () => {
        panel.hidden = !panel.hidden;
        if (!panel.hidden)
            syncToggles();
    });
    startBtn.addEventListener('click', () => {
        hide();
        opts.onStart();
    });
    overlay.append(title, credit, face, startBtn, settingsBtn, panel);
    root.append(overlay);
    function show() {
        overlay.hidden = false;
        syncToggles();
        startBtn.focus();
    }
    function hide() {
        overlay.hidden = true;
    }
    syncToggles();
    return { show, hide, root: overlay };
}
