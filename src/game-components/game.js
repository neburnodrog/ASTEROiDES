import { Ship } from './ship';
import { Menu } from './menu';
import { Asteroid } from './asteroid';
import { Star } from './star';

export class Game {
    constructor() {
        this.started = true;
        this.stars = [];
        this.ship = new Ship();
        this.asteroids = [];
        this.menu = new Menu();
    }

    setup(p5, shipImage) {
        this.ship.image = shipImage;
        this.createInitialAsteroids(p5, 10, 'X');
        this.createStars(p5);
    }

    // STARS
    createStars(p5) {
        for (let i = 0; i < 1000; i++) {
            this.stars.push(new Star(p5))
        }
    }

    // ASTEROIDS
    createInitialAsteroids(p5, howMany, size) {
        for (let i = 0; i < howMany; i++) {
            let initialPosition = this.initialAsteroidPosition(p5);
            let initialVelocity = this.initialAsteroidVelocity();
            this.asteroids.push(new Asteroid(size, initialPosition, initialVelocity));
        }
    }

    initialAsteroidVelocity() {
        return {
            x: Math.random() - Math.random(),
            y: Math.random() - Math.random()
        }
    }

    initialAsteroidPosition(p5) {
        let x = p5.width * Math.random();
        let y = p5.height * Math.random();
        // while asteroid is overlapping with the ship's initial position:
        while (p5.dist(x, y, p5.width / 2, p5.height / 2) < 2 * this.radius) {
            x = p5.width * Math.random();
            y = p5.height * Math.random();
        }
        return {
            x: x,
            y: y,
        }
    }

    checkForHits(p5) {
        this.asteroids.forEach(asteroid => {
            this.ship.shots.forEach(shot => {
                let distance = p5.dist(
                    asteroid.position.x,
                    asteroid.position.y,
                    shot.position.x,
                    shot.position.y,
                );

                if (distance < asteroid.radius) {
                    asteroid.exploded = true;
                    asteroid.explotionShotVel = shot.velocity
                    shot.hit = true;
                }
            })
        });
    }

    ifExplotionsCreateNewAsteroids() {
        let explodedAsteroids = this.asteroids.filter(asteroid => asteroid.exploded);

        explodedAsteroids.map(explodedAsteroid => {
            let { size, radius, position, explotionShotVel } = { ...explodedAsteroid };



            const newPositions = [
                { x: position.x + radius / 2, y: position.y - radius / 2 },
                { x: position.x - radius / 2, y: position.y + radius / 2 },
            ]

            const newDirections = [
                { x: (explotionShotVel.y / 20) * Math.random() * 2, y: -(explotionShotVel.x / 20) * Math.random() * 2 },
                { x: -(explotionShotVel.y / 20) * Math.random() * 2, y: (explotionShotVel.x / 20) * Math.random() * 2 },
            ]

            if (size === 'X') {
                this.asteroids = this.asteroids.concat([
                    new Asteroid('M', newPositions[0], newDirections[0]),
                    new Asteroid('M', newPositions[1], newDirections[1]),
                ]);
            } else if (size === 'M') {
                this.asteroids = this.asteroids.concat([
                    new Asteroid('S', newPositions[0], newDirections[0]),
                    new Asteroid('S', newPositions[1], newDirections[1]),
                ]);
            }
        });
    }

    cleanExplodedAsteroids() {
        this.asteroids = this.asteroids.filter(asteroid => !asteroid.exploded)
    }

    // DRAW
    draw(p5) {
        if (this.started) {
            this.stars.forEach(star => star.draw(p5));
            this.asteroids.forEach(asteroid => asteroid.draw(p5));
            this.ship.draw(p5);
            this.ship.shots.forEach(shot => shot.draw(p5));

            // collisions (asteroids & shots)
            this.checkForHits(p5);
            this.ifExplotionsCreateNewAsteroids();
            this.cleanExplodedAsteroids();
            this.ship.filterOldShots(p5);

            // collisions (asteroids & ship)

        } else {
            this.menu.draw(p5)
        }
    }
}