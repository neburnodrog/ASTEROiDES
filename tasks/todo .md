# Plan: Extract collision detection into a Collisions module

## Goal

Move the two distance tests out of `Game` into a pure `collisions` module with no dependencies. `Game` keeps every consequence (explode, score, sound, lives, state transition) but stops owning geometry. Fix the double-life bug that the current `forEach` shape allows.

This is the third extraction in the arc after `GameState` (`00fd2d8`) and `Input` (`8fa551d`).

## Decisions locked

- **Boundary: detect only.** The module owns geometry and nothing else. It imports nothing, holds no state, and never sees `p5`, `game`, `score`, `soundManager`, or `GameState`.
- **Shape: two exported functions**, not a class. There is no state to hold.
  - `shipVsAsteroids(ship, asteroids)` returns the first overlapping asteroid, or `null`.
  - `shotsVsAsteroids(shots, asteroids)` returns an array of `{ shot, asteroid }` pairs.
- **`p5.dist` becomes `Math.hypot`.** Both compute Euclidean distance, so results are identical. This is what keeps the module free of p5 and unit-testable without a canvas.
- **Hitbox constants keep their exact values.** The `- 5` at `game.js:106` and the `+ 20` at `game.js:110` become `SHIP_HITBOX_OFFSET_X` and `SHIP_HITBOX_PADDING`. The hitbox does not change size or position.
- **The size lookup folds in.** The three-branch if-chain in `checkForHits` becomes an `ASTEROID_HITS` table at the top of `game.js`. It sits inside a method this refactor already rewrites.
- **Consequences stay in `Game`.** Rejected the "detect and resolve" boundary: a `Collisions` class would need `game`, `score`, `soundManager`, and `state`, which moves the coupling rather than removing it.
- **No event bus.** Rejected "detect plus emit events": indirection with exactly one subscriber in a 1200-line codebase.

## Vocabulary

- **Hit pair**: a `{ shot, asteroid }` object. `shotsVsAsteroids` returns zero or more per frame.
- **Hitbox padding**: the 20px added to an asteroid's radius when testing against the ship, making the ship collide slightly before its sprite visually touches. Hand-tuned; preserved verbatim.

## The bug this fixes

`checkIfCollisions` iterates every asteroid with `forEach` and never stops after a hit. The `isPlaying()` guard sits at the top of the method, not inside the loop. When two asteroids overlap the ship on the same frame:

```
asteroid 1 -> handleExplosion, play shipExplosion, lifes.pop() 3->2, state.shipDied() -> "dying"
asteroid 2 -> handleExplosion, play shipExplosion, lifes.pop() 2->1, state.shipDied() -> early return
```

`GameState.shipDied` guards the state transition, but `lifes.pop()` and the sound live in `Game`, outside that guard. The player silently loses two lives and hears a doubled explosion.

`shipVsAsteroids` uses `find`, so it returns at most one asteroid and the consequence block runs at most once per frame. The fix is structural, not another guard.

## Behavior preserved deliberately

`checkForHits` currently loops asteroids-outer and shots-inner, and never filters out an already-hit shot. One shot sitting inside two overlapping asteroids therefore destroys and scores both. `shotsVsAsteroids` returns every matching pair in that same iteration order, so this is unchanged.

Detection now runs fully before any mutation, where the old code interleaved them. This is equivalent because the old loop never read `asteroid.exploded` or `shot.hit` as a filter condition.

## Files touched

| File | Change |
|---|---|
| `src/game/collisions.js` | NEW. Two exported functions plus two constants and one private helper. About 30 LOC. |
| `src/game/game.js` | Import the two functions. Add `ASTEROID_HITS`. Rewrite `checkForHits` and `checkIfCollisions`. Roughly 70 lines become 25. |
| `ARCHITECTURE.md` | Module Map, one new invariant, Data Flow 4a and 4b, a "Why a Collisions module" decision. |

Nothing else changes. No entity class, no screen, no build config. `index.js` gets a temporary `window.__VERIFY` hook during step 3 that is removed before step 5, so it ends the refactor byte-identical to `main`.

## Implementation steps

### 1. Create `src/game/collisions.js`

