# Architecture

> ASTEROiDES is a browser-based Asteroids clone rendered with p5.js (Canvas 2D) and bundled by Webpack. It uses a fixed-tick frame loop, instance-mode rendering, and a class-based entity model coordinated by a central `Game` controller.

## Overview

The application boots a single p5 instance in `src/index.js`. The p5 instance owns the render loop (`preload → setup → draw` at 60fps) and is passed by reference into every game class. A central `Game` object dispatches each frame to one of four states (start menu, playing, level-up, game-over) based on boolean flags. Game state transitions (new level, restart after death, "start game" from menu) are implemented by reconstructing the `Game` instance from `index.js` while preserving score, lives, and level number across the rebuild.

There are no external services, no persistence layer, and no tests. The only runtime dependency is `p5` (with its `p5.sound` addon).

## Module Map

| Module | Path | Purpose | Key Files |
|---|---|---|---|
| Bootstrap | `src/index.js` | p5 instance creation, asset preload, top-level state reset wiring | `index.js` |
| Game Controller | `src/game/` | Per-life Game instance, state-machine dispatch, collision/score logic | `game.js`, `soundManager.js`, `helpers.js` |
| Entities | `src/game/elements/` | Ship, Asteroids, Shot, Debris, Score, Life, Background, Stars — all class-based, all own their own `draw()` | `ship.js`, `asteroids.js`, `shot.js`, `debris.js`, `asteroidDebris.js`, `shipDebris.js`, `shipTrace.js`, `background.js`, `stars.js`, `score.js`, `life.js` |
| Screens | `src/game/state/` | Non-playing game states rendered as full-canvas overlays | `startMenuScreen.js` (exports `StartMenuScreen` and `LevelUpScreen`), `gameOverScreen.js` |
| Assets | `src/{font,images,sounds,css}/` | Static assets imported via ES modules and bundled by Webpack's `type: "asset"` rule | `font/SpaceQuest-yOY3.ttf`, `images/ship.png`, `images/heart.png`, `sounds/*.wav` |
| Build | `webpack.config.js`, `.babelrc` | Bundling, dev server (HMR on :8080), asset loaders, `p5` ProvidePlugin | `webpack.config.js` |

## Entry Points

- **Application bootstrap**: `src/index.js` — creates the p5 instance, preloads assets, defines `resetSketch()` (the rebuild-Game function called on game-over restart and level-up), and registers `keydown` blocking for arrows/space at the document level.
- **Game controller**: `src/game/game.js` — owns the state machine via `draw()`, runs `playGame()` each frame (collisions → render), constructs all entities in `setup()`.
- **Player entity**: `src/game/elements/ship.js` — input handling, physics integration, shot/trace/debris spawning, screen-wrap.
- **Asteroid system**: `src/game/elements/asteroids.js` — spawns initial wave per `level`, handles splitting (`X` → `M` → `S`) on hit, owns the asteroid array.
- **Sound dispatch**: `src/game/soundManager.js` — wraps `p5.SoundFile`, applies a shared reverb to explosion/break sounds.

## Invariants

- **p5 instance mode only.** Never use bare p5 functions (`line(...)`, `dist(...)`). Every class receives the p5 instance via constructor and calls methods through `this.p5`. The only p5 globals are `p5` (the class) and `p5.SoundFile` (via the sound addon import in `index.js`).
- **`Game.draw()` is the single state dispatcher.** It selects exactly one of: `startMenuScreen.draw()`, `gameOverScreen.draw()`, `levelUpScreen.draw()`, or `playGame()`. State changes happen by mutating Game's boolean flags (`started`, `gameOver`, `levelCompleted`, `restartLevel`) — never by calling state screens directly from outside Game.
- **State resets reconstruct, they do not mutate.** Returning to play (after death or level-up) calls `resetSketch()` in `index.js`, which builds a fresh `Game` and passes `oldScore`/`oldLifes` as setup arguments. Do not add code that tries to "soft reset" entities in place.
- **Entities own their own cleanup.** Each entity class filters its own dead children (`filterOldShots`, `filterOldTraces`, `filterOldShipDebris`, `cleanExplodedAsteroids`). New entity types must follow the same pattern; do not add cleanup logic to `Game.playGame()`.
- **Collision detection runs before rendering each frame.** `playGame()` order is: `checkIfCollisions → checkForHits → checkIfExplodedAsteroids → checkIfLevelCompleted → draw entities`. Do not reorder — collision flags drive what the entities render on the same frame.
- **Asset references must be ES imports.** Webpack's `type: "asset"` rule resolves them at build time. String URLs to `public/` or `dist/` will not work, and adding `require()` calls will conflict with the `.babelrc` `modules: false` setting.
- **Document-level keydown guard must remain.** The handler at the bottom of `index.js` prevents the browser from scrolling when arrows/space are pressed. Removing it breaks gameplay.

