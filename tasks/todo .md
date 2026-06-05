# Plan: Deepen Input Dispatch

## Goal

Build a single `Input` module that owns ALL keyboard polling and event handling for the game. Eliminate the 60Hz `p5.keyPressed` reassignment scattered across `Ship` and three screens. Replace 8 magic-number keycodes with a 6-action vocabulary. Assign `p5.keyPressed` exactly **once**, ever.

## Decisions locked

- **Interface**: poll-only, two methods.
  - `isHeld(action) → bool` — held inputs (thrust, brake, rotate). Delegates to `p5.keyIsDown`.
  - `wasPressed(action) → bool` — one-shot inputs (shoot, confirm). Consume-on-read per-action.
- **Action vocabulary** (6 actions): `thrust`, `brake`, `rotateLeft`, `rotateRight`, `shoot`, `confirm`.
- **Key mapping** — preserves current behavior:
  - `thrust`: 87 (W), 38 (Up)
  - `brake`: 83 (S), 40 (Down)
  - `rotateLeft`: 65 (A), 37 (Left)
  - `rotateRight`: 68 (D), 39 (Right)
  - `shoot`: 32 (Space), 13 (Enter)
  - `confirm`: 32 (Space), 13 (Enter)
- **Module location**: constructed once in `src/index.js` (same scope as `soundManager`), passed into `Game` constructor. Survives `Game` reconstructions on level-up/respawn/restart.
- **Document-level keydown blocker** at `index.js:73-79`: **stays put**. Browser-scroll suppression is a distinct concern from game-action mapping.
- **`wasPressed` semantics**: per-action `Set` of pending presses. A single physical key-press of Space populates BOTH `shoot` and `confirm` pending — reading one doesn't clear the other. Only the active consumer (Ship during `playing`, screen during `menu`/`levelComplete`/`gameOver`) reads each frame, so they never compete.
- **`isHeld` mechanism**: query `p5.keyIsDown(keyCode)` per call. No internal `held` state needed. Smaller module.

## Vocabulary

- **Input** — module that owns the keyboard interface. One per p5 instance, constructed in `index.js`, lives for the lifetime of the page.
- **Action** — a named game intent (`thrust`, `confirm`, etc.) decoupled from physical keys.
- **Key map** — the action → [keyCode] table, currently hardcoded in `input.js`.

## Files Touched

| File | Change |
|---|---|
| `src/game/input.js` | **NEW** — `Input` class, ~30 LOC. |
| `src/index.js` | Construct `input = new Input(p5)`; pass into `new Game(...)`. Document-level keydown blocker untouched. |
| `src/game/game.js` | Accept `input` in constructor; store on `this.input`. Pass into `Ship`. Screens reach it via `game.input`. |
| `src/game/elements/ship.js` | `rotateShip`, `accelerate`, `brakes` use `input.isHeld`. Delete `shoot()`'s `p5.keyPressed` reassignment; inline a `wasPressed("shoot")` check at the end of `draw()`. |
| `src/game/state/startMenuScreen.js` | Extract `_render()` template method; `draw()` calls `_render()` then `wasPressed("confirm")`. `LevelUpScreen` overrides `_onConfirm()` only (not `draw()`). |
| `src/game/state/gameOverScreen.js` | Delete `p5.keyPressed` reassignment; add `wasPressed("confirm")` check. |
| `ARCHITECTURE.md` | Add `Input` to Module Map, update Cross-Cutting Concerns "Input" row, add a "Why an Input module" Key Decision. |

## Implementation Steps

### 1. Create `src/game/input.js`

```js
const KEY_MAP = {
  thrust: [87, 38],
  brake: [83, 40],
  rotateLeft: [65, 37],
  rotateRight: [68, 39],
  shoot: [32, 13],
  confirm: [32, 13],
};

const ACTIONS_BY_KEY = {};
for (const [action, codes] of Object.entries(KEY_MAP)) {
  for (const code of codes) {
    (ACTIONS_BY_KEY[code] ??= []).push(action);
  }
}

export default class Input {
  constructor(p5) {
    this.p5 = p5;
    this._pending = new Set();
    p5.keyPressed = () => {
      const actions = ACTIONS_BY_KEY[p5.keyCode];
      if (actions) for (const a of actions) this._pending.add(a);
    };
  }

  isHeld(action) {
    const codes = KEY_MAP[action];
    return codes ? codes.some((c) => this.p5.keyIsDown(c)) : false;
  }

  wasPressed(action) {
    if (!this._pending.has(action)) return false;
    this._pending.delete(action);
    return true;
  }
}
```

### 2. Wire `Input` into `src/index.js`

- Import `Input` from `./game/input`.
- Construct `const input = new Input(p5);` alongside `soundManager`.
- Pass into `new Game(p5, soundManager, input, started, level)`.
- Keep `module.hot.decline()` (full reload re-runs Input construction).
- Document-level keydown blocker untouched.

### 3. Update `src/game/game.js`

