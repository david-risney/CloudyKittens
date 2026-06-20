export function createAudio(getSettings, backend) {
    let started = false;
    let musicPlaying = false;
    function startMusic() {
        if (!started)
            return; // must wait for the user gesture
        if (!getSettings().musicEnabled)
            return;
        if (musicPlaying)
            return;
        backend.startMusic();
        musicPlaying = true;
    }
    function stopMusic() {
        if (!musicPlaying)
            return;
        backend.stopMusic();
        musicPlaying = false;
    }
    return {
        startMusic,
        stopMusic,
        playSfx(name) {
            if (!started)
                return;
            if (!getSettings().sfxEnabled)
                return;
            backend.playOneShot(name);
        },
        markStarted() {
            started = true;
        },
        syncMusic() {
            if (getSettings().musicEnabled)
                startMusic();
            else
                stopMusic();
        },
    };
}
/**
 * Web Audio backend. Background music streams a calm, Creative-Commons-licensed
 * track ("calm bgm" by syncopika, CC-BY 3.0 — see assets/CREDITS.md); if that file
 * cannot be loaded or decoded, it falls back to a soft synthesized chord so audio
 * still degrades gracefully. Sound effects are short synthesized blips.
 */
export function createWebAudioBackend() {
    const MUSIC_URL = new URL('../../public/audio/calm-bgm.ogg', import.meta.url).href;
    const MUSIC_GAIN = 0.22;
    let ctx = null;
    let buffer = null;
    let loading = false;
    let wantMusic = false;
    let source = null;
    let musicGain = null;
    let fallbackNodes = [];
    function ensureCtx() {
        if (ctx)
            return ctx;
        try {
            const Ctor = window.AudioContext ?? window.webkitAudioContext;
            if (!Ctor)
                return null;
            ctx = new Ctor();
            return ctx;
        }
        catch {
            return null;
        }
    }
    function isPlaying() {
        return source !== null || fallbackNodes.length > 0;
    }
    function playBuffer(ac, buf) {
        const src = ac.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const gain = ac.createGain();
        gain.gain.value = MUSIC_GAIN;
        src.connect(gain).connect(ac.destination);
        src.start();
        source = src;
        musicGain = gain;
    }
    /** Soft three-note pad with a slow tremolo — only used if the track fails to load. */
    function playFallback(ac) {
        const gain = ac.createGain();
        gain.gain.value = 0.05;
        gain.connect(ac.destination);
        musicGain = gain;
        const lfo = ac.createOscillator();
        const lfoGain = ac.createGain();
        lfo.frequency.value = 0.15;
        lfoGain.gain.value = 0.025;
        lfo.connect(lfoGain).connect(gain.gain);
        lfo.start();
        const voices = [lfo];
        for (const freq of [196, 261.63, 329.63]) {
            const osc = ac.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            osc.start();
            voices.push(osc);
        }
        fallbackNodes = voices;
    }
    return {
        startMusic() {
            const ac = ensureCtx();
            if (!ac || isPlaying())
                return;
            wantMusic = true;
            if (buffer) {
                playBuffer(ac, buffer);
                return;
            }
            if (loading)
                return;
            loading = true;
            fetch(MUSIC_URL)
                .then((res) => res.arrayBuffer())
                .then((data) => ac.decodeAudioData(data))
                .then((buf) => {
                loading = false;
                buffer = buf;
                if (wantMusic && !isPlaying())
                    playBuffer(ac, buf);
            })
                .catch(() => {
                loading = false;
                if (wantMusic && !isPlaying())
                    playFallback(ac);
            });
        },
        stopMusic() {
            wantMusic = false;
            if (source) {
                try {
                    source.stop();
                    source.disconnect();
                }
                catch {
                    /* already stopped */
                }
                source = null;
            }
            for (const node of fallbackNodes) {
                try {
                    node.stop();
                    node.disconnect();
                }
                catch {
                    /* already stopped */
                }
            }
            fallbackNodes = [];
            if (musicGain) {
                try {
                    musicGain.disconnect();
                }
                catch {
                    /* already disconnected */
                }
                musicGain = null;
            }
        },
        playOneShot(name) {
            const ac = ensureCtx();
            if (!ac)
                return;
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            const freq = name === 'feed' ? 440 : name === 'toy' ? 660 : name === 'pet' ? 520 : 380;
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const now = ac.currentTime;
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            osc.connect(gain).connect(ac.destination);
            osc.start(now);
            osc.stop(now + 0.26);
        },
    };
}
