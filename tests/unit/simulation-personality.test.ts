import { describe, it, expect } from 'vitest';
import { step } from '../../src/game/simulation.js';
import { newGame } from '../../src/game/state.js';
import { createCat } from '../../src/game/cats.js';
import type { ClockPort } from '../../src/game/ports.js';
import type { GameState, Personality } from '../../src/game/types.js';

function clockAt(now: number): ClockPort {
  return { now: () => now, today: () => '2026-06-15' };
}

/** A single cat with a fixed id/start so only personality differs between runs. */
function gameWithPersonality(personality: Personality): GameState {
  const s = newGame(clockAt(0));
  s.cats.push({
    ...createCat(1),
    id: 'fixed-cat',
    personality,
    activity: 'wandering',
    sleep: 0,
    tileX: 3,
    tileY: 3,
  });
  return s;
}

/** Run the sim and report total tiles travelled and how often the cat sat. */
function observe(personality: Personality): { distance: number; sits: number } {
  let s = gameWithPersonality(personality);
  let distance = 0;
  let sits = 0;
  let prevX = s.cats[0].tileX;
  let prevY = s.cats[0].tileY;
  for (let i = 1; i <= 120; i++) {
    s = step(s, 250, clockAt(i * 250));
    const cat = s.cats[0];
    distance += Math.abs(cat.tileX - prevX) + Math.abs(cat.tileY - prevY);
    if (cat.activity === 'sitting') sits++;
    prevX = cat.tileX;
    prevY = cat.tileY;
  }
  return { distance, sits };
}

describe('step — personality-driven behaviour', () => {
  it('restless personalities roam farther than lazy ones', () => {
    const savage = observe('savage');
    const sleepy = observe('sleepy');
    expect(savage.distance).toBeGreaterThan(sleepy.distance);
  });

  it('lazy/calm personalities sit more often than restless ones', () => {
    const sleepy = observe('sleepy');
    const savage = observe('savage');
    expect(sleepy.sits).toBeGreaterThan(savage.sits);
  });

  it('remains deterministic per personality', () => {
    expect(observe('playful')).toEqual(observe('playful'));
  });
});
