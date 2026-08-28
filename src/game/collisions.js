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
