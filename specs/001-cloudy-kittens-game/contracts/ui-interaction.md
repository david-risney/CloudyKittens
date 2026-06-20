# Contract: UI & Interaction (DOM/Canvas overlay)

The presentation layer is a thin adapter over the game-logic API. It owns all DOM,
Canvas, and Audio; it MUST NOT contain game rules. This contract defines the surfaces,
their required interactive elements, and the logic calls each triggers.

## Accessibility contract (applies to every surface)

- All actionable controls are real focusable HTML elements (`button`, `[role]` as
  needed) with visible focus and WCAG AA contrast on the beige theme.
- The whole game is keyboard-operable; cats can be targeted via keyboard, not mouse only.
- Honor `prefers-reduced-motion`: reduce or stop cat wandering animation and transitions.
- No fail/lose state, countdown, or stress mechanic is ever presented (Principle IV).

## Surface 1 — Intro screen (`src/ui/intro.js`)

Required elements:
- Game title "Cloudy Kittens" rendered in the **cloud-style font** (FR-023).
- Designer credit text "Elisabeth Risney" (FR-024).
- A large cat face graphic.
- **Start** button → hides intro, shows home, starts the game loop, and (if
  `settings.musicEnabled`) begins music on this user gesture (autoplay-safe).
- **Settings** button → opens settings with independent **Music** and **Sound effects**
  toggles bound to `settings.musicEnabled` / `settings.sfxEnabled`; changes persist
  immediately via save (SC-008).

## Surface 2 — Home scene (`src/ui/renderer.js`)

- Renders the cozy beige isometric interior including a **couch** (FR-022) onto Canvas 2D.
- Draws each cat at its projected tile position with depth sorting; animates wandering,
  sitting, sleeping per `cat.activity`.
- Driven by a `requestAnimationFrame` loop calling `simulation.step(...)` then redrawing.
- Cats emit random **meow** SFX at intervals when `settings.sfxEnabled`.

## Surface 3 — Bottom HUD (`src/ui/hud.js`)

Required elements:
- Selectable owned **items** (with counts), a **Pet** action, and a **Lookup** action.
- Money display.

Interaction model (FR-001):
1. Player selects an action: an item (`ActionKind 'item'`), Pet, or Lookup.
2. Player clicks/activates a cat in the scene.
3. The HUD dispatches to logic based on the selection:
   - Food item → `economy.feed(state, catId, item)`; on `consumed` play feed SFX, update
     money; if canceled (full) give gentle non-error feedback.
   - Toy item → `economy.useToy(state, catId, item)` (toy not consumed).
   - Pet → `economy.pet(state, catId)`.
   - Lookup → open Surface 5 for that cat.
4. After any state change, trigger debounced auto-save and refresh affected UI.

## Surface 4 — Shop modal (`src/ui/modals.js`)

- **Cats section**: shows exactly the 5 `shop.adoptableCats` for the day (FR-015). First
  adoption labeled free; others show 30-coin cost. Adopt → `shop.adopt(...)`; reflect
  `reason` ('full' / 'no-funds') with gentle messaging, no error tone (FR-018a/019).
- **Items section**: lists buyable catalog items with prices; Buy → `shop.buyItem(...)`;
  block unaffordable purchases gracefully (FR-017/019).
- Re-opening the modal the same day shows the same 5 cats (deterministic roster).

## Surface 5 — Lookup modal (book pages) (`src/ui/modals.js`)

- Opened via the Lookup action on a cat. Presented as **book pages** (FR-008).
- Displays the cat's name, breed, personality, likes, and current trust, hunger, and
  sleep state. Read-only; closeable via button and keyboard (Esc).

## Persistence wiring (`src/platform/storage.js` + `main.js`)

- On startup: `persistence.load(storage, clock)` → if no/invalid save, `newGame` is used
  automatically (FR-021); then show intro.
- Auto-save (debounced) after every state-changing interaction and periodically from the
  loop, using `persistence.save(...)` (FR-020). No manual save/load UI exists.

## Audio wiring (`src/audio/audio.js`)

- `playMusic()/stopMusic()` gated by `settings.musicEnabled`; `playSfx(name)` gated by
  `settings.sfxEnabled`. Music starts only after the Start user gesture.
- SFX names cover cat actions (feed, toy, pet) and random meow.
