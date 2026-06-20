<!-- SPECKIT START -->
Active feature plan: specs/001-cloudy-kittens-game/plan.md

Cloudy Kittens — a calm, cute 2D isometric cat-care game. Framework-free modern web
(Baseline) app: TypeScript → standard ES2022 modules, Canvas 2D for the scene, HTML/CSS
overlay for UI, Web Audio for sound, localStorage for save. Vite (build) + Vitest +
jsdom (test) are dev-only; zero runtime dependencies. Test-first is mandatory.

Pure DOM-free game logic lives in src/game/* (state, cats, economy, simulation, shop,
day, persistence) and is unit-tested in isolation; src/ui, src/audio, src/platform hold
presentation. See specs/001-cloudy-kittens-game/{plan,research,data-model,quickstart}.md
and contracts/ for details.
<!-- SPECKIT END -->