```js
// Hand-tuned so the ship collides just before its sprite visually touches.
// Values carried over verbatim from the original test in Game.checkIfCollisions.
const SHIP_HITBOX_OFFSET_X = -5;
const SHIP_HITBOX_PADDING = 20;

const overlaps = (ax, ay, bx, by, radius) =>
  Math.hypot(ax - bx, ay - by) < radius;

export function shipVsAsteroids(ship, asteroids) {
  const x = ship.position.x + SHIP_HITBOX_OFFSET_X;
  const y = ship.position.y;

  return (
    asteroids.find((asteroid) =>
      overlaps(
        x,
        y,
        asteroid.position.x,
        asteroid.position.y,
        asteroid.radius + SHIP_HITBOX_PADDING
      )
    ) ?? null
  );
}

export function shotsVsAsteroids(shots, asteroids) {
  const hits = [];

  for (const asteroid of asteroids) {
    for (const shot of shots) {
      if (
        overlaps(
          shot.position.x,
          shot.position.y,
          asteroid.position.x,
          asteroid.position.y,
          asteroid.radius
        )
      ) {
        hits.push({ shot, asteroid });
      }
    }
  }

  return hits;
}
```

### 2. Rewrite the two methods in `src/game/game.js`

Add the import and the lookup table:

```js
import { shipVsAsteroids, shotsVsAsteroids } from "./collisions";

const ASTEROID_HITS = {
  X: { points: 20, sound: "asteroidBreakL" },
  M: { points: 50, sound: "asteroidBreakM" },
  S: { points: 75, sound: "asteroidBreakS" },
};
```

Then:

```js
checkForHits() {
  const hits = shotsVsAsteroids(this.ship.shots, this.asteroids.array);

  for (const { shot, asteroid } of hits) {
    asteroid.exploded = true;
    shot.hit = true;

    const rule = ASTEROID_HITS[asteroid.size];
    if (rule) {
      this.soundManager.play(rule.sound);
      this.score.value += rule.points;
    }
  }
}

checkIfCollisions() {
  if (!this.state.isPlaying()) return;

  const hit = shipVsAsteroids(this.ship, this.asteroids.array);
  if (!hit) return;

  this.ship.handleExplosion();
  if (this.soundManager) this.soundManager.play("shipExplosion");

  const wasFinalDeath = this.lifes.length === 0;
  if (!wasFinalDeath) this.lifes.pop();

  this.state.shipDied({
    wasFinalDeath,
    level: this.level,
    score: this.score,
    lifes: this.lifes,
  });

  if (wasFinalDeath && this.soundManager) this.soundManager.play("gameOver");
}
```

The original guarded `soundManager` with `if (this.soundManager)` in `checkIfCollisions` but not in `checkForHits`. Keep both as they are; do not add or remove a guard in this refactor.

### 3. Verify

No test runner exists and this plan does not add one. Verification runs headless playwright against `npm start`, using a temporary `window.__VERIFY` hook in `index.js` that is removed before committing. This matches the Input refactor.

### 4. Update `ARCHITECTURE.md`

- Module Map: add `collisions.js` to the Game Controller row.
- New invariant: collision geometry lives only in `src/game/collisions.js`; no other module measures distance between entities.
- Data Flow 4a and 4b: describe the detect-then-apply split.
- Key Decisions: add "Why a Collisions module", covering the detect-only boundary, the rejected alternatives, and the double-life bug.

### 5. Commit

Two commits, matching the arc:

1. `extract collision detection into Collisions module`
2. `update ARCHITECTURE.md for Collisions refactor`

## Verification checklist

| Check | How |
|---|---|
| Build clean | `npm start`, 0 errors, no new warnings |
| Page loads | 0 console errors |
| No stray geometry | `grep -rn "Math.hypot" src/` returns only `collisions.js`; the one surviving `p5.dist` in `asteroids.js` is spawn placement, not collision |
| Shot destroys asteroid | shoot an X, asteroid splits into 2 M |
| Score per size | X awards 20, M awards 50, S awards 75 |
| Ship collision costs one life | force one asteroid onto the ship, `lifes.length` drops by exactly 1 |
| **Double overlap costs one life** | force two asteroids onto the ship in the same frame, `lifes.length` drops by exactly 1 (this fails on `main`, dropping 2) |
| Collisions suppressed while dying | asteroid parked on ship during the 3s window does not decrement again |
| Level clear | empty the asteroid array, state goes to `levelComplete`, level increments |
| Respawn rebuild | confirm from `levelComplete`, new Game at next level, same `Input` instance |
| Game over | exhaust lives, state goes to `gameOver`, restart returns to `menu` |

