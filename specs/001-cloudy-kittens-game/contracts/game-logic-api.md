# Contract: Game Logic API (`src/game/*`)

These are the **pure, DOM-free** module signatures the UI depends on. Every function is
deterministic given its inputs (time and storage are injected as ports), making them
directly unit-testable per Constitution Principle III. Functions return **new state**
(or a result object) rather than mutating shared globals; in-place mutation of a passed
draft is acceptable internally as long as behavior is deterministic and tested.

> Signatures are the contract (names, inputs, outputs, and guaranteed behavior). Exact
> numeric tuning lives behind constants and is not part of the contract.

## Ports (injected dependencies)

```ts
interface StoragePort {
  read(key: string): string | null;
  write(key: string, value: string): void;
}

interface ClockPort {
  now(): number;        // epoch ms
  today(): string;      // local calendar date 'YYYY-MM-DD'
}
```

## state.ts

```ts
function newGame(clock: ClockPort): GameState;
// Fresh state: money=100, empty cats, firstCatClaimed=false, default settings,
// shop roster seeded for clock.today(), lastSeen=clock.now().
```

Guarantees: a brand-new game satisfies all GameState invariants (data-model.md).

## cats.ts

```ts
function createCat(seed: number): Cat;            // deterministic from seed
function itemPreference(cat: Cat, item: ItemId): number; // like strength (may be <=0)
```

## economy.ts

```ts
type FeedResult = { state: GameState; consumed: boolean; moneyGained: number; trustDelta: number };

function feed(state: GameState, catId: string, item: ItemId): FeedResult;
// - If item not a food or not in inventory → no-op (consumed=false).
// - If cat is full (hunger<=0) → canceled: no consume, no hunger change, no money (FR-005).
// - Else: decrement inventory by 1, reduce hunger, apply trust delta by preference (FR-003);
//   if resulting/again-existing trust>0 → moneyGained>0 scaled by trust (FR-004), else 0.

function useToy(state: GameState, catId: string, item: ItemId): GameState;
// Toy not consumed (FR-006); trust rises/falls by preference.

function pet(state: GameState, catId: string): GameState;
// Trust rises by a fixed gentle amount (FR-007).
```

Guarantees: `money` never negative; trust clamped to `[TRUST_MIN, TRUST_MAX]`; feeding a
full cat is a pure no-op except returning `consumed=false`.

## simulation.ts

```ts
function step(state: GameState, deltaMs: number, clock: ClockPort): GameState;
// Advances time: hunger rises by deltaMs; awake cats accrue sleep, sleeping cats recover;
// updates activity transitions (wandering/sitting/sleeping) and tile positions for wanderers.

function applyElapsedSinceLastSeen(state: GameState, clock: ClockPort): GameState;
// On load: accrue hunger (and clamp sleep) for (clock.now() - state.lastSeen) (FR-010a).
```

Guarantees: deterministic given `deltaMs`/clock; hunger monotonically rises without
feeding; a cat with `sleep>=SLEEP_FALL_ASLEEP` becomes `sleeping`.

## shop.ts

```ts
function refreshIfNewDay(state: GameState, clock: ClockPort): GameState;
// If clock.today() !== shop.lastShopDay → regenerate exactly 5 cats seeded by the date.

type AdoptResult = { state: GameState; adopted: boolean; reason?: 'full' | 'no-funds' };
function adopt(state: GameState, catIndex: number, clock: ClockPort): AdoptResult;
// First cat free if !firstCatClaimed; else costs CAT_COST (30). Blocked at HOME_CAPACITY
// (reason 'full', FR-018a) or insufficient money (reason 'no-funds', FR-019).

type BuyResult = { state: GameState; bought: boolean };
function buyItem(state: GameState, item: ItemId): BuyResult;
// Deduct catalog price, add 1 to inventory; blocked (bought=false) if unaffordable (FR-019).
```

Guarantees: roster always length 5; same `today()` → identical roster (deterministic
seed); no negative money; cats never exceed capacity.

## day.ts

```ts
function isNewDay(lastShopDay: string, clock: ClockPort): boolean; // today() !== lastShopDay
```

## persistence.ts

```ts
const SAVE_KEY: string;

function save(state: GameState, storage: StoragePort, clock: ClockPort): void;
// Sets lastSeen=clock.now(), serializes to JSON, writes under SAVE_KEY.

function load(storage: StoragePort, clock: ClockPort): GameState;
// Parse SAVE_KEY; on missing/invalid/corrupt JSON or failed invariant checks → newGame()
// (corrupt-data edge case, FR-021). Otherwise apply applyElapsedSinceLastSeen + refreshIfNewDay.
```

Guarantees: load never throws; always returns a valid GameState.
