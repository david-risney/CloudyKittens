// Balancing constants. Spec fixes only START_MONEY, CAT_COST, DAILY_CAT_COUNT, first cat
// free, and HOME_CAPACITY default; the rest are tunable defaults (see data-model.md).

export const START_MONEY = 100;
export const CAT_COST = 30;
export const DAILY_CAT_COUNT = 5;
export const HOME_CAPACITY = 6;

export const TRUST_MIN = -100;
export const TRUST_MAX = 100;

// Hunger: 0 = full, HUNGER_MAX = starving.
export const HUNGER_MAX = 100;
export const FEED_HUNGER_REDUCTION = 40;
// Full → starving over ~30 minutes of real time.
export const HUNGER_RISE_PER_MS = HUNGER_MAX / (30 * 60 * 1000);

// Sleep represents tiredness: 0 = rested, SLEEP_MAX = exhausted.
export const SLEEP_MAX = 100;
export const SLEEP_FALL_ASLEEP = 90;
export const SLEEP_WAKE = 20;
// Awake → exhausted over ~5 minutes; recovers (while sleeping) over ~2 minutes.
export const SLEEP_RISE_PER_MS = SLEEP_MAX / (5 * 60 * 1000);
export const SLEEP_RECOVER_PER_MS = SLEEP_MAX / (2 * 60 * 1000);

// Trust deltas.
export const PET_TRUST_GAIN = 2;
export const DISLIKE_TRUST_DELTA = -3;

// Money awarded per successful feed of a trusted cat: scales with trust.
export const MONEY_PER_TRUST = 0.1;

// Starter inventory for a brand-new game so the loop is immediately playable.
export const STARTER_INVENTORY = {
  salmon: 3,
  tuna: 3,
  chicken: 2,
  treat: 2,
  mouseToy: 1,
  string: 1,
} as const;

// Isometric tile size in pixels.
export const TILE_W = 96;
export const TILE_H = 48;

// Home grid bounds (walkable tiles).
export const GRID_MIN = 0;
export const GRID_MAX = 5;

export const SAVE_KEY = 'cloudy-kittens:save';