## Out of scope

- Spatial partitioning or any broad-phase optimization. Asteroid counts stay under ~20, so the O(n*m) loop is fine.
- Per-polygon collision. The circle test is what the game has always used.
- Extracting lives, level progression, or entity construction from `Game`. Those are the next candidates, not this one.
- The starting-lives question below.

## Followups noted, not addressed

- `wasFinalDeath` is computed as `this.lifes.length === 0`, and `lifes` starts at 3. The player therefore gets 4 deaths while 3 hearts render. This may be intended (3 spares plus the ship in play) or off by one. It is a gameplay decision, not a refactor, so this plan leaves it exactly as is.
- After this lands, `Game` still owns entity construction, lives, level progression, and frame orchestration. Lives and level are the obvious next extractions.

## Review

### Status: implemented and verified, committed

### What landed

- **`src/game/collisions.js` (new, 46 LOC)**: `shipVsAsteroids` and `shotsVsAsteroids`, plus the private `overlaps` helper and the two hitbox constants. Zero imports. Built exactly as planned, no deviations.
- **`src/game/game.js`**: 40 insertions, 58 deletions. `checkForHits` went from 30 lines to 14, `checkIfCollisions` from 35 to 26. Added the `ASTEROID_HITS` table and the one import.
- **`ARCHITECTURE.md`**: Module Map, a new Entry Point, two new invariants, the Data Flow 4a/4b rewrite, a new Cross-Cutting row, and the "Why a Collisions module" decision.
- **`src/index.js`**: ends byte-identical to `main`. The temporary `window.__VERIFY` hook was added for verification and removed before committing.

### Correction to this plan

The checklist originally asserted `grep -rn "\.dist("` would return zero hits. That was wrong. `asteroids.js:24` uses `p5.dist` to reject spawn points within 300px of the canvas center so asteroids do not appear on top of the ship. That is placement, not an entity-vs-entity overlap test, so it correctly stays put. The invariant written into `ARCHITECTURE.md` says "entity-vs-entity geometry" and calls out this exception explicitly.

### Verification (headless playwright, no test runner exists)

| Check | Result |
|---|---|
| `npm start` build | clean, 0 errors |
| Console across the whole session | 0 errors; 1 warning, the pre-existing p5.sound AudioContext autoplay notice |
| Score for X | +20 exactly, asteroid flagged exploded, shot flagged hit |
| Score for M | +50 exactly |
| Score for S | +75 exactly |
| Shot just outside the radius | no score, no explosion (boundary holds) |
| **Two asteroids overlapping the ship in one frame** | **lost exactly 1 life; a replica of main's loop over the same setup ran the consequence block 2 times** |
| Collisions suppressed while `dying` | second `checkIfCollisions` in the same synchronous block lost 0 lives, state stayed `dying` |
| Space on menu | state to `playing` with `shots: 0`, so the Input consume-on-read fix still holds |
| Real keypress shot through the frame loop | X destroyed, split into 2 M, score +20 |
| Level clear | asteroids emptied, state to `levelComplete`, level 1 to 2, score preserved |
| Level-up rebuild | new Game at level 2 with 4 asteroids, score preserved, same `Input` instance |
| Final death | lives at 0 plus a collision moves state to `gameOver` |
| Game-over restart | back to `menu`, level 1, 3 lives, score 0 |

One earlier run of the dying-suppression check reported a false failure. The test read `state.current` after calling the method, and the 3-second respawn timer had rebuilt `Game` between the two evaluates, so it was reading a fresh `playing` game. Rerunning it as a single synchronous block gave the correct result above. The bug was in the test, not the code.

### Followups

- `wasFinalDeath` is still `lifes.length === 0` with `lifes` starting at 3, so the player gets 4 deaths while 3 hearts render. Untouched on purpose, as noted above.
- `Game` is now 152 lines and still owns entity construction, lives, level progression, and frame orchestration. Lives and level are the next candidates.
- `collisions.js` is pure and has no p5 dependency, so it is the first module in this repo that could be unit-tested without a canvas if a test runner is ever added.
