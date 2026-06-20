# Cloudy Kittens 🐈☁️

A calm, cute 2D isometric cat-care game for the modern web. Adopt cats, feed and play with
them to build trust, earn a little money, and watch them wander, sit, and nap in a cozy
beige room. There is no fail state, no timer, and no stress — just gentle care.

Built on **web platform Baseline** technology with **no frameworks** (no React, no
Tailwind) and **zero runtime dependencies**. The shipped game is plain static files:
vanilla TypeScript, Canvas 2D, HTML/CSS, Web Audio, and `localStorage`.

## Requirements

- Node.js LTS — for the dev/build/test tooling only (Vite, Vitest, TypeScript, jsdom).
- A modern Baseline browser (current Chrome, Edge, Firefox, or Safari).

## Install

```bash
npm install
```

## Develop

```bash
npm run dev          # start the Vite dev server, then open the printed localhost URL
```

## Test

This project is test-driven (see `.specify/memory/constitution.md`, Principle III).

```bash
npm test             # run the full Vitest suite once
npm run test:watch   # re-run on change (Red → Green → Refactor)
npm run typecheck    # tsc --noEmit type checking
```

- `src/game/*` is pure, DOM-free logic covered by Node unit tests in `tests/unit/`.
- Presentation/platform code (`src/ui`, `src/audio`, `src/platform`) is covered by jsdom
  tests in `tests/ui/`.

## Build & preview

```bash
npm run build        # emit static files to dist/ (no framework runtime)
npm run preview      # serve dist/ locally to confirm static deployability
```

The contents of `dist/` can be served by any static file host.

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
