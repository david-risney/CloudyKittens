# Phase 0 Research: Cloudy Kittens Game

All Technical Context items were resolvable from the spec, clarifications, and the
project constitution; there are **no remaining NEEDS CLARIFICATION** items. This
document records the key technical decisions and the alternatives considered.

## D1. Language & build tooling

- **Decision**: Hand-written standard **ES2022 JavaScript modules**, shipped as plain
  static files that run **directly in the browser from source with no build step**.
- **Rationale**: The constitution requires the game to run on the Baseline web platform
  with zero runtime dependencies and to be served as static files (Principles I and V).
  Authoring native ES modules means the browser loads `src/main.js` and its imports
  directly — no transpiler or bundler is needed to run or ship the game, which is the
  simplest possible static deployment.
- **Alternatives considered**:
  - *TypeScript compiled via Vite*: adds type safety but requires a build step before the
    code can run in a browser; rejected because it conflicts with shipping runnable
    source directly and adds tooling churn.
  - *esbuild/Rollup bundling*: unnecessary — native ES module imports resolve in the
    browser without bundling for a project of this size.

## D2. Test framework

- **Decision**: **Vitest** (+ jsdom for the thin UI-wiring tests), as dev-only tooling.
- **Rationale**: Test-first is non-negotiable (Principle III). Vitest runs the plain ES
  module sources directly, is fast, and supports both pure-logic unit tests and jsdom DOM
  tests. It is dev-only test tooling — never shipped or required to play — so it does not
  affect the no-build, framework-free runtime.
- **Alternatives considered**:
  - *node:test*: no extra dep, but weaker jsdom/watch ergonomics.
  - *Jest*: heavier ESM config; Vitest is lighter and runs the native modules as-is.

## D3. Rendering approach (2D isometric home + cats)

- **Decision**: **Canvas 2D API** for the isometric home and animated cats; **HTML/CSS
  overlay** for all UI (bottom bar, intro, shop, lookup modal).
- **Rationale**: Canvas 2D is Baseline and ideal for sprite-based isometric scenes and
  per-frame cat movement at ~60fps via `requestAnimationFrame`. HTML/CSS for UI gives
  free accessibility (focus, keyboard, semantics) and easy book-page modal styling,
  satisfying Principle IV. WebGL is unnecessary complexity (Principle V).
- **Alternatives considered**:
  - *Pure DOM/CSS sprites for cats*: possible but awkward for smooth isometric motion
    and depth sorting; Canvas is cleaner.
  - *WebGL/Canvas libraries (PixiJS, Phaser)*: prohibited game/UI frameworks and
    unneeded for this scale.

## D4. Isometric coordinate model

- **Decision**: Maintain cat/world positions in **tile (grid) coordinates** and convert
  to screen via a standard 2:1 isometric projection in the renderer; depth-sort drawables
  by `(tileX + tileY)` for correct overlap.
- **Rationale**: Keeps simulation logic resolution-independent and DOM-free (testable),
  while the renderer owns all projection math.
- **Alternatives considered**: storing screen-space pixels in state — rejected because it
  couples logic to rendering and breaks testability.

## D5. Game loop & time model

- **Decision**: A single `requestAnimationFrame` loop computes elapsed delta time and
  calls a **pure `step(state, deltaMs, clock)`** simulation function; hunger rise and
  sleep changes are time-based. A **clock port** (injectable) supplies "now" so tests are
  deterministic. On load, elapsed real time since `lastSeen` is applied so hunger accrues
  while the game was closed (FR-010a).
- **Rationale**: Separates "when to step" (UI) from "how state changes" (pure logic),
  enabling deterministic unit tests and honoring offline hunger accrual.
- **Alternatives considered**: `setInterval` fixed ticks — less smooth and harder to
  reconcile with offline elapsed time.

## D6. Persistence (auto-save / auto-load)

- **Decision**: Serialize `GameState` to JSON under a single **`localStorage`** key via a
  **storage port** interface; auto-save (debounced) on state changes and auto-load on
  startup. Invalid/corrupt/missing data falls back to a fresh new-game state.
- **Rationale**: Baseline, zero-backend, static-deployable (Principles I & V); the port
  lets tests use an in-memory fake. Matches FR-020/021 and the corrupt-data edge case.
- **Alternatives considered**:
  - *IndexedDB*: more capable but overkill for this small, single-blob state.
  - *No abstraction (direct localStorage in logic)*: breaks DOM-free testability.

## D7. Day boundary for shop refresh

- **Decision**: A new day is the player's **local calendar date** (`YYYY-MM-DD`). Store
  `lastShopDay`; on load/open, if today's local date differs, generate a new roster of 5
  cats. The daily roster is seeded deterministically from the date so re-opening the same
  day shows the same cats (edge case + FR-018).
- **Rationale**: Implements the clarification simply with no timers; deterministic seeding
  makes the "same cats same day" rule testable.
- **Alternatives considered**: timestamp intervals or explicit "end day" button — rejected
  per the clarify decision.

## D8. Audio (calm music + SFX)

- **Decision**: **Web Audio API** (with HTMLAudioElement fallback acceptable) for looping
  calm background music and short SFX on cat actions + random meows. Audio starts only
  after the user gesture of pressing Start (autoplay policy). Music and SFX are gated by
  independent settings and default to a gentle, user-controllable state (Principle IV).
- **Rationale**: Baseline, respects autoplay restrictions, and keeps the experience calm.
- **Asset note**: Music/SFX must be Creative-Commons or otherwise free-licensed
  (FR-026); sourcing specific assets is an implementation task tracked in tasks.md.

## D9. Accessibility & calm guarantees

- **Decision**: Honor `prefers-reduced-motion` (reduce/stop wandering animation and
  transitions); ensure all interactive controls are real focusable HTML elements with
  visible focus and AA contrast on the beige theme; no fail/lose states or time pressure.
- **Rationale**: Direct constitution Principle IV requirements; verifiable in tests and
  review.

## D10. Item taxonomy

- **Decision**: Eight items from the notes. **Foods** (consumed on use): salmon, tuna,
  chicken, mouse, treat. **Toys** (not consumed): mouse toy, string, catnip (treated as a
  play/treat toy). Each cat's `likes` is a subset; preference strength drives trust delta.
- **Rationale**: Matches the source notes and FR-009/014; exact per-cat preferences and
  prices are balancing values set during implementation/play-testing.
- **Alternatives considered**: catnip as a food — rejected; it is used like a toy/treat
  and is not consumed as a meal.

## Open balancing parameters (deferred to implementation, not blocking)

These are numeric tunables, intentionally not fixed by the spec; defaults will be chosen
in code constants and adjusted via play-testing: trust gain/loss magnitudes,
money-per-trust scaling, hunger-rise rate, sleep accrual/recovery rates, item shop
prices, and home capacity beyond the default of 6.
