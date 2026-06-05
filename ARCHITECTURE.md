# Architecture

> ASTEROiDES is a browser-based Asteroids clone rendered with p5.js (Canvas 2D) and bundled by Webpack. It uses a fixed-tick frame loop, instance-mode rendering, and a class-based entity model coordinated by a central `Game` controller.

## Overview

The application boots a single p5 instance in `src/index.js`. The p5 instance owns the render loop (`preload → setup → draw` at 60fps) and is passed by reference into every game class. A central `Game` object dispatches each frame to one of five states (`menu`, `playing`, `dying`, `levelComplete`, `gameOver`) owned by a `GameState` module. Game state transitions (new level, restart after death, "start game" from menu) are implemented by reconstructing the `Game` instance from `index.js` in response to `state.wantsRebuild`, while preserving score, lives, and level number across the rebuild.

There are no external services, no persistence layer, and no tests. The only runtime dependency is `p5` (with its `p5.sound` addon).

## Module Map

| Module | Path | Purpose | Key Files |
|---|---|---|---|
| Bootstrap | `src/index.js` | p5 instance creation, asset preload, top-level state reset wiring | `index.js` |
| Game Controller | `src/game/` | Per-life Game instance, state-machine dispatch, collision/score logic | `game.js`, `gameState.js`, `input.js`, `soundManager.js`, `helpers.js` |
| Entities | `src/game/elements/` | Ship, Asteroids, Shot, Debris, Score, Life, Background, Stars — all class-based, all own their own `draw()` | `ship.js`, `asteroids.js`, `shot.js`, `debris.js`, `asteroidDebris.js`, `shipDebris.js`, `shipTrace.js`, `background.js`, `stars.js`, `score.js`, `life.js` |
| Screens | `src/game/state/` | Non-playing game states rendered as full-canvas overlays | `startMenuScreen.js` (exports `StartMenuScreen` and `LevelUpScreen`), `gameOverScreen.js` |
| Assets | `src/{font,images,sounds,css}/` | Static assets imported via ES modules and bundled by Webpack's `type: "asset"` rule | `font/SpaceQuest-yOY3.ttf`, `images/ship.png`, `images/heart.png`, `sounds/*.wav` |
| Build | `webpack.config.js`, `.babelrc` | Bundling, dev server (HMR on :8080), asset loaders, `p5` ProvidePlugin | `webpack.config.js` |

## Entry Points

- **Application bootstrap**: `src/index.js` — creates the p5 instance, preloads assets, constructs the long-lived `Input` and `SoundManager`, defines `resetSketch()` (the rebuild-Game function called on game-over restart and level-up), and registers `keydown` blocking for arrows/space at the document level.
- **Game controller**: `src/game/game.js` — dispatches each frame based on `state.current` via `draw()`, runs `playGame()` during `"playing"` and `"dying"`, constructs all entities in `setup()`.
- **State machine**: `src/game/gameState.js` — owns `state.current`, the legal transitions (`startPlaying`, `shipDied`, `levelCleared`, `acknowledgeLevelUp`, `acknowledgeGameOver`), the 3-second `Dying` timer, and the `wantsRebuild` + `rebuildArgs` signal that `index.js` polls to trigger `resetSketch`.
- **Input dispatcher**: `src/game/input.js` — single owner of `p5.keyPressed` and the action vocabulary (`thrust`, `brake`, `rotateLeft`, `rotateRight`, `shoot`, `confirm`). Exposes `isHeld(action)` for held inputs and `wasPressed(action)` (consume-on-read) for one-shots. Constructed once in `index.js`; survives `Game` reconstructions.
- **Player entity**: `src/game/elements/ship.js` — physics integration, shot/trace/debris spawning, screen-wrap. Reads input via `this.game.input.isHeld(...)` / `wasPressed(...)`.
- **Asteroid system**: `src/game/elements/asteroids.js` — spawns initial wave per `level`, handles splitting (`X` → `M` → `S`) on hit, owns the asteroid array.
- **Sound dispatch**: `src/game/soundManager.js` — wraps `p5.SoundFile`, applies a shared reverb to explosion/break sounds.

## Invariants

- **p5 instance mode only.** Never use bare p5 functions (`line(...)`, `dist(...)`). Every class receives the p5 instance via constructor and calls methods through `this.p5`. The only p5 globals are `p5` (the class) and `p5.SoundFile` (via the sound addon import in `index.js`).
- **`Game.draw()` is the single state dispatcher.** It switches on `this.state.current` and selects exactly one of: `startMenuScreen.draw()`, `playGame()` (for both `playing` and `dying`), `levelUpScreen.draw()`, or `gameOverScreen.draw()`. State changes happen by calling transition methods on `GameState` (`shipDied`, `levelCleared`, etc.) — never by reading or writing `state.current` directly from outside `GameState`.
- **Collision detection is suppressed during `dying`.** `Game.checkIfCollisions` early-returns when `!state.isPlaying()`. Shots in flight continue to register hits on asteroids during the 3-second window.
- **State resets reconstruct, they do not mutate.** Returning to play (after death or level-up) calls `resetSketch()` in `index.js`, which builds a fresh `Game` and passes `oldScore`/`oldLifes` as setup arguments. Do not add code that tries to "soft reset" entities in place.
- **Entities own their own cleanup.** Each entity class filters its own dead children (`filterOldShots`, `filterOldTraces`, `filterOldShipDebris`, `cleanExplodedAsteroids`). New entity types must follow the same pattern; do not add cleanup logic to `Game.playGame()`.
- **Collision detection runs before rendering each frame.** `playGame()` order is: `checkIfCollisions → checkForHits → checkIfExplodedAsteroids → checkIfLevelCompleted → draw entities`. Do not reorder — collision flags drive what the entities render on the same frame.
- **Asset references must be ES imports.** Webpack's `type: "asset"` rule resolves them at build time. String URLs to `public/` or `dist/` will not work, and adding `require()` calls will conflict with the `.babelrc` `modules: false` setting.
- **Document-level keydown guard must remain.** The handler at the bottom of `index.js` prevents the browser from scrolling when arrows/space are pressed. Removing it breaks gameplay. (Distinct from the `Input` module — the guard is browser-scroll suppression, not game-action mapping.)
- **All keyboard input flows through `Input`.** No module outside `src/game/input.js` may read `p5.keyCode`, call `p5.keyIsDown`, or assign `p5.keyPressed` / `p5.keyReleased`. Game-action callers use `this.game.input.isHeld(action)` or `this.game.input.wasPressed(action)`.

## Cross-Cutting Concerns

| Concern | Implementation | Location |
|---|---|---|
| Rendering | p5.js Canvas 2D, instance mode, 60fps `draw()` | `index.js` (instance creation), every entity's `draw()` |
| Audio | `p5.sound`-wrapped soundfiles with a shared reverb on explosions | `src/game/soundManager.js` |
| Input | All keyboard input flows through `src/game/input.js`. Ship and screens query via `input.isHeld(action)` for held inputs and `input.wasPressed(action)` (consume-on-read) for one-shots. `p5.keyPressed` is assigned exactly once, in the `Input` constructor. | `src/game/input.js`, callers in `ship.js`, `state/startMenuScreen.js`, `state/gameOverScreen.js` |
| Geometry/viewport | Vector helpers and responsive canvas sizing | `src/game/helpers.js` (`findOutWidth`, `findOutHeight`, `calcVectorValue`, `randomInteger`, `drawPolygon`) |
| Screen wrap | Each moving entity implements its own `ifOverflowed()` toroidal wrap | `ship.js`, `asteroids.js`, `shot.js` |

## External Integrations

None. ASTEROiDES is fully client-side and offline-capable once bundled. The only "external" target is **GitHub Pages**, used as a static-hosting deploy target via `gh-pages -d dist`.

## Data Flow (per frame)

