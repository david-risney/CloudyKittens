import { describe, it, expect } from 'vitest';
import { createCat, itemPreference, makeRng } from '../../src/game/cats.js';
import { ALL_ITEM_IDS } from '../../src/game/items.js';
import { BREEDS, PERSONALITIES, CAT_NAMES } from '../../src/game/breeds.js';

describe('makeRng', () => {
  it('is deterministic for a given seed', () => {
    const a = makeRng(42);
    const b = makeRng(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('createCat', () => {
  it('is deterministic for the same seed', () => {
    expect(createCat(123)).toEqual(createCat(123));
  });

  it('produces valid breed, appearance, personality, name, and likes', () => {
    const cat = createCat(999);
    expect(BREEDS).toContain(cat.breed);
    expect([0, 1, 2]).toContain(cat.appearance);
    expect(PERSONALITIES).toContain(cat.personality);
    expect(CAT_NAMES).toContain(cat.name);
    const likeKeys = Object.keys(cat.likes);
    expect(likeKeys.length).toBeGreaterThanOrEqual(2);
    expect(likeKeys.length).toBeLessThanOrEqual(4);
    for (const k of likeKeys) {
      expect(ALL_ITEM_IDS).toContain(k);
      expect(cat.likes[k as keyof typeof cat.likes]!).toBeGreaterThan(0);
    }
  });

  it('starts neutral and awake', () => {
    const cat = createCat(5);
    expect(cat.trust).toBe(0);
    expect(cat.activity).toBe('wandering');
  });
});

describe('itemPreference', () => {
  it('returns the positive strength for a liked item', () => {
    const cat = createCat(321);
    const likedItem = Object.keys(cat.likes)[0] as keyof typeof cat.likes;
    expect(itemPreference(cat, likedItem)).toBe(cat.likes[likedItem]);
    expect(itemPreference(cat, likedItem)).toBeGreaterThan(0);
  });

  it('returns a negative dislike delta for non-liked items', () => {
    const cat = createCat(321);
    const disliked = ALL_ITEM_IDS.find((i) => !(i in cat.likes))!;
    expect(itemPreference(cat, disliked)).toBeLessThan(0);
  });
});