## Cross-Cutting Concerns

| Concern | Implementation | Location |
|---|---|---|
| Rendering | p5.js Canvas 2D, instance mode, 60fps `draw()` | `index.js` (instance creation), every entity's `draw()` |
| Audio | `p5.sound`-wrapped soundfiles with a shared reverb on explosions | `src/game/soundManager.js` |
| Input | Polled per-frame via `p5.keyIsDown(<keyCode>)` for movement; transient via reassigning `p5.keyPressed` for shooting/restart | `src/game/elements/ship.js` (`shoot()`), `src/index.js` (game-over restart) |
| Geometry/viewport | Vector helpers and responsive canvas sizing | `src/game/helpers.js` (`findOutWidth`, `findOutHeight`, `calcVectorValue`, `randomInteger`, `drawPolygon`) |
| Screen wrap | Each moving entity implements its own `ifOverflowed()` toroidal wrap | `ship.js`, `asteroids.js`, `shot.js` |

## External Integrations

None. ASTEROiDES is fully client-side and offline-capable once bundled. The only "external" target is **GitHub Pages**, used as a static-hosting deploy target via `gh-pages -d dist`.

## Data Flow (per frame)

1. Browser fires p5's `draw` tick (60fps target).
2. `index.js` draws `Background` (parallax stars), then delegates to `game.draw()`.
3. `Game.draw()` selects one of: `startMenuScreen` / `gameOverScreen` / `levelUpScreen` / `playGame()` based on its flags.
4. In `playGame()`:
   a. `checkIfCollisions()` — ship-vs-asteroid distance test; on hit, decrements lives or sets `gameOver`. Death triggers a 3-second `setTimeout` that sets `restartLevel = true`.
   b. `checkForHits()` — shot-vs-asteroid distance test; marks asteroids/shots as exploded/hit, awards score, plays break sound.
   c. `checkIfExplodedAsteroids()` — asks `Asteroids` to split large/medium asteroids into smaller children and remove the exploded ones.
   d. `checkIfLevelCompleted()` — if no asteroids remain, increments `level` and sets `levelCompleted` flag.
   e. Each entity's `draw()` runs: physics → cleanup → render.
5. After `Game.draw()` returns, `index.js` checks the `restartLevel` flag and calls `resetSketch(true, level, score, lifes)` to construct a fresh `Game`.
6. FPS counter is overlaid in the bottom-left for diagnostic visibility.

## Key Decisions

### Why p5 instance mode (not global mode)
Instance mode keeps p5's ~200 globals out of the module scope, makes the code Webpack-tree-shakable, and avoids name collisions with browser globals (`background`, `text`, `line`). The trade-off is verbosity — every class receives and stores a p5 reference — but it pays off for bundling and for keeping the code analyzable.

### Why reconstruct `Game` on state transitions
Entities cache references to one another (ship → shots → debris) and to the p5 instance. Resetting in-place would require coordinated nulling of cross-references across ~12 entity classes. Reconstructing one `Game` instance and letting the GC reclaim the old one is simpler, faster to reason about, and avoids subtle stale-reference bugs across levels.