1. Browser fires p5's `draw` tick (60fps target).
2. `index.js` draws `Background` (parallax stars), then delegates to `game.draw()`.
3. `Game.draw()` switches on `state.current` to select one of: `startMenuScreen` / `playGame()` (for `playing` and `dying`) / `levelUpScreen` / `gameOverScreen`.
4. In `playGame()`:
   a. `checkIfCollisions()` — ship-vs-asteroid distance test; early-returns when `!state.isPlaying()`. On hit, calls `state.shipDied(...)`, which moves state to `dying` (with a 3-second timer) or `gameOver` based on `wasFinalDeath`.
   b. `checkForHits()` — shot-vs-asteroid distance test; marks asteroids/shots as exploded/hit, awards score, plays break sound. Runs during `dying` too — in-flight shots continue to score.
   c. `checkIfExplodedAsteroids()` — asks `Asteroids` to split large/medium asteroids into smaller children and remove the exploded ones.
   d. `checkIfLevelCompleted()` — early-returns when `!state.isPlaying()`. Otherwise, if no asteroids remain, increments `level` and calls `state.levelCleared()`.
   e. Each entity's `draw()` runs: physics → cleanup → render.
5. After `Game.draw()` returns, `index.js` checks `game.state.wantsRebuild` and (if set) calls `resetSketch(...game.state.rebuildArgs)` to construct a fresh `Game`.
6. FPS counter is overlaid in the bottom-left for diagnostic visibility.

## Key Decisions

### Why p5 instance mode (not global mode)
Instance mode keeps p5's ~200 globals out of the module scope, makes the code Webpack-tree-shakable, and avoids name collisions with browser globals (`background`, `text`, `line`). The trade-off is verbosity — every class receives and stores a p5 reference — but it pays off for bundling and for keeping the code analyzable.

### Why reconstruct `Game` on state transitions
Entities cache references to one another (ship → shots → debris) and to the p5 instance. Resetting in-place would require coordinated nulling of cross-references across ~12 entity classes. Reconstructing one `Game` instance and letting the GC reclaim the old one is simpler, faster to reason about, and avoids subtle stale-reference bugs across levels.

### Why a `GameState` module
Previously, "what state is the game in?" was encoded as four independent booleans (`started`, `gameOver`, `levelCompleted`, `restartLevel`, plus a dead `paused`) that could be mutated from any module — screens, collision code, and even `index.js` (which polled `restartLevel`). The interface was "any caller may write any flag," which is barely an interface at all. Consolidating into a `GameState` module gives the engine a deep module with a small surface: callers send transition events (`startPlaying`, `shipDied`, `levelCleared`, `acknowledgeLevelUp`, `acknowledgeGameOver`), the module enforces legal moves, owns the 3-second post-death timer, and exposes a single `wantsRebuild` flag plus `rebuildArgs` for `index.js` to poll. Making `dying` an explicit state also closed a latent bug: collisions are now suppressed during the 3-second window, so a drifting asteroid no longer re-triggers `handleExplosion` on a dead ship.

### Why an `Input` module
Previously, keyboard handling was scattered: movement and braking polled `p5.keyIsDown(<keyCode>)` from inside `Ship.draw()`; shooting and screen transitions reassigned `p5.keyPressed` from at least four call sites (`Ship.shoot`, `StartMenuScreen.draw`, `LevelUpScreen.draw`, `GameOverScreen.draw`), each rewriting the callback from inside its own per-frame `draw()` loop. The "interface" was *"any module may overwrite p5.keyPressed; whoever wrote last this frame wins"* — barely an interface. The action vocabulary was implicit in 8 scattered magic keycodes (32, 13, 37–40, 65, 68, 83, 87). Consolidating into a single `Input` module gives the engine one deep place that owns the keyboard: it assigns `p5.keyPressed` exactly once, exposes a tiny two-method interface (`isHeld(action)`, `wasPressed(action)`), and makes the key-to-action mapping a single table at the top of `input.js`. The only entry point into game input is now `this.game.input.<query>(action)`. This is also the seam future rebindable controls, gamepad, or touch support would plug into.

### Why `module.hot.decline()` in `src/index.js`
p5's `preload` → `setup` lifecycle binds to the module-scope variables (`spaceQuest`, `ship`, `heart`) at first load. When webpack HMR hot-replaces `index.js`, the new module re-runs and resets those `let` bindings to `undefined`, but p5 does not re-run `preload` — so `setup` can fire (triggered by an async preload-tracker decrement from `p5.sound`) with `spaceQuest` still `undefined`, and `p5.textFont(null)` throws. Declining HMR forces a full page reload on edits, which re-runs the entire lifecycle.
