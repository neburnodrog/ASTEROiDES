# Plan: Deepen the Game State Machine

## Goal

Replace the four scattered boolean state flags (`started`, `gameOver`, `levelCompleted`, `restartLevel`) and the dead `paused` flag with a single `GameState` module that owns state identity, legal transitions, the post-death respawn timer, and rebuild signaling.

## Vocabulary (new)

- **GameState** — module owning the engine's current state and transition rules. One per `Game` instance, rebuilt with Game.
- **State values** — `"menu"`, `"playing"`, `"dying"`, `"levelComplete"`, `"gameOver"`. Strings (no enum needed in JS).
- **Dying** — explicit 3-second window after ship-asteroid collision when lives remain. Collision detection is suppressed during this window (latent-bug fix).
- **Respawn** — Dying → next Game (via `resetSketch`). Carries score, lives (post-pop), and level.
- **Rebuild** — the `index.js`-side action of calling `resetSketch` in response to `state.wantsRebuild`.

## Invariants preserved

- `Game.draw()` remains the single state dispatcher (switch instead of if/else).
- `State resets reconstruct, they do not mutate` — newly enforced for **level-up too** (today's `LevelUpScreen.newLevel()` mutates in place, contradicting this invariant; the refactor fixes it).
- Entity ownership and cleanup are untouched.
- Asset loading and p5 instance threading unchanged.

## Behavior preserved exactly

- 3-second post-death pause before respawn (via `setTimeout`).
- Game-over only on hit when `lifes.length === 0` (i.e. the *next* hit after the last life is popped, not the hit that pops it).
- Game-over restart resets to menu, level 1, score=null, lifes=null.
- Score and lives carry over across respawn and level-up.
- Sound effects fire at the same moments.

## Latent bug fixed (intentional behavior change)

- During the 3-second dying window, `checkIfCollisions()` no longer registers further ship-vs-asteroid hits. Today, an asteroid drifting through the dead ship would re-trigger `handleExplosion()` and pop a second life.

## Files

### NEW: `src/game/gameState.js`

```js
export default class GameState {
  constructor({ started = false, respawnDelayMs = 3000 } = {}) {
    this.current = started ? "playing" : "menu";
    this.wantsRebuild = false;
    this.rebuildArgs = null; // [started, level, score, lifes]
    this.respawnDelayMs = respawnDelayMs;
    this._timer = null;
  }

  startPlaying() {
    if (this.current === "menu") this.current = "playing";
  }

  shipDied({ wasFinalDeath, level, score, lifes }) {
    if (wasFinalDeath) {
      this.current = "gameOver";
    } else {
      this.current = "dying";
      this._timer = setTimeout(() => {
        this.rebuildArgs = [true, level, score, lifes];
        this.wantsRebuild = true;
      }, this.respawnDelayMs);
    }
  }

  levelCleared() {
    if (this.current === "playing") this.current = "levelComplete";
  }

  acknowledgeLevelUp({ level, score, lifes }) {
    if (this.current !== "levelComplete") return;
    this.rebuildArgs = [true, level, score, lifes];
    this.wantsRebuild = true;
  }

  acknowledgeGameOver() {
    if (this.current !== "gameOver") return;
    this.rebuildArgs = [false, 1, null, null];
    this.wantsRebuild = true;
  }

  isPlaying() { return this.current === "playing"; }
  isDying()   { return this.current === "dying"; }
}
```

### MODIFY: `src/game/game.js`

- [ ] Remove fields: `started`, `paused`, `gameOver`, `levelCompleted`, `restartLevel`
- [ ] Add field: `this.state = new GameState({ started })`
- [ ] Import `GameState` from `./gameState`
- [ ] `checkIfCollisions`: replace flag-mutation block with:
  ```js
  if (distance < asteroid.radius + 20) {
    this.ship.handleExplosion();
    this.soundManager?.play("shipExplosion");
    const wasFinalDeath = this.lifes.length === 0;
    if (!wasFinalDeath) this.lifes.pop();
    this.state.shipDied({
      wasFinalDeath,
      level: this.level,
      score: this.score,
      lifes: this.lifes,
    });
    if (wasFinalDeath) this.soundManager?.play("gameOver");
  }
  ```
- [ ] `checkIfCollisions`: add early-return at top: `if (!this.state.isPlaying()) return;` (the latent-bug fix)
- [ ] `checkIfLevelCompleted`: replace `this.levelCompleted = true` with `this.state.levelCleared()`. Keep the `this.level++` and `soundManager.play("levelUp")` calls — they're game-controller responsibilities, not state-machine responsibilities.
- [ ] `draw()`: replace if/else chain with switch on `this.state.current`:
  ```js
  switch (this.state.current) {
    case "menu":          this.startMenuScreen.draw(); break;
    case "playing":
    case "dying":         this.playGame(); break;
    case "levelComplete": this.levelUpScreen.draw(); break;
    case "gameOver":      this.gameOverScreen.draw(); break;
  }
  ```

### MODIFY: `src/game/state/startMenuScreen.js`

- [ ] `StartMenuScreen.draw()`: replace `this.game.started = true` with `this.game.state.startPlaying()`
- [ ] `LevelUpScreen`: delete the `newLevel()` method (in-place mutation removed — handled by Game rebuild)
- [ ] `LevelUpScreen.draw()`: replace `keyPressed` handler with:
  ```js
  this.p5.keyPressed = () => {
    if (this.p5.keyCode === 32 || this.p5.keyCode === 13) {
      this.game.state.acknowledgeLevelUp({
        level: this.game.level,
        score: this.game.score,
        lifes: this.game.lifes,
      });
    }
  };
  ```
- [ ] Remove unused `Asteroids` import (was only needed for `newLevel`)

### MODIFY: `src/game/state/gameOverScreen.js`

- [ ] Add `keyPressed` handler in `draw()`:
  ```js
  this.p5.keyPressed = () => {
    if (this.p5.keyCode === 32 || this.p5.keyCode === 13) {
      this.game.state.acknowledgeGameOver();
    }
  };
  ```

### MODIFY: `src/index.js`

- [ ] In `p5.draw`: delete the `if (game.gameOver) { p5.keyPressed = ... }` block (now owned by gameOverScreen)
- [ ] In `p5.draw`: replace `if (game.restartLevel) { resetSketch(true, game.level, game.score, game.lifes); }` with:
  ```js
  if (game.state.wantsRebuild) resetSketch(...game.state.rebuildArgs);
  ```

### MODIFY (optional): `ARCHITECTURE.md`

- [ ] Update §Invariants: replace "mutating Game's boolean flags" wording with "calling `state.<transition>()`"
- [ ] Update §Data Flow: replace step 5's `restartLevel` reference with `state.wantsRebuild`
- [ ] Add §Key Decisions entry: "Why a GameState module" — references this plan's deletion-test rationale

## Risks

| Risk | Mitigation |
|---|---|
| Timer leaks if user navigates away mid-dying | `GameState` is rebuilt with `Game`; old state object (and its `setTimeout` handle) is GC'd. Old timer would still fire and mutate the discarded object's `wantsRebuild`, but nothing reads it. No observable bug. |
| Level-up flow now goes through full Game rebuild instead of in-place mutation | Score (reference) survives rebuild via `setup(score, lifes)`. Ship and Asteroids rebuild via Game.setup() — identical outcome to current `newLevel()` which manually does the same work. |
| Suppressing collisions during Dying changes feel of the death animation | Manually test: ship explosion + 3s pause feels identical, no second-life-pop bug. |
| Reordering inside `checkIfCollisions` (pop before state.shipDied call) | Preserves the "next hit after last life is game-over" semantics exactly: `wasFinalDeath` is computed *before* the pop. |
| `gameOverScreen.keyPressed` reassigned every frame at 20fps | Same pattern as today's other screens — not new churn. Future input-dispatch refactor (Candidate #2) would fix all of them at once. |

## Order of work

1. Create `src/game/gameState.js` with no callers yet (compiles, does nothing).
2. Wire `Game` to use `GameState`: add field, replace flag reads in `draw()` only (write-sites still mutate flags too — both work in parallel briefly).
3. Replace flag writes in `Game.checkIfCollisions` and `Game.checkIfLevelCompleted` with state transitions. Remove `Game.gameOver`, `Game.levelCompleted`, `Game.restartLevel` fields.
4. Update screens (StartMenu, LevelUp, GameOver) to call state methods and own their keyPressed handlers.
5. Update `index.js`: delete game-over keyPressed block, swap `restartLevel` poll for `wantsRebuild`.
6. Remove `Game.started` and `Game.paused` fields.
7. Manual verification (see below).
8. (Optional) Update ARCHITECTURE.md.

## Manual verification checklist

- [ ] Start menu shows on first load; space/enter starts game.
- [ ] Movement, shooting, screen-wrap unaffected.
- [ ] Destroy all asteroids → level-up screen appears, shows correct level number.
- [ ] Space/enter on level-up → new wave appears, score preserved, lives preserved.
- [ ] Crash into asteroid with multiple lives → ship explodes, 3-second pause, respawn at center with one less life.
- [ ] During the 3-second dying window, drifting asteroid through ship position does NOT trigger a second explosion (latent bug fix).
- [ ] Crash with no lives → game-over screen shows current score.
- [ ] Space/enter on game-over → returns to start menu at level 1, score 0, 3 lives.
- [ ] No console errors.

## Review (filled after implementation)

### Implementation status

- [x] Step 1: Create `src/game/gameState.js`
- [x] Step 2: Wire `Game` to use `GameState` — constructor, switch dispatcher, collision early-return, level-completed gating
- [x] Step 3: `Game.checkIfCollisions` rewritten with `wasFinalDeath` semantic preserving the "last-life triggers respawn-at-0, next hit is game-over" behavior
- [x] Step 4: `StartMenuScreen` / `LevelUpScreen` updated; `newLevel()` and unused `Asteroids` import deleted
- [x] Step 5: `GameOverScreen` now owns its `keyPressed` handler
- [x] Step 6: `index.js` polls `state.wantsRebuild` and spreads `rebuildArgs`; legacy game-over handler block deleted
- [x] Bonus fix: `checkIfLevelCompleted` gated on `state.isPlaying()` — caught while reading the final code that a stray in-flight shot destroying the last asteroid during the 3s dying window would double-increment `this.level` (state.levelCleared() guards itself, but `this.level++` was unconditional)
- [x] Webpack dev build: `npm run build:dev` compiles successfully
- [ ] Manual verification in browser (pending — see checklist above)
- [ ] ARCHITECTURE.md update (deferred per user)

### Files changed

- `src/game/gameState.js` (new, 50 lines)
- `src/game/game.js` (constructor, `checkIfCollisions`, `checkIfLevelCompleted`, `draw`)
- `src/game/state/startMenuScreen.js` (StartMenu's keyPressed; LevelUp loses `newLevel()` and `Asteroids` import)
- `src/game/state/gameOverScreen.js` (owns its keyPressed)
- `src/index.js` (deleted game-over handler block; swapped `restartLevel` poll for `wantsRebuild`)

### Vocabulary added

`GameState`, `state.current ∈ { "menu", "playing", "dying", "levelComplete", "gameOver" }`, `shipDied`, `levelCleared`, `acknowledgeLevelUp`, `acknowledgeGameOver`, `wantsRebuild`, `rebuildArgs`.