- Constructor signature: `(p5, soundManager, input, started, level)`. Store `this.input = input`.
- Ship reaches Input via `this.game.input` from inside Ship — no Ship constructor change needed.

### 4. Update `src/game/elements/ship.js`

- Replace `rotateShip()`:
  ```js
  rotateShip() {
    if (this.game.input.isHeld("rotateRight")) this.angleOfShip += PI / 40;
    else if (this.game.input.isHeld("rotateLeft")) this.angleOfShip -= PI / 40;
    // angle normalization untouched
  }
  ```
- Replace `accelerate()`: `if (this.game.input.isHeld("thrust")) { ... }` — preserve thrust sound logic.
- Replace `brakes()`: `if (this.game.input.isHeld("brake")) { ... }`.
- Delete the entire `shoot()` method.
- In `draw()`, replace the trailing `this.shoot(p5)` call with:
  ```js
  if (this.game.input.wasPressed("shoot")) {
    this.shots.push(new Shot(this.p5, this));
    if (this.game?.soundManager) this.game.soundManager.play("shoot");
  }
  ```

### 5. Restructure `src/game/state/startMenuScreen.js`

The current `LevelUpScreen.draw() → super.draw()` chain breaks under consume-on-read `wasPressed`: super would read and consume `confirm` first, leaving LevelUp's read returning `false`. Fix via template method.

```js
class StartMenuScreen {
  // ... constructor unchanged

  _render() {
    // all the existing p5.push/translate/text/pop block, sans p5.keyPressed
  }

  _onConfirm() {
    this.game.state.startPlaying();
  }

  draw() {
    this._render();
    if (this.game.input.wasPressed("confirm")) this._onConfirm();
  }
}

class LevelUpScreen extends StartMenuScreen {
  // constructor unchanged (still overrides this.controls = ...)

  _onConfirm() {
    this.game.state.acknowledgeLevelUp({
      level: this.game.level,
      score: this.game.score,
      lifes: this.game.lifes,
    });
  }
  // no draw() override needed
}
```

### 6. Update `src/game/state/gameOverScreen.js`

Replace the `p5.keyPressed` reassignment with:
```js
if (this.game.input.wasPressed("confirm")) this.game.state.acknowledgeGameOver();
```
Place it at the end of `draw()`, after the rendering block.

### 7. Update `ARCHITECTURE.md`

- **Module Map**: add `Input` row under "Game Controller" (`src/game/input.js`).
- **Cross-Cutting Concerns** → "Input" row: replace with "All keyboard input flows through `src/game/input.js`. Ship and screens query via `input.isHeld(action)` / `input.wasPressed(action)`. `p5.keyPressed` is assigned exactly once, in the Input constructor."
- **Invariants**: add "**Input flows through `Input`.** No module outside `input.js` may read `p5.keyCode`, `p5.keyIsDown`, or assign `p5.keyPressed` / `p5.keyReleased`."
- **Key Decisions**: add "### Why an Input module" — short rationale.

### 8. Manual verification

(No test runner — verification is manual via browser.)

- Start dev server: `npm start`.
- Walk via headless browser (playwright):
  - Menu → Space → playing.
  - Hold W/Up: ship accelerates. Release: decelerates.
  - Hold S/Down: ship brakes.
  - Hold A/Left, D/Right: ship rotates each direction.
  - Tap Space/Enter: one shot fires per press (not auto-fire on hold).
  - Collide with asteroid → dying → respawn cycle: thrust still works after respawn (Input survived Game reconstruction).
  - Clear a level → LevelUp screen → Space → next level (acknowledgeLevelUp, not startPlaying).
  - Die all lives → GameOver → Space → back to menu.
