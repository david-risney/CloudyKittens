# Quickstart: Cloudy Kittens Game

A run/validation guide proving the feature works end-to-end. Implementation details live
in `tasks.md`; logic/UI contracts live in `contracts/` and `data-model.md`.

## Prerequisites

- A modern Baseline browser (current Chrome, Edge, Firefox, or Safari) to play.
- Node.js LTS — optional, only to run the automated test suite (Vitest + jsdom). There
  are **zero runtime dependencies**; the game is plain client-side static files that run
  directly in the browser from source with **no build step**.

## Setup (tests only)

```bash
npm install        # installs dev-only test tooling (vitest, jsdom)
```

## Run the test-first suite

```bash
npm test           # vitest: unit tests for src/game/* and jsdom UI-wiring tests
```

Per Constitution Principle III, tests are written before implementation; this command
should be run continuously (Red → Green → Refactor).

## Run the game

No build and no install are required — serve the source with any static file server and
open it over `http://` (ES modules don't load over `file://`):

```bash
npx serve .        # or: npm start, or: python -m http.server
# then open the printed http://localhost URL
```

## End-to-end validation scenarios

Map directly to spec Success Criteria / acceptance scenarios.

1. **First run & free cat (SC-001, FR-016)**: Load with empty storage → intro shows title
   (cloud font), "Elisabeth Risney", cat face, Start, Settings. Press Start → home scene
   with beige isometric room and couch. Open shop → first cat is free; adopt it.
2. **Core care loop (SC-001/003, FR-001–004)**: Buy/own a liked food, select it, click the
   cat → hunger drops, trust rises, money increases (cat has positive trust). Verify a
   disliked food lowers trust.
3. **Feed-when-full canceled (SC-002, FR-005)**: Feed until full, feed again → no food
   consumed, hunger unchanged, no money gained; gentle (non-error) feedback.
4. **Toys & petting (FR-006/007)**: Use a toy → trust changes, toy NOT consumed. Pet →
   trust rises.
5. **Hunger regenerates (SC-009, FR-010a)**: After a cat is full, advance time (or reopen
   later) → hunger has risen and the cat is feedable again.
6. **Living cats & lookup (SC-007, FR-008/011)**: Observe ~2 min → cats wander, sit, and
   fall asleep when tired. Lookup a cat → book-page modal shows name, breed, personality,
   likes, and trust/hunger/sleep.
7. **Shop limits (SC-004/010, FR-015/018/018a/019)**: Shop shows exactly 5 cats; extra
   cats cost 30; adoption blocked when home is at capacity (default 6) and when funds are
   insufficient. Re-opening the same day shows the same 5 cats; a new calendar day shows a
   new roster.
8. **Auto-save / auto-load (SC-005, FR-020/021)**: Make progress, reload the page → state
   restored automatically with no manual action. Corrupt the saved blob → game starts
   fresh without error.
9. **Calm & accessible (SC-006/008, FR-025–028)**: Toggle Music and SFX independently;
   changes take effect immediately and persist. Enable OS reduced-motion → animations
   soften/stop. Confirm no fail state and full keyboard operability.

## Done criteria

All `npm test` tests pass and all nine scenarios above behave as described in a Baseline
browser, with the source (`index.html` + `src/`) running directly from a static file
server with no build step.
