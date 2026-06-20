# Phase 1 Data Model: Cloudy Kittens Game

DOM-free game state defined in `src/game/state.js` (with shared shape/constants in
`src/game/types.js` and helpers in sibling modules). All state is a single serializable
`GameState` tree persisted as JSON. Numeric tunables shown with example defaults are
**balancing values** finalized in code constants.

## Enums / unions

- `ItemId` = `'salmon' | 'tuna' | 'chicken' | 'mouse' | 'treat' | 'mouseToy' | 'string' | 'catnip'`
- `ItemType` = `'food' | 'toy'`
- `Personality` = `'playful' | 'hunter' | 'savage' | 'cute' | 'sleepy'` (extensible)
- `BreedId` = identifier for a breed; each breed has **3 appearance variants** (`0|1|2`)
- `Activity` = `'wandering' | 'sitting' | 'sleeping'`
- `ActionKind` = `'item' | 'pet' | 'lookup'`

## Entities

### Item (static catalog entry)

| Field | Type | Notes |
|-------|------|-------|
| id | `ItemId` | Unique key |
| type | `ItemType` | Foods are consumed on use; toys are not (FR-014) |
| price | `number` | Shop cost (balancing) |
| displayName | `string` | UI label |

Catalog is a constant map, not part of the save. Foods: salmon, tuna, chicken, mouse,
treat. Toys: mouseToy, string, catnip.

### Cat

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| id | `string` | Unique per cat instance |
| name | `string` | Non-empty |
| breed | `BreedId` | From breed catalog |
| appearance | `0 \| 1 \| 2` | One of 3 variants for the breed (FR-009) |
| personality | `Personality` | Influences activity/likes weighting |
| likes | `Partial<Record<ItemId, number>>` | Preference strength per item; sign/scale drives trust delta |
| trust | `number` | Clamped `[TRUST_MIN, TRUST_MAX]`; positive enables money (FR-004) |
| hunger | `number` | `0` = full … `HUNGER_MAX` = starving; rises over time (FR-010a), lowered by feeding |
| sleep | `number` | Tiredness `0..SLEEP_MAX`; rises awake, falls asleep when high, lowered while sleeping (FR-010/011) |
| activity | `Activity` | Current behavior |
| tileX, tileY | `number` | Position in isometric grid (renderer projects to screen) |

**State transitions (activity)** — computed in `simulation.step`:

- `wandering → sitting`: random/periodic pause while awake.
- `wandering|sitting → sleeping`: when `sleep ≥ SLEEP_FALL_ASLEEP`.
- `sleeping → wandering`: when `sleep ≤ SLEEP_WAKE` (sleep decreases while sleeping).
- Applying an action MAY wake a sleeping cat (edge case).

**Derived rules**:

- *Full*: `hunger ≤ 0` → feeding is canceled (FR-005).
- *Feedable for money*: successful feed AND `trust > 0` → award money scaled by trust
  (FR-004); never when `trust ≤ 0` (SC-003).

### Player

| Field | Type | Notes |
|-------|------|-------|
| money | `number` | Starts at `100` (FR-012); never negative |
| inventory | `Partial<Record<ItemId, number>>` | Counts of owned items; foods decrement on use |
| firstCatClaimed | `boolean` | Gates the free first adoption (FR-016) |

### Settings

| Field | Type | Default |
|-------|------|---------|
| musicEnabled | `boolean` | `true` (gentle, user-controllable per Principle IV) |
| sfxEnabled | `boolean` | `true` |

### ShopState

| Field | Type | Notes |
|-------|------|-------|
| lastShopDay | `string` | Local calendar date `YYYY-MM-DD` of current roster (FR-018, D7) |
| adoptableCats | `Cat[]` | Exactly 5, deterministically seeded from `lastShopDay` |

Item purchases use the static catalog; no per-day item rotation required.

### GameState (root, persisted)

| Field | Type | Notes |
|-------|------|-------|
| version | `number` | Save schema version for forward migration |
| cats | `Cat[]` | Owned cats; length ≤ `HOME_CAPACITY` (default 6, FR-018a) |
| player | `Player` | See above |
| shop | `ShopState` | See above |
| settings | `Settings` | See above |
| lastSeen | `number` | Epoch ms of last save; used to accrue offline hunger on load (FR-010a) |

**Invariants**:

- `cats.length ≤ HOME_CAPACITY`; adoption blocked at capacity (FR-018a, SC-010).
- `player.money ≥ 0`; no purchase/adoption may make it negative (FR-019).
- `shop.adoptableCats.length === 5` whenever a roster exists (SC-004).
- Each `Cat.appearance ∈ {0,1,2}` valid for its breed.
- Persisted JSON round-trips losslessly; unknown/invalid blobs → fresh new game (D6).

## Constants (balancing — defaults set in code)

`TRUST_MIN/MAX`, `HUNGER_MAX`, `SLEEP_MAX`, `SLEEP_FALL_ASLEEP`, `SLEEP_WAKE`,
`HUNGER_RISE_PER_MS`, `SLEEP_RISE_PER_MS`, `SLEEP_RECOVER_PER_MS`, `HOME_CAPACITY = 6`,
`CAT_COST = 30`, `START_MONEY = 100`, `DAILY_CAT_COUNT = 5`, money-per-trust scaling, and
per-action trust deltas. Spec fixes only: START_MONEY 100, CAT_COST 30, DAILY_CAT_COUNT
5, first cat free, HOME_CAPACITY default 6.
