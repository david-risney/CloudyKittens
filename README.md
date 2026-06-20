# Cloudy Kittens 🐈☁️

A calm, cute 2D isometric cat-care game for the modern web. Adopt cats, feed and play with
them to build trust, earn a little money, and watch them wander, sit, and nap in a cozy
beige room. There is no fail state, no timer, and no stress — just gentle care.

Built on **web platform Baseline** technology with **no frameworks** (no React, no
Tailwind) and **zero runtime dependencies**. The game is plain client-side static files
— hand-written ES2022 JavaScript modules, Canvas 2D, HTML/CSS, Web Audio, and
`localStorage` — that run **directly in the browser from source with no build step**.

## Requirements

- A modern Baseline browser (current Chrome, Edge, Firefox, or Safari).
- Node.js LTS — optional, only for running the automated test suite (Vitest + jsdom).

## Run the game

The game needs **no build and no install** — it is served straight from source. Use any
static file server from the repository root, for example:

```bash
npx serve .            # or: npm start
# then open the printed http://localhost URL
```

```bash
python -m http.server  # any static server works
```

> Because the game loads ES modules, open it over `http://` (a static server) rather than
> a `file://` path.

## Test

This project is test-driven (see `.specify/memory/constitution.md`, Principle III).
Vitest + jsdom are **dev-only** test tooling and are never shipped or required to play.

```bash
npm install          # install the dev-only test tooling (Vitest, jsdom)
npm test             # run the full Vitest suite once
npm run test:watch   # re-run on change (Red → Green → Refactor)
```

- `src/game/*` is pure, DOM-free logic covered by Node unit tests in `tests/unit/`.
- Presentation/platform code (`src/ui`, `src/audio`, `src/platform`) is covered by jsdom
  tests in `tests/ui/`.

## Deploy

Copy the repository's static files (`index.html`, `src/`, `public/`, `assets/`) to any
static host. There is no build artifact and no bundling step.

## How to play

1. On launch, press **Start** on the intro screen (this also unlocks audio).
2. Open the **🛒 Shop** to adopt your first cat (free) and buy food and toys.
3. In the bottom **HUD**, select a food, toy, **Pet**, or **Lookup**, then click (or
   keyboard-target with arrow keys + Enter) a cat in the room to apply it.
4. Feed liked foods to raise trust; feeding a trusted cat earns coins. Toys aren't
   consumed. **Lookup** opens a book-page view of a cat's details and current mood.
5. Progress auto-saves; just reopen the page to continue.

## Project layout

```
src/
  game/        Pure game logic (no DOM): types, constants, cats, economy,
               simulation, shop, day, persistence, state
  ui/          Canvas renderer, HUD, modals (shop + lookup), intro
  audio/       Web Audio module (synthesized music & SFX)
  platform/    Clock, localStorage adapter, debounced autosave
  styles/      Beige theme + layout
tests/
  unit/        Node tests for src/game/*
  ui/          jsdom tests for presentation wiring
assets/        Asset credits/licensing notes (no binary assets required)
specs/         Spec Kit artifacts (spec, plan, tasks, contracts, quickstart)
```

## Accessibility & calm design

- Fully keyboard operable; visible focus styles; WCAG-AA-minded beige palette.
- Honors `prefers-reduced-motion` (cat animation softens/stops).
- Independent **Music** and **Sound effects** toggles that persist immediately.
- No fail/lose state, countdown, or stress mechanic — ever.

## Credits

Designed by **Elisabeth Risney**. Asset/licensing notes: see `assets/CREDITS.md`.
