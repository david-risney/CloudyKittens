---

description: "Task list for Cloudy Kittens implementation"
---

# Tasks: Cloudy Kittens Game

**Input**: Design documents from `specs/001-cloudy-kittens-game/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: INCLUDED and REQUIRED. The project constitution makes Test-First
(Red→Green→Refactor) NON-NEGOTIABLE (Principle III). Within every story, write the listed
tests FIRST and confirm they FAIL before writing implementation.

**Organization**: Tasks are grouped by user story for independent implementation/testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US5 maps to spec user stories
- All paths are repository-root relative per plan.md structure

## Path Conventions

Single static web app: `src/game/*` (pure logic), `src/ui|audio|platform/*`
(presentation/platform), `tests/unit` and `tests/ui`, `assets/`, root `index.html`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and app shell

- [X] T001 Scaffold project at repo root: create `package.json` with zero runtime dependencies and dev scripts (`dev`, `build`, `preview`, `test`) using Vite + Vitest + TypeScript; create `tsconfig.json` (ES2022, strict) and `vite.config.ts`
- [X] T002 [P] Configure Vitest with jsdom in `vite.config.ts` (or `vitest.config.ts`): `environments` mapping so `tests/unit` runs in node and `tests/ui` runs in jsdom; add `tests/setup.ts` if needed
- [X] T003 [P] Create app shell `index.html` (a `<canvas id="scene">` plus a `<div id="ui">` overlay root and `<div id="modal-root">`) loading `src/main.ts` as a module
- [X] T004 [P] Create `src/styles/main.css` with the subdued beige theme tokens, full-viewport layout for canvas + overlay, bottom-HUD layout area, focus-visible styles, and a `@media (prefers-reduced-motion: reduce)` block
- [X] T005 [P] Add formatting/lint config (`.editorconfig`, Prettier config) and a `.gitignore` for `node_modules/` and `dist/`

**Checkpoint**: `npm install` and `npm test` run (no tests yet); `npm run dev` serves a blank shell.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, constants, catalogs, ports, and the base scene/loop that ALL stories build on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Define core types and unions in `src/game/state.ts`: `ItemId`, `ItemType`, `Personality`, `BreedId`, `Activity`, `ActionKind`, `Cat`, `Player`, `Settings`, `ShopState`, `GameState` (per data-model.md)
- [X] T007 [P] Define balancing constants in `src/game/constants.ts`: `START_MONEY=100`, `CAT_COST=30`, `DAILY_CAT_COUNT=5`, `HOME_CAPACITY=6`, trust/hunger/sleep bounds and rates, money-per-trust scaling, per-action trust deltas
- [X] T008 [P] Define `StoragePort` and `ClockPort` interfaces in `src/game/ports.ts` (per contracts/game-logic-api.md)
- [X] T009 [P] Implement item catalog (foods: salmon, tuna, chicken, mouse, treat; toys: mouseToy, string, catnip) with prices in `src/game/items.ts`
- [X] T010 [P] Implement breed catalog (breeds with 3 appearance variants each) and personality list in `src/game/breeds.ts`
- [X] T011 [P] Unit test deterministic cat creation and `itemPreference` in `tests/unit/cats.test.ts` (write first, must fail)
- [X] T012 Implement `createCat(seed)` and `itemPreference(cat,item)` in `src/game/cats.ts` (depends on T006, T009, T010)
- [X] T013 [P] Unit test `newGame(clock)` invariants (money=100, no cats, default settings, 5-cat roster, lastSeen set) in `tests/unit/state.test.ts` (write first, must fail)
- [X] T014 Implement `newGame(clock)` factory in `src/game/state.ts` (depends on T006, T007, T012)
- [X] T015 [P] Implement real `SystemClock` (`now`, local-date `today`) in `src/platform/clock.ts` and `LocalStorageAdapter` (StoragePort) in `src/platform/storage.ts`
- [X] T016 [P] Unit test isometric tile→screen projection and depth ordering in `tests/unit/iso.test.ts` (write first, must fail)
- [X] T017 Implement isometric projection helpers in `src/ui/iso.ts` and a base Canvas renderer in `src/ui/renderer.ts` that draws the beige room + couch (FR-022); add a `requestAnimationFrame` loop scaffold in `src/main.ts` that loads state and renders the empty scene (depends on T014, T016)

**Checkpoint**: Foundation ready — the home renders; pure types/ports/catalogs exist and are tested. User stories can now begin.

---

## Phase 3: User Story 1 - Care for a cat to build trust and earn money (Priority: P1) 🎯 MVP

**Goal**: The core loop — select a food/toy/pet from the bottom HUD, apply to a cat, change hunger/trust, and earn money for feeding trusted cats.

**Independent Test**: With the free starter cat present, select a liked food and click the cat → hunger drops, trust rises, money increases; feeding a full cat is canceled; toys aren't consumed; petting raises trust.

### Tests for User Story 1 (write FIRST, must FAIL) ⚠️

- [X] T018 [P] [US1] Unit tests for `economy.feed` in `tests/unit/economy-feed.test.ts`: liked food raises trust + lowers hunger + consumes 1; disliked food lowers trust; positive-trust feed awards money scaled by trust; trust≤0 awards none; full cat (hunger≤0) cancels (no consume/no hunger/no money); missing item is a no-op
- [X] T019 [P] [US1] Unit tests for `economy.useToy` and `economy.pet` in `tests/unit/economy-play.test.ts`: toy not consumed and trust changes by preference; pet raises trust; trust clamped to bounds; money never negative
- [X] T020 [P] [US1] Unit tests for hunger-over-time in `tests/unit/hunger.test.ts`: `step` raises hunger by delta; `applyElapsedSinceLastSeen` accrues hunger for closed time so a full cat becomes feedable (SC-009, FR-010a)
- [X] T021 [P] [US1] jsdom test for HUD apply-flow in `tests/ui/hud-apply.test.ts`: selecting a food then activating a cat dispatches `feed` and updates money display; full-cat feed shows gentle non-error feedback

### Implementation for User Story 1

- [X] T022 [US1] Implement `feed`, `useToy`, `pet` (returning `FeedResult`/state per contract) in `src/game/economy.ts` (depends on T006, T007, T009)
- [X] T023 [US1] Implement hunger time progression: `step(state,deltaMs,clock)` hunger rise and `applyElapsedSinceLastSeen(state,clock)` in `src/game/simulation.ts` (US1 portion; activity transitions added in US3)
- [X] T024 [US1] Render cats in the scene and implement click + keyboard cat targeting (focusable/selectable cats) in `src/ui/renderer.ts`
- [X] T025 [US1] Implement bottom HUD in `src/ui/hud.ts`: money display, selectable owned items (with counts), Pet and Lookup action buttons, and the select-action→activate-cat dispatch to `economy.*` (Lookup wiring stubbed until US3)
- [X] T026 [US1] Wire the rAF loop in `src/main.ts` to call `simulation.step` each frame and re-render; seed a starter cat in-state so the loop is demoable (adoption arrives in US2)

**Checkpoint**: Core care loop fully functional and independently testable (MVP).

---

## Phase 4: User Story 2 - Adopt cats and buy items from the shop (Priority: P2)

**Goal**: Shop with a daily 5-cat roster (first free, others 30 coins) and item purchases, respecting home capacity and funds.

**Independent Test**: Open the shop → exactly 5 cats; first adoption free, next costs 30; adoption blocked at capacity and when broke; buying an item deducts cost and adds to inventory; same day shows same roster.

### Tests for User Story 2 (write FIRST, must FAIL) ⚠️

- [X] T027 [P] [US2] Unit tests for `day.isNewDay` and `shop.refreshIfNewDay` in `tests/unit/shop-day.test.ts`: roster length 5; same `today()` → identical roster; new date → new roster (FR-018)
- [X] T028 [P] [US2] Unit tests for `shop.adopt` in `tests/unit/shop-adopt.test.ts`: first cat free then 30 coins; blocked at `HOME_CAPACITY` (reason 'full'); blocked when unaffordable (reason 'no-funds'); money never negative (FR-016/018a/019, SC-010)
- [X] T029 [P] [US2] Unit tests for `shop.buyItem` in `tests/unit/shop-buy.test.ts`: deducts catalog price, +1 inventory; blocked when unaffordable
- [X] T030 [P] [US2] jsdom test for shop modal in `tests/ui/shop-modal.test.ts`: shows 5 cats with correct free/30 labels and an items section; adopt/buy dispatch and gentle blocked-messaging

### Implementation for User Story 2

- [X] T031 [P] [US2] Implement `isNewDay` in `src/game/day.ts` (deterministic on local date)
- [X] T032 [US2] Implement `refreshIfNewDay`, `adopt`, `buyItem` in `src/game/shop.ts` (depends on T012, T014, T031)
- [X] T033 [US2] Implement shop modal (cats section + items section) in `src/ui/modals.ts` and a Shop button in the HUD; wire to `shop.*` with calm blocked-state feedback (FR-015/017)
- [X] T034 [US2] Call `shop.refreshIfNewDay` on game start in `src/main.ts` so a fresh roster appears each new day

**Checkpoint**: US1 + US2 both work independently.

---

## Phase 5: User Story 3 - Observe living cats and look up their details (Priority: P2)

**Goal**: Cats wander/sit/sleep based on sleep (tiredness) level; a book-page lookup modal shows a cat's details and live state.

**Independent Test**: Watch cats change activity over ~2 minutes (wander → sit → sleep when tired, recover while sleeping); Lookup a cat → book-page modal shows name, breed, personality, likes, and trust/hunger/sleep.

### Tests for User Story 3 (write FIRST, must FAIL) ⚠️

- [X] T035 [P] [US3] Unit tests for activity simulation in `tests/unit/simulation-activity.test.ts`: sleep rises while awake; cat becomes 'sleeping' at `SLEEP_FALL_ASLEEP`; sleep decreases while sleeping and wakes at `SLEEP_WAKE`; wanderers change tile position; transitions are deterministic given delta (FR-010/011)
- [X] T036 [P] [US3] jsdom test for lookup modal in `tests/ui/lookup-modal.test.ts`: renders name, breed, personality, likes, and current trust/hunger/sleep in book-page layout; closeable via button and Esc (FR-008)

### Implementation for User Story 3

- [X] T037 [US3] Extend `src/game/simulation.ts` `step` with sleep accrual/recovery and wandering/sitting/sleeping activity + position transitions (depends on T023)
- [X] T038 [US3] Render distinct cat activity visuals (wandering/sitting/sleeping) in `src/ui/renderer.ts`, softened/stilled under `prefers-reduced-motion`
- [X] T039 [US3] Implement the book-page lookup modal in `src/ui/modals.ts` and connect the HUD Lookup action (from T025) to open it for the activated cat

**Checkpoint**: US1 + US2 + US3 work independently.

---

## Phase 6: User Story 5 - Automatic save and load of progress (Priority: P2)

**Goal**: Auto-save all progress and auto-load it on open, with a safe fresh-start fallback for missing/corrupt data and offline hunger accrual on load.

**Independent Test**: Make progress, reload → state restored with no manual action; corrupt the saved blob → fresh game without error; reopening after time → hunger has accrued.

### Tests for User Story 5 (write FIRST, must FAIL) ⚠️

- [X] T040 [P] [US5] Unit tests for persistence in `tests/unit/persistence.test.ts` (using in-memory StoragePort + fake ClockPort): JSON round-trip preserves state; missing key → `newGame`; corrupt/invalid JSON or failed invariants → `newGame` (FR-021); `load` applies elapsed hunger and `refreshIfNewDay`; `load` never throws
- [X] T041 [P] [US5] jsdom/integration test for auto-save wiring in `tests/ui/autosave.test.ts`: a state-changing action triggers a debounced `save`; startup `load` populates state before the intro/home shows

### Implementation for User Story 5

- [X] T042 [US5] Implement `SAVE_KEY`, `save(state,storage,clock)`, and `load(storage,clock)` (with corrupt-data fallback, `applyElapsedSinceLastSeen`, `refreshIfNewDay`) in `src/game/persistence.ts` (depends on T014, T023, T032)
- [X] T043 [US5] Wire auto-load on startup and debounced auto-save after every state-changing interaction (and periodically from the loop) in `src/main.ts`; ensure no manual save/load UI exists (FR-020/021)

**Checkpoint**: Progress persists across reloads; US1+US2+US3+US5 all independently functional.

---

## Phase 7: User Story 4 - Calm presentation, intro screen, and settings (Priority: P3)

**Goal**: Intro screen (cloud-font title, designer credit, cat face, Start, Settings), independent music/SFX toggles, calm background music, action SFX, and random meows.

**Independent Test**: Launch → intro shows title/credit/cat face/Start/Settings; Start shows the home and begins music (if enabled); toggle music and SFX independently and confirm they take effect and persist; actions play SFX and cats meow randomly.

### Tests for User Story 4 (write FIRST, must FAIL) ⚠️

- [X] T044 [P] [US4] jsdom test for intro + settings in `tests/ui/intro.test.ts`: title, "Elisabeth Risney" credit, cat face, Start and Settings present; Start hides intro and shows home; music/SFX toggles bound to settings and persisted (SC-008)
- [X] T045 [P] [US4] Unit test for audio gating in `tests/unit/audio.test.ts` (with a fake audio backend): `playMusic`/`playSfx` respect `musicEnabled`/`sfxEnabled`; music does not start before the Start gesture

### Implementation for User Story 4

- [X] T046 [US4] Implement the audio module (`playMusic`/`stopMusic`/`playSfx`, settings-gated, autoplay-safe start, random meow scheduling) in `src/audio/audio.ts`
- [X] T047 [US4] Implement the intro screen and settings panel (cloud-font title via `assets/` font, designer credit, large cat face, Start, Settings with music/SFX toggles) in `src/ui/intro.ts` and wire into `src/main.ts` start flow
- [X] T048 [US4] Trigger action SFX from HUD interactions (feed/toy/pet) and random meows from the loop, both gated by `settings.sfxEnabled`

**Checkpoint**: All five user stories independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality, accessibility, assets, and final validation across all stories

- [X] T049 [P] Source and add free-licensed assets to `assets/`: cloud-style display font, cat/room/couch sprites, calm background music, and action/meow SFX (document licenses in `assets/CREDITS.md`)
- [X] T050 [P] Accessibility pass across all surfaces: keyboard operability for cat targeting and all controls, visible focus, WCAG AA contrast on the beige theme, and `prefers-reduced-motion` honored (Principle IV)
- [X] T051 [P] Balancing pass: tune constants in `src/game/constants.ts` (trust/hunger/sleep rates, money-per-trust, per-cat preferences, item prices) via play-testing
- [X] T052 [P] Write `README.md` with run/build/test instructions mirroring `quickstart.md`
- [X] T053 Run the full `npm test` suite and the 9 `quickstart.md` validation scenarios in a Baseline browser; confirm the built `dist/` runs from a static file server

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phases 3–7)**: All depend on Foundational
  - US1 (P1) first as MVP. US2, US3, US5 (P2) and US4 (P3) can then proceed in parallel or in order
- **Polish (Phase 8)**: Depends on all targeted stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational. No dependency on other stories
- **US2 (P2)**: After Foundational. Independent (adds adoption; US1 seeds a starter cat without it)
- **US3 (P2)**: After Foundational. Extends `simulation.ts` (T037 depends on US1's T023) and HUD Lookup (T039 depends on US1's T025)
- **US5 (P2)**: After Foundational. `persistence.load` integrates US2 `refreshIfNewDay` (T042 depends on T032) — sequence US2 before US5, or stub
- **US4 (P3)**: After Foundational. Independent presentation/audio layer

### Within Each User Story

- Tests written FIRST and FAIL before implementation (constitution Principle III)
- Pure `src/game/*` logic before `src/ui` wiring
- Story complete and independently validated before moving on

### Parallel Opportunities

- Setup: T002–T005 in parallel after T001
- Foundational: T006–T010 in parallel; test tasks T011/T013/T016 in parallel; T015 in parallel
- Within a story, all `[P]` test tasks run together; logic and UI in different files can parallelize
- Different stories can be staffed in parallel once Foundational is done (mind the noted cross-file dependencies on `simulation.ts`, `hud.ts`, `modals.ts`)

---

## Parallel Example: User Story 1

```bash
# Write all US1 tests first (they must fail):
Task: "Unit tests for economy.feed in tests/unit/economy-feed.test.ts"
Task: "Unit tests for economy.useToy/pet in tests/unit/economy-play.test.ts"
Task: "Unit tests for hunger-over-time in tests/unit/hunger.test.ts"
Task: "jsdom HUD apply-flow test in tests/ui/hud-apply.test.ts"

# Then implement (economy.ts and simulation.ts are different files → parallelizable):
Task: "Implement feed/useToy/pet in src/game/economy.ts"
Task: "Implement hunger progression in src/game/simulation.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational)
2. Complete Phase 3 (US1) test-first
3. **STOP and VALIDATE**: the core care loop is playable with the starter cat
4. Demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → validate → demo (MVP!)
3. US2 → US3 → US5 → US4, each test-first and independently validated
4. Polish → run quickstart scenarios → ship static `dist/`

---

## Notes

- [P] = different files, no incomplete-task dependencies
- Each user story is independently completable and testable
- Verify tests FAIL before implementing (Red→Green→Refactor)
- Keep `src/game/*` free of DOM/Canvas/Audio imports (testability + Principle I)
- Commit after each task or logical group
