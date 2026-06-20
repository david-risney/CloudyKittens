# Implementation Plan: Cloudy Kittens Game

**Branch**: `001-cloudy-kittens-game` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-cloudy-kittens-game/spec.md`

## Summary

Cloudy Kittens is a calm, cute, single-player cat-care game shown in a 2D isometric
cozy home. The core loop: select an item/pet/lookup action from a bottom UI and apply
it to a wandering cat to raise trust, lower hunger, and earn money; money funds shop
adoptions (5 cats/day, first free, 30 coins each) and item purchases. Cats have breed,
personality, likes, and live state (trust, hunger, sleep) and autonomously wander, sit,
and sleep. Progress auto-saves and auto-loads.

**Technical approach**: A framework-free web app built on the modern web platform
(Baseline), shipped as plain client-side static files that run **directly in the browser
from source with no build step**. Pure-JavaScript game-logic modules (state, rules,
economy, simulation) are fully unit-testable in isolation from the DOM. Rendering uses
the Canvas 2D API for the isometric home/cats with an HTML/CSS overlay for UI (bottom
bar, modals, shop, intro). Persistence uses `localStorage`. The source is served as-is
by any static host; Vitest runs the test-first suite as dev-only tooling. No UI or CSS
framework is used, satisfying the constitution.

## Technical Context

**Language/Version**: Standard ES2022 JavaScript modules, authored by hand and loaded
directly by the browser (no transpile/bundle step).

**Primary Dependencies**: None at runtime. Dev-only tooling: Vitest + jsdom (test
runner). No bundler is required to run or ship the game. No
React/Vue/Svelte/Tailwind/Bootstrap.

**Storage**: Browser `localStorage` (Baseline) for the auto-saved game state. No server,
database, or network backend.

**Testing**: Vitest for unit tests of game logic (state, economy, simulation, save/load)
and jsdom-based tests for UI controller wiring. Test-first (Red→Green→Refactor) per
constitution.

**Target Platform**: Modern desktop/laptop browsers on the Baseline (current Chrome,
Edge, Firefox, Safari). Source files served directly from any static host.

**Project Type**: Single static web application (game), no build step.

**Performance Goals**: Smooth ~60fps canvas animation; instant-feeling initial load
(small asset budget); degrade gracefully under `prefers-reduced-motion`.

**Constraints**: No runtime framework/dependencies; Baseline-only web APIs (Canvas 2D,
Web Audio, localStorage, requestAnimationFrame); static-deployable; calm/forgiving UX;
keyboard-operable and WCAG AA per constitution.

**Scale/Scope**: Single player, local only; small data footprint (≤ home capacity of 6
cats plus shop/inventory); roughly 4 screens/surfaces (intro, home, shop modal, lookup
modal).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Web Baseline, No Frameworks | Only HTML/CSS/JS on Baseline APIs; no UI/CSS frameworks; runtime deps = 0 | PASS — Canvas 2D, Web Audio, localStorage, rAF; plain ES modules run from source; Vitest is dev-only test tooling, not runtime |
| II. Spec-Driven Development | Spec exists and is clarified before planning | PASS — spec.md complete and clarified |
| III. Test-First (NON-NEGOTIABLE) | Tests precede code; logic unit-testable apart from DOM | PASS — logic isolated in pure modules; Vitest suite written first |
| IV. Calm, Cute & Accessible | No fail states; reduced-motion; gentle/optional audio; keyboard + AA contrast | PASS — designed in (FR-025/028, edge cases, success criteria) |
| V. Simplicity & Static Deployability | Static files suffice; client storage; YAGNI | PASS — localStorage save; source runs directly with no build step; no backend |

**Initial gate result**: PASS — no violations. Complexity Tracking not required.

**Post-design re-check (after Phase 1)**: PASS — data model, contracts, and quickstart
introduce no runtime dependencies, no framework, and keep all rules in DOM-free modules.
The storage and clock ports preserve testability and static deployability.

## Project Structure

### Documentation (this feature)

```text
specs/001-cloudy-kittens-game/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── game-logic-api.md
│   └── ui-interaction.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
index.html                  # App shell: canvas + UI overlay containers
src/
├── main.js                 # Entry: wires logic, renderer, UI, audio, persistence
├── game/                   # Pure, DOM-free game logic (unit-tested)
│   ├── types.js            # Core type/save-version constants (JSDoc-documented shapes)
│   ├── state.js            # GameState factory + initial/new-game logic
│   ├── cats.js             # Cat creation, breeds, personalities, likes
│   ├── economy.js          # Feeding/petting/toy rules, trust & money calculations
│   ├── simulation.js       # Time-step: hunger rise, sleep, wander/sit/sleep activity
│   ├── shop.js             # Daily cat roster, adoption, item purchase, capacity
│   ├── day.js              # Calendar-day detection for shop refresh
│   └── persistence.js      # Serialize/deserialize + save/load (storage-port injected)
├── ui/                     # DOM/Canvas presentation (thin, wires to game logic)
│   ├── renderer.js         # Isometric Canvas 2D rendering of home + cats
│   ├── hud.js              # Bottom UI: item/pet/lookup selection + apply-to-cat
│   ├── modals.js           # Lookup (book pages) and shop modal
│   └── intro.js            # Intro screen + settings (music/SFX toggles)
├── audio/
│   └── audio.js            # Web Audio background music + SFX, gated by settings
├── platform/
│   └── storage.js          # localStorage adapter implementing the storage port
└── styles/
    └── main.css            # Beige theme, cloud-font title, layout, reduced-motion

tests/
├── unit/                   # Vitest unit tests for src/game/* (no DOM)
└── ui/                     # jsdom tests for HUD/modal/persistence wiring

assets/                     # Sprites, cloud font, calm music, SFX (free-licensed)
package.json                # Dev-only test scripts (vitest); zero runtime deps
vitest.config.js            # Dev-only test runner config (no build/bundler)
```

**Structure Decision**: Single static web app. A strict boundary separates **pure game
logic** (`src/game/*`, no DOM/Canvas/Audio imports) from **presentation/platform**
(`src/ui`, `src/audio`, `src/platform`). This makes the constitution's test-first
mandate practical: all rules/economy/simulation/persistence logic is unit-tested via
Vitest without a browser, while a thin jsdom layer verifies UI wiring. Persistence and
time are injected as ports so tests are deterministic.

## Complexity Tracking

> No constitution violations — section intentionally empty.
