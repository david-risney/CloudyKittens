import type { GameState, Cat, Personality } from './types.js';
import type { ClockPort } from './ports.js';
import { makeRng } from './cats.js';
import {
  HUNGER_MAX,
  HUNGER_RISE_PER_MS,
  SLEEP_MAX,
  SLEEP_FALL_ASLEEP,
  SLEEP_WAKE,
  SLEEP_RISE_PER_MS,
  SLEEP_RECOVER_PER_MS,
  GRID_MIN,
  GRID_MAX,
} from './constants.js';

function clone(state: GameState): GameState {
  return structuredClone(state);
}

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clampGrid(v: number): number {
  return Math.max(GRID_MIN, Math.min(GRID_MAX, v));
}

/** How a personality expresses itself through autonomous behaviour. */
interface Behavior {
  /** Probability of pausing (sitting) instead of wandering, each mood check. */
  sitChance: number;
  /** Tiles advanced toward the roam target per wandering step (higher = faster). */
  stepTiles: number;
  /** How long a roam target is held before re-picking (lower = more restless). */
  targetBucketMs: number;
  /** Tiredness accrual multiplier (higher = sleeps sooner / more often). */
  sleepRiseMul: number;
}

const PERSONALITY_BEHAVIOR: Record<Personality, Behavior> = {
  // Bouncy and energetic: rarely settles, frequently changes direction.
  playful: { sitChance: 0.06, stepTiles: 1, targetBucketMs: 1500, sleepRiseMul: 0.9 },
  // Purposeful stalker: covers ground fast, commits to a target.
  hunter: { sitChance: 0.12, stepTiles: 2, targetBucketMs: 4500, sleepRiseMul: 1.0 },
  // Restless and erratic: darts around, re-targets constantly.
  savage: { sitChance: 0.06, stepTiles: 2, targetBucketMs: 1000, sleepRiseMul: 1.1 },
  // Calm and affectionate: loves to sit and watch.
  cute: { sitChance: 0.45, stepTiles: 1, targetBucketMs: 3000, sleepRiseMul: 1.0 },
  // Lazy: rests often and tires quickly, so it naps a lot.
  sleepy: { sitChance: 0.6, stepTiles: 1, targetBucketMs: 3500, sleepRiseMul: 1.6 },
};

function behaviorFor(cat: Cat): Behavior {
  return PERSONALITY_BEHAVIOR[cat.personality] ?? PERSONALITY_BEHAVIOR.cute;
}

/** Move a wandering cat toward a per-cat target that changes over time. */
function moveWanderer(cat: Cat, nowMs: number, behavior: Behavior): void {
  const bucket = Math.floor(nowMs / behavior.targetBucketMs);
  const rng = makeRng(hashId(cat.id) ^ bucket);
  const targetX = clampGrid(GRID_MIN + Math.floor(rng() * (GRID_MAX - GRID_MIN + 1)));
  const targetY = clampGrid(GRID_MIN + Math.floor(rng() * (GRID_MAX - GRID_MIN + 1)));
  for (let i = 0; i < behavior.stepTiles; i++) {
    if (cat.tileX < targetX) cat.tileX++;
    else if (cat.tileX > targetX) cat.tileX--;
    if (cat.tileY < targetY) cat.tileY++;
    else if (cat.tileY > targetY) cat.tileY--;
  }
}

function stepCat(cat: Cat, deltaMs: number, nowMs: number): void {
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
  } else {
    cat.activity = 'wandering';
    moveWanderer(cat, nowMs, behavior);
  }
}

/** Advance the simulation by deltaMs. Pure given inputs (movement uses clock.now()). */
export function step(state: GameState, deltaMs: number, clock: ClockPort): GameState {
  if (deltaMs <= 0) return state;
  const next = clone(state);
  const nowMs = clock.now();
  for (const cat of next.cats) {
    stepCat(cat, deltaMs, nowMs);
  }
  return next;
}

/** Accrue hunger (and tiredness) for time elapsed since the game was last saved. */
export function applyElapsedSinceLastSeen(state: GameState, clock: ClockPort): GameState {
  const elapsed = clock.now() - state.lastSeen;
  if (elapsed <= 0) return state;
  const next = clone(state);
  for (const cat of next.cats) {
    cat.hunger = Math.min(HUNGER_MAX, cat.hunger + HUNGER_RISE_PER_MS * elapsed);
  }
  next.lastSeen = clock.now();
  return next;
}
