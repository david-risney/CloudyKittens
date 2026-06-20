import type { Cat, ItemId, Appearance } from './types.js';
import { BREEDS, APPEARANCES_PER_BREED, PERSONALITIES, CAT_NAMES } from './breeds.js';
import { ALL_ITEM_IDS, ITEMS } from './items.js';
import { GRID_MIN, GRID_MAX, DISLIKE_TRUST_DELTA } from './constants.js';

/** Deterministic PRNG (mulberry32). Same seed → same sequence. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function rng(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Build a deterministic cat from a numeric seed. */
export function createCat(seed: number): Cat {
  const rng = makeRng(seed);
  const breed = pick(rng, BREEDS);
  const appearance = Math.floor(rng() * APPEARANCES_PER_BREED) as Appearance;
  const personality = pick(rng, PERSONALITIES);
  const name = pick(rng, CAT_NAMES);

  // 2–4 liked items with positive strengths.
  const likeCount = 2 + Math.floor(rng() * 3);
  const pool = [...ALL_ITEM_IDS];
  const likes: Partial<Record<ItemId, number>> = {};
  for (let i = 0; i < likeCount && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    const item = pool.splice(idx, 1)[0];
    likes[item] = 3 + Math.floor(rng() * 8); // 3..10
  }

  const tileX = GRID_MIN + Math.floor(rng() * (GRID_MAX - GRID_MIN + 1));
  const tileY = GRID_MIN + Math.floor(rng() * (GRID_MAX - GRID_MIN + 1));

  return {
    id: `cat_${seed.toString(36)}_${Math.floor(rng() * 1e6).toString(36)}`,
    name,
    breed,
    appearance,
    personality,
    likes,
    trust: 0,
    hunger: 20,
    sleep: 10,
    activity: 'wandering',
    tileX,
    tileY,
  };
}

/**
 * Preference strength of a cat for an item. Liked items return their positive
 * strength; everything else returns a mild dislike delta. Toys and foods use the
 * same preference scale (it maps to a trust delta).
 */
export function itemPreference(cat: Cat, item: ItemId): number {
  const liked = cat.likes[item];
  if (liked !== undefined) return liked;
  // Ensure the item exists in the catalog (guards typos in callers).
  if (!(item in ITEMS)) return DISLIKE_TRUST_DELTA;
  return DISLIKE_TRUST_DELTA;
}
