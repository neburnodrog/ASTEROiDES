# ASTEROiDES

Browser-based Asteroids arcade game clone built with p5.js and bundled with Webpack.

## Build & Development

- Dev server: `npm start` (webpack-dev-server, opens http://localhost:8080 with HMR)
- Build (dev): `npm run build:dev`
- Build (prod): `npm run build:prod`
- Watch: `npm run watch`
- Deploy: `npm run deploy` (pushes `dist/` to gh-pages branch)
- Node version: see `.nvmrc` (v24)
- **No test runner, linter, or formatter is configured.** Do not invent commands — if I ask you to "run tests", clarify with me first.

## Code Style

- Plain ES6+ JavaScript, no TypeScript. Do not add `.ts`/`.tsx` files.
- 2-space indentation, double-quoted strings (match existing files — no Prettier config exists).
- Class-based OOP for game entities. PascalCase classes, camelCase methods/variables.
- ES module imports (`import`/`export`). `.babelrc` has `"modules": false` so Webpack can tree-shake — **do not** add `require()` syntax.

## p5.js Usage (CRITICAL)

- This project uses **p5 instance mode**, not global mode. The p5 instance is created in `src/index.js` and passed into every class constructor as `p5`. Inside classes, always call `this.p5.line(...)`, never the bare `line(...)`.
- `p5.sound` is loaded via `import "p5/lib/addons/p5.sound"` in `src/index.js`. Sound effects go through `SoundManager`, not raw `p5.SoundFile`.
- The Webpack `ProvidePlugin` only injects `p5` into the constructor at module init; it does NOT make p5 functions globally callable inside classes.

## Asset Loading

- Import images, fonts, and sounds through ES imports (`import font from "./font/x.ttf"`). Webpack's `type: "asset"` rule handles them.
- **Never** reference assets via string URLs, `public/`, or `require()` — they will not be bundled.
- Assets live in `src/images/`, `src/font/`, `src/sounds/`.

## Project Structure

- `src/index.js` — p5 instance bootstrap, asset preloading, global game state holder
- `src/game/game.js` — central Game controller (per-level/per-life instance)
- `src/game/elements/` — game entities (Ship, Asteroids, Shot, Debris) and visual elements (Background, Stars, Score, Life)
- `src/game/state/` — screen state classes (StartMenuScreen, GameOverScreen, LevelUpScreen)
- `src/game/soundManager.js` — wraps p5.sound with reverb effects
- `src/game/helpers.js` — viewport sizing, polygon drawing, vector utilities
- `src/css/`, `src/font/`, `src/images/`, `src/sounds/` — assets

See **ARCHITECTURE.md** for the module map and game-loop invariants.

## Gotchas

- **State resets reconstruct the Game**. `resetSketch()` in `index.js` creates a new `Game` instance and passes `oldScore`/`oldLifes` as constructor args. Do not try to "soft reset" via mutation — follow the reconstruction pattern.
- **Arrow keys and space are blocked at the document level** (`window.top.document.onkeydown` in `index.js`) to prevent page scroll. If you change input handling, preserve this guard or shooting/movement will scroll the page.
- **`p5.windowResized` rebuilds the Background**. Any class that caches canvas dimensions must also rebuild on resize, or it will desync after a window resize.
- **Class-based state is mutated in `draw()` each frame** (60fps). Allocating new objects inside `draw()` (especially Vector instances) creates GC pressure — reuse instances when possible.

## Workflow

- Single branch (`main`). The repo has a `gh-pages` remote branch for the deployed build — never commit source there manually; only `npm run deploy` should touch it.
- Commit style observed: short, lowercase imperative ("add explosion", "fix levels", "bump dependencies"). No conventional-commit prefix is required.
- No PR template, no CI. Solo project — keep it simple.

## Controls (for testing)

- Movement: arrow keys OR `AWDS`
- Shoot: `.` OR `G`
- Game-over restart: space or enter