- Grep verification: `grep -rn "keyPressed *=\|keyIsDown\|keyCode" src/` should return ZERO hits outside `src/game/input.js` (the document-level blocker at `src/index.js:73-79` uses `evt.keyCode` from the browser's `onkeydown` event, not `p5.keyCode` — distinct concern, preserved).

## Risks / Watchlist

- **`LevelUpScreen extends StartMenuScreen` inheritance chain.** Step 5 restructures via template method. Verify LevelUp's `controls.text = ""` override still suppresses the controls line (the constructor override should remain untouched).
- **`p5.keyPressed` being called by p5 only when canvas has focus.** Today's behavior; preserved.
- **`framerate` shifts between screens.** `StartMenuScreen.draw()` calls `p5.frameRate(10)`, `gameOverScreen` calls `p5.frameRate(20)`. `wasPressed` doesn't care about frame rate (event-driven). `isHeld` is per-frame but only used during gameplay (60fps). No interaction.
- **No tests.** Verification is manual via headless browser; playwright screenshot tool times out on the live canvas — workaround from prior session: use `canvas.toDataURL('image/png')` via `browser_evaluate`.

## Out of Scope

- Gamepad / touch input.
- Rebindable controls (key remapping UI). The `KEY_MAP` constant is the seam where that would land later.
- Fixing the stale `CLAUDE.md` "Controls" section (claims `.`/`G` for shoot; code and in-game text say Space/Enter). Separate trivial doc fix.

## Review

### Status: implemented + verified, NOT committed (awaiting OK)

### What landed

- **`src/game/input.js` (new, 38 LOC)**: `Input` class. Constructor assigns `p5.keyPressed` exactly once. Public surface is `isHeld(action)` and `wasPressed(action)`. Internal `_pending` is `Map<keyCode, Set<action>>` (not a plain `Set<action>` as originally planned — see "Surprise during verification" below).
- **`src/index.js`**: imports `Input`, constructs `input = new Input(p5)` once alongside `soundManager`, passes both into every `new Game(...)`. Document-level keydown blocker untouched. `module.hot.decline()` untouched.
- **`src/game/game.js`**: constructor signature now `(p5, soundManager, input, started, level)`. Stores `this.input`.
- **`src/game/elements/ship.js`**: `rotateShip`, `accelerate`, `brakes` use `this.game.input.isHeld(...)`. `shoot()` method deleted; replaced with `fireIfPressed()` called at the bottom of `draw()`, using `wasPressed("shoot")`.
- **`src/game/state/startMenuScreen.js`**: restructured via template method — `_render()` for the text rendering, `_onConfirm()` for the action. `LevelUpScreen` overrides `_onConfirm()` only. No more `super.draw()` chain.
- **`src/game/state/gameOverScreen.js`**: replaced `p5.keyPressed` reassignment with `if (this.game.input.wasPressed("confirm")) ...`.
- **`ARCHITECTURE.md`**: added `Input` to Module Map and Entry Points; added "All keyboard input flows through `Input`" invariant; replaced the Cross-Cutting Concerns "Input" row; added a "Why an `Input` module" Key Decision.

### Surprise during verification

The originally-planned `_pending: Set<action>` had a bug: pressing Space on the menu queued BOTH `confirm` and `shoot` into `_pending`. The menu consumed `confirm` and transitioned to `playing`; on the next frame, Ship read `_pending` and fired a stray shot from the same physical key press. This was a behavioral regression — the old code's `p5.keyPressed = ...` reassignment couldn't queue across reassignments, so a single Space press meant exactly one action.

**Fix**: `_pending` became `Map<keyCode, Set<action>>`. A single physical key press now occupies one entry, and `wasPressed(action)` deletes the entire entry when it consumes a match. Reading `confirm` on Space clears the queued `shoot` from the same press. Verified via playwright: one Space tap on the menu yields `state="playing"` AND `shots=0` (was `shots=1` before the fix).

### Verification (no test runner exists — performed via headless playwright)

A temporary `window.__VERIFY = { get game() { ... }, input }` hook was added to `index.js` for in-page state introspection, then **removed** before this commit-ready state. The hook is no longer in `src/index.js`.

| Check | Result |
|---|---|
| `npm start` build | clean, 0 errors, 1 (pre-existing) warning |
| Page load | 0 console errors |
| `grep -rn "keyPressed\|keyIsDown\|keyCode\|keyReleased" src/` | only `src/game/input.js` (5 hits, all owned) and `src/index.js:77-78` (preserved browser blocker using `evt.keyCode` from `onkeydown`, distinct from p5) |
| **isHeld responds to keydown/keyup** | `isHeld("thrust")`: false → keydown(87) → true → keyup(87) → false |
| **Thrust (W)** | ship.position.x: 594 → 694 (moved 100px in facing direction) |
| **rotateLeft (A)** | angleOfShip: 0.000 → -1.492 |
| **rotateRight (D)** | angleOfShip: -1.492 → -0.079 |
| **Shoot (Space tap during playing)** | shots: 0 → 1 |
| **Brake (S)** | speed: 5.265 → 3.491 |
| **menu → confirm → playing** | state transitions cleanly, **shots=0** (no stray shot from confirm's Space) |
| **playing → empty asteroids → levelComplete** | state="levelComplete", level incremented to 2 |
| **levelComplete → confirm → playing (rebuild)** | new Game with 4 asteroids at level 2, **`game.input === input`** (same instance survived rebuild) |
| **shoot after rebuild** | new Ship's shots: 0 → 1 (Input survived; new Ship wired correctly) |
| **playing → forced wasFinalDeath → gameOver** | state="gameOver" |
| **gameOver → confirm → menu (rebuild)** | state="menu", level reset to 1, same Input instance |
| **menu → confirm → playing (after gameOver cycle)** | state="playing", shots=0 |

### Followups (not in scope)

- The stale `CLAUDE.md` "Controls" section still claims `.`/`G` for shoot; code uses Space/Enter (and so does the in-game text in `startMenuScreen.js:12`). Trivial doc fix — separate from this refactor.
- The `Input` module is now the seam for future rebindable controls, gamepad, or touch — `KEY_MAP` is the table to extend.

