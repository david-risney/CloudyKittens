# Feature Specification: Cloudy Kittens Game

**Feature Branch**: `001-cloudy-kittens-game`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Notes about the game are in the 'cat game - Cloudy Kittens.txt' file"

## Clarifications

### Session 2026-06-15

> The user was unavailable to answer interactively; the following decisions record
> well-founded recommended defaults applied to resolve the highest-impact ambiguities.
> They may be revisited if the designer disagrees.

- Q: How does an in-game "day" advance (controls daily shop cat refresh)? → A: By the
  real-world calendar date — opening the game on a new local calendar day starts a new
  day with a fresh selection of adoptable cats.
- Q: Does a cat's hunger increase again over time so it needs repeated feeding? → A:
  Yes — hunger rises gradually while the game is running (and accrues based on elapsed
  real time across sessions), so cats become feedable again, sustaining the money loop.
- Q: What is the direction of "sleep level," and when does a cat fall asleep? → A: Sleep
  level represents tiredness; it rises while the cat is awake, the cat falls asleep when
  sleep level is high enough, and sleeping lowers it back down.
- Q: Is there a limit to how many cats the player can own at once? → A: Yes — the home
  has a maximum capacity (default 6 cats, tunable); adoption is prevented when the home
  is full.

## User Scenarios & Testing *(mandatory)*

Cloudy Kittens is a calm, cute cat-care game set in a cozy home interior shown from a
2D isometric perspective with a subdued beige color theme. The player adopts cats,
learns what each cat likes, builds trust by feeding, playing, and petting, and earns
money that lets them adopt and care for more cats. The experience is gentle and
forgiving with no fail states.

### User Story 1 - Care for a cat to build trust and earn money (Priority: P1)

A player chooses an item or the pet action from the bottom UI and applies it to a cat
wandering the home. Feeding the right food and playing with liked toys raises the
cat's trust; feeding a cat with positive trust earns money. This is the core gameplay
loop.

**Why this priority**: This is the heart of the game — the moment-to-moment loop of
caring for cats. Without it there is no game. It is independently playable with a
single starter cat.

**Independent Test**: Start the game with the free first cat, select food from the
inventory, click the cat, and confirm hunger decreases, trust changes according to how
much the cat likes the food, and money increases when the fed cat has positive trust.

**Acceptance Scenarios**:

1. **Given** a cat with positive trust and non-zero hunger, **When** the player feeds
   it a food it likes, **Then** the food is consumed from inventory, the cat's hunger
   decreases, its trust increases, and the player gains money (more trust yields more
   money).
2. **Given** a cat that is already full (hunger at minimum), **When** the player tries
   to feed it, **Then** the feeding is canceled: no food is consumed, hunger is
   unchanged, and no money is gained.
3. **Given** a cat, **When** the player uses a toy on it, **Then** the toy is not
   consumed and the cat's trust rises or falls depending on how much it likes the toy.
4. **Given** a cat, **When** the player uses the pet action on it, **Then** the cat's
   trust increases.
5. **Given** a cat, **When** the player feeds it a food it dislikes, **Then** hunger
   decreases but trust drops (or rises less) according to its preference.

---

### User Story 2 - Adopt cats and buy items from the shop (Priority: P2)

A player opens the shop to adopt new cats (a fresh selection each day) and to buy
items (foods and toys) that match different cats' likes, spending the money earned
from caring for cats.

**Why this priority**: Adoption and purchasing give the game progression and variety,
and supply the items needed to sustain the core loop, but the core loop (P1) is
playable with the free starter cat before this exists.

**Independent Test**: Open the shop, confirm the first cat can be adopted for free and
additional cats cost 30 coins each, confirm five adoptable cats are offered, and
confirm buying an item deducts its cost and adds it to the player's inventory.

**Acceptance Scenarios**:

1. **Given** a new player, **When** they open the shop's cat section, **Then** the
   first cat is free and each additional cat costs 30 coins.
2. **Given** the shop is open on a given day, **When** the player views the cat
   section, **Then** exactly five adoptable cats are shown for that day.
3. **Given** the player has enough money, **When** they buy an item, **Then** the cost
   is deducted from their money and the item is added to their inventory.
4. **Given** the player has insufficient money, **When** they attempt to adopt a cat or
   buy an item, **Then** the purchase is prevented and the player keeps their money.
5. **Given** a new day begins, **When** the player opens the shop, **Then** a new
   selection of five adoptable cats is offered.

---

### User Story 3 - Observe living cats and look up their details (Priority: P2)

Cats wander the home, sometimes sit, and sometimes fall asleep based on their sleep
level. The player can use the lookup action on a cat to open a book-like modal showing
that cat's details (name, breed, personality, likes, and current trust/hunger/sleep
state).

**Why this priority**: Bringing the cats to life and letting the player learn each
cat's likes makes the care loop meaningful and is needed to play well, but the loop
can technically function before lookup exists.

**Independent Test**: Watch a cat move around the home and change between wandering,
sitting, and sleeping; then use lookup on it and confirm a book-style modal displays
its name, breed, personality, likes, and current state.

**Acceptance Scenarios**:

1. **Given** cats are in the home, **When** time passes, **Then** each cat wanders,
   sometimes sits, and falls asleep when its sleep (tiredness) level is high enough.
2. **Given** a sleeping cat, **When** it sleeps, **Then** its sleep (tiredness) level
   decreases over time until it wakes.
3. **Given** the player selects the lookup action and clicks a cat, **When** the modal
   opens, **Then** it shows the cat's name, breed, personality, likes, and current
   trust, hunger, and sleep state in a book-page presentation.

---

### User Story 4 - Calm presentation, intro screen, and settings (Priority: P3)

On opening the game, the player sees an intro screen with the game name (in a
cloud-style font), the designer credit "Elisabeth Risney", a large cat face, a Start
button, and a settings button for music and sound effects. Calm background music plays
and sound effects accompany actions and occasional cat meows.

**Why this priority**: Presentation and audio make the game feel polished and calm but
are not required for the core care loop to function.

**Independent Test**: Launch the game, confirm the intro screen shows the title,
designer credit, cat face, Start and settings buttons; open settings and toggle music
and sound effects on/off and confirm the toggles take effect.

**Acceptance Scenarios**:

1. **Given** the game is opened, **When** the intro screen appears, **Then** it shows
   the game name in a cloud-style font, the designer credit, a large cat face, a Start
   button, and a settings button.
2. **Given** the intro screen, **When** the player opens settings, **Then** they can
   independently turn music and sound effects on or off.
3. **Given** the player presses Start, **When** the game begins, **Then** calm
   background music plays (if enabled) and the home interior with the player's cats is
   shown.
4. **Given** the player performs an action on a cat, **When** the action completes,
   **Then** a corresponding sound effect plays (if sound effects are enabled); cats
   also meow at random intervals.

---

### User Story 5 - Automatic save and load of progress (Priority: P2)

The game automatically saves the player's progress (cats, their states, inventory,
money, and current day) and automatically loads it the next time the game is opened,
so the player can stop and resume without losing anything.

**Why this priority**: Persistence protects the player's progress and is essential for
a satisfying ongoing experience, though the core loop can be demonstrated in a single
session without it.

**Independent Test**: Make progress (adopt a cat, earn money, change a cat's state),
close and reopen the game, and confirm the prior state is restored automatically
without any manual save/load action.

**Acceptance Scenarios**:

1. **Given** the player has made progress, **When** state changes occur, **Then**
   progress is saved automatically without manual action.
2. **Given** previously saved progress exists, **When** the player opens the game,
   **Then** that progress is loaded automatically.
3. **Given** no prior save exists, **When** the player opens the game for the first
   time, **Then** a fresh game starts with 100 coins, the free first cat available, and
   default settings.

---

### Edge Cases

- **Feeding a full cat**: feeding is canceled — no food consumed, hunger unchanged, no
  money gained.
- **Feeding a cat with zero or negative trust**: hunger still decreases and food is
  consumed, but no money is earned (money requires positive trust).
- **Insufficient funds**: adopting a cat or buying an item is prevented; money is
  unchanged.
- **Empty inventory of a needed item**: the player cannot apply an item they do not
  have; foods are consumed on use while toys and petting are not.
- **All cats asleep**: the player can still select and apply actions; applying an
  action may wake a sleeping cat.
- **Re-opening the shop the same day**: the same five daily cats are shown (selection
  refreshes only on a new real-world calendar day).
- **Home at capacity**: when the home already holds the maximum number of cats, adoption
  is prevented even if the player can afford it.
- **Previously full cat over time**: a cat fed to full eventually becomes hungry again
  as time passes, so it can be fed (and earn money) again later.
- **Corrupted or unreadable saved data**: the game falls back to a safe fresh start
  rather than failing to load.
- **Reduced-motion preference**: cat movement and animations are softened or stilled
  so the game remains comfortable.

## Requirements *(mandatory)*

### Functional Requirements

**Core care loop**

- **FR-001**: The game MUST present a bottom UI letting the player choose an item, the
  pet action, or the lookup action, and then apply it to a cat by clicking that cat.
- **FR-002**: The game MUST let the player feed a food item to a cat, which consumes
  one unit of that food from inventory and decreases the cat's hunger level.
- **FR-003**: Feeding MUST adjust the cat's trust based on how much the cat likes the
  food (liked food raises trust; disliked food lowers it or raises it less).
- **FR-004**: When a cat with positive trust is successfully fed, the game MUST award
  money to the player, with higher trust yielding more money.
- **FR-005**: When the player attempts to feed a cat that is already full, the game
  MUST cancel the feeding: no food consumed, hunger unchanged, no money gained.
- **FR-006**: The game MUST let the player use a toy on a cat without consuming the toy,
  adjusting trust based on how much the cat likes the toy.
- **FR-007**: The game MUST let the player use the pet action on a cat to raise its
  trust.
- **FR-008**: The game MUST let the player use the lookup action on a cat to open a
  book-page-style modal showing the cat's name, breed, personality, likes, and current
  trust, hunger, and sleep state.

**Cats and their behavior**

- **FR-009**: Each cat MUST have a breed (with three distinct appearances per breed), a
  personality (e.g., playful, hunter, savage, cute, sleepy), a set of likes drawn from
  the item set (salmon, tuna, catnip, mouse toy, mouse, chicken, string, treat), and a
  name.
- **FR-010**: Each cat MUST maintain a trust level (raised by giving liked items and
  playing/petting), a hunger level (lowered by feeding and rising gradually over time),
  and a sleep level representing tiredness (rising while awake, lowered by sleeping).
- **FR-010a**: A cat's hunger MUST increase gradually over time, including time elapsed
  while the game was closed, so that previously full cats eventually become feedable
  again and the care/money loop can continue.
- **FR-011**: Cats MUST autonomously wander around the home, sometimes sit, and fall
  asleep when their sleep (tiredness) level is high enough; while sleeping, a cat's
  sleep level MUST decrease until it wakes.

**Player, economy, and inventory**

- **FR-012**: The player MUST start a new game with 100 coins of money.
- **FR-013**: The player MUST have an inventory of items corresponding to the likes of
  cats (foods and toys), and the UI MUST let the player select from owned items.
- **FR-014**: Food items MUST be consumed when used; toy items and the pet action MUST
  NOT be consumed when used.

**Shop**

- **FR-015**: The shop MUST offer a cat section presenting five adoptable cats per day.
- **FR-016**: The first cat MUST be free to adopt; each additional adoptable cat MUST
  cost 30 coins.
- **FR-017**: The shop MUST offer an items section where the player can buy items,
  deducting their cost from the player's money and adding them to inventory.
- **FR-018**: The shop MUST refresh its selection of five adoptable cats once per new
  day, where a new day is determined by the player's real-world local calendar date
  (opening or playing the game on a later calendar date than the last recorded day
  begins a new day).
- **FR-018a**: The game MUST enforce a maximum home capacity for owned cats (default 6,
  tunable) and MUST prevent adopting a cat when the home is already at capacity.
- **FR-019**: The game MUST prevent any adoption or purchase the player cannot afford,
  leaving money unchanged.

**Persistence**

- **FR-020**: The game MUST automatically save progress (cats and their states,
  inventory, money, current day, and settings) as it changes, without manual action.
- **FR-021**: The game MUST automatically load saved progress when reopened, and start
  a fresh game when no valid save exists.

**Presentation, intro, and audio**

- **FR-022**: The game MUST render a cozy home interior, including a couch, in a 2D
  isometric perspective with a subdued beige color theme.
- **FR-023**: The game name MUST be displayed using a cloud-style font/lettering.
- **FR-024**: The game MUST show an intro screen with the game name, the designer
  credit "Elisabeth Risney", a large cat face, a Start button, and a settings button.
- **FR-025**: Settings MUST let the player independently turn background music and
  sound effects on or off.
- **FR-026**: Calm, freely/creative-commons-licensed background music MUST play during
  the game when music is enabled.
- **FR-027**: Sound effects MUST play for actions performed on cats, and cats MUST meow
  at random intervals, both subject to the sound-effects setting.
- **FR-028**: The experience MUST remain calm and forgiving with no punishing fail
  states, consistent with the project constitution.

### Key Entities *(include if feature involves data)*

- **Cat**: A pet in the home. Attributes: name, breed (one of several, each with three
  appearances), personality, likes (subset of items), trust level, hunger level, sleep
  level, and current activity (wandering, sitting, sleeping).
- **Item**: A thing the player owns and uses on cats. Type is food or toy. Foods are
  consumed on use; toys are not. Examples: salmon, tuna, catnip, mouse toy, mouse,
  chicken, string, treat. Each has a shop cost.
- **Player**: The person playing. Attributes: money (starts at 100), inventory of
  items, set of adopted cats (up to the home capacity, default 6), whether the free
  first cat has been claimed, and the last calendar day the shop was refreshed.
- **Shop offering**: The daily selection of five adoptable cats and the purchasable
  items, refreshed each new day.
- **Settings**: Player preferences for music on/off and sound effects on/off.
- **Save state**: The persisted snapshot of player, cats, inventory, money, day, and
  settings used for auto-save and auto-load.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new player can complete the core care loop — select a food, feed the
  free starter cat, and see trust rise and money awarded — within 1 minute of pressing
  Start, with no instructions required beyond the on-screen UI.
- **SC-002**: 100% of feeding attempts on a full cat result in no food consumed, no
  hunger change, and no money gained.
- **SC-003**: Money is awarded in 100% of successful feedings of cats with positive
  trust, and never awarded when trust is zero or negative.
- **SC-004**: The shop always presents exactly five adoptable cats per day, the first
  cat is free, and each additional cat costs exactly 30 coins.
- **SC-005**: After closing and reopening the game, 100% of the player's prior
  progress (cats, states, inventory, money, day, settings) is restored automatically.
- **SC-006**: At least 95% of players surveyed describe the game as calm and cute, and
  report encountering no punishing or stressful fail states.
- **SC-007**: Cats visibly change activity (wander, sit, sleep) during a typical
  2-minute observation period without player interaction.
- **SC-008**: Music and sound-effect toggles take effect immediately and persist across
  sessions for 100% of changes.
- **SC-009**: A cat fed to full becomes feedable again after enough time elapses,
  allowing the player to earn money from the same cat repeatedly across play sessions.
- **SC-010**: Adoption is blocked in 100% of attempts made when the home is already at
  its maximum capacity.

## Assumptions

- Target platform is a modern desktop/laptop web browser; touch and small-screen mobile
  layouts are a nice-to-have, not required for the first version.
- The game is single-player, local-only, and requires no account, login, or network
  backend; progress is stored on the player's device per the constitution's
  static-deployability principle.
- A new day (for daily shop cat refresh) is determined by the player's real-world local
  calendar date; opening the game on a later date than last recorded begins a new day.
- Exact numeric tuning (trust gain/loss amounts, money-per-trust scaling, hunger-rise
  and sleep rates, home capacity beyond the default of 6, food/toy preferences per cat,
  item shop prices) are balancing details to be set during planning and play-testing;
  the spec fixes only the values explicitly given (start money 100, cat cost 30, first
  cat free, five cats per day, default home capacity 6).
- The initial item set is the eight likes named in the notes (salmon, tuna, catnip,
  mouse toy, mouse, chicken, string, treat), classified as foods or toys; mouse toy and
  string are toys, the food-like items are foods, and catnip behaves as a toy/treat.
- Background music and sound effects use assets under licenses that permit free
  redistribution (creative commons or similar); sourcing specific assets is an
  implementation task.
- The number of distinct breeds and the full personality list are extensible; the
  notes' examples are treated as a representative starting set.
