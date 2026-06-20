# Asset Credits & Licensing

Cloudy Kittens keeps its asset footprint tiny. All visuals are generated at runtime and
the only bundled binary asset is one Creative-Commons-licensed background music track
(see Audio below); everything else (UI, sound effects) is synthesized in code.

## Graphics

- The cozy isometric room, couch, and cats are drawn procedurally on a Canvas 2D context
  (`src/ui/renderer.ts`) and the intro cat face is drawn in `src/ui/intro.ts`.
- No external sprite sheets or image files are required.

## Audio

- **Background music**: `public/audio/calm-bgm.ogg` — *"calm bgm"* by **syncopika**,
  licensed **CC-BY 3.0**. Source: https://opengameart.org/content/calm-bgm
  (license: https://creativecommons.org/licenses/by/3.0/). The track is streamed and
  looped via the Web Audio API in `src/audio/audio.ts`. If the file cannot be loaded or
  decoded, the backend falls back to a soft synthesized chord so audio degrades gracefully.
- **Sound effects** (feed, toy, pet, meow) are synthesized at runtime with the Web Audio
  API (`src/audio/audio.ts`) using oscillators and gain envelopes; no files required.
- The audio layer is settings-gated and degrades gracefully when Web Audio is unavailable.

## Fonts

- The cloud-style title uses the CSS `@font-face` family `CloudFont`, which currently
  resolves to locally installed rounded fonts via `local(...)` with a `system-ui`
  fallback (`src/styles/main.css`). No font binary is bundled or downloaded.

## Replacing placeholders (optional)

If you later add bundled assets (a free-licensed cloud display font, sprites, or recorded
music/SFX), place them in this `assets/` directory and **document each asset's source and
license here** before shipping. Suitable sources include SIL OFL fonts (e.g. Baloo 2,
Quicksand), CC0 sprite/audio libraries, and similarly permissive licenses.
