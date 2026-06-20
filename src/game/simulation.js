import { makeRng } from './cats.js';
import { HUNGER_MAX, HUNGER_RISE_PER_MS, SLEEP_MAX, SLEEP_FALL_ASLEEP, SLEEP_WAKE, SLEEP_RISE_PER_MS, SLEEP_RECOVER_PER_MS, GRID_MIN, GRID_MAX, } from './constants.js';
function clone(state) {
    return structuredClone(state);
}
function hashId(id) {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) {
        h ^= id.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function clampGrid(v) {
    return Math.max(GRID_MIN, Math.min(GRID_MAX, v));
}
const PERSONALITY_BEHAVIOR = {
    // Bouncy and energetic: steps often, rarely settles.
    playful: { sitChance: 0.06, stepIntervalMs: 800, sleepRiseMul: 0.9 },
    // Purposeful prowler: covers ground with brisk, steady steps.
    hunter: { sitChance: 0.12, stepIntervalMs: 850, sleepRiseMul: 1.0 },
    // Restless and erratic: quick little steps, almost never sits.
    savage: { sitChance: 0.06, stepIntervalMs: 750, sleepRiseMul: 1.1 },
    // Calm and affectionate: ambles gently and loves to sit.
    cute: { sitChance: 0.45, stepIntervalMs: 1100, sleepRiseMul: 1.0 },
    // Lazy: rests often and tires quickly, so it naps a lot.
    sleepy: { sitChance: 0.6, stepIntervalMs: 1400, sleepRiseMul: 1.6 },
};
function behaviorFor(cat) {
    return PERSONALITY_BEHAVIOR[cat.personality] ?? PERSONALITY_BEHAVIOR.cute;
}
// Eight-way single-tile steps (cardinals + diagonals) for a gentle random walk.
const WALK_DIRS = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, -1], [1, -1], [-1, 1],
];
/**
 * Take at most one single-tile step on a paced cadence so the cat strolls tile by
 * tile (easy to follow) instead of teleporting toward a distant target. Stateless
 * and deterministic: a step lands on the first frame of each step interval.
 */
function moveWanderer(cat, nowMs, deltaMs, behavior) {
    if (nowMs % behavior.stepIntervalMs >= deltaMs)
        return;
    const stepIdx = Math.floor(nowMs / behavior.stepIntervalMs);
    const rng = makeRng(hashId(cat.id) ^ stepIdx);
    const [dx, dy] = WALK_DIRS[Math.floor(rng() * WALK_DIRS.length)];
    cat.tileX = clampGrid(cat.tileX + dx);
    cat.tileY = clampGrid(cat.tileY + dy);
}
function stepCat(cat, deltaMs, nowMs) {
    const behavior = behaviorFor(cat);
    // Hunger always rises over time (FR-010a).
    cat.hunger = Math.min(HUNGER_MAX, cat.hunger + HUNGER_RISE_PER_MS * deltaMs);
    if (cat.activity === 'sleeping') {
        cat.sleep = Math.max(0, cat.sleep - SLEEP_RECOVER_PER_MS * deltaMs);
        if (cat.sleep <= SLEEP_WAKE) {
            cat.activity = 'wandering';
        }
        return;
    }
    // Awake: accrue tiredness (faster for sleepy personalities).
    cat.sleep = Math.min(SLEEP_MAX, cat.sleep + SLEEP_RISE_PER_MS * behavior.sleepRiseMul * deltaMs);
    if (cat.sleep >= SLEEP_FALL_ASLEEP) {
        cat.activity = 'sleeping';
        return;
    }
    // Occasionally pause (sit) vs wander, deterministic per time bucket + cat,
    // weighted by the cat's personality.
    const moodRng = makeRng(hashId(cat.id) ^ Math.floor(nowMs / 1500));
    if (moodRng() < behavior.sitChance) {
        cat.activity = 'sitting';
    }
    else {
        cat.activity = 'wandering';
        moveWanderer(cat, nowMs, deltaMs, behavior);
    }
}
/** Advance the simulation by deltaMs. Pure given inputs (movement uses clock.now()). */
export function step(state, deltaMs, clock) {
    if (deltaMs <= 0)
        return state;
    const next = clone(state);
    const nowMs = clock.now();
    for (const cat of next.cats) {
        stepCat(cat, deltaMs, nowMs);
    }
    return next;
}
/** Accrue hunger (and tiredness) for time elapsed since the game was last saved. */
export function applyElapsedSinceLastSeen(state, clock) {
    const elapsed = clock.now() - state.lastSeen;
    if (elapsed <= 0)
        return state;
    const next = clone(state);
    for (const cat of next.cats) {
        cat.hunger = Math.min(HUNGER_MAX, cat.hunger + HUNGER_RISE_PER_MS * elapsed);
    }
    next.lastSeen = clock.now();
    return next;
}
