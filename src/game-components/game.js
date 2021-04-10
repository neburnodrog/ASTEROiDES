import Ship from './ship';
import Asteroid from './asteroid';
import { Stars } from './stars';
import Life from './life';
import Score from './score';
import AsteroidDebris from './asteroidDebris';
import { randomInteger } from "../helpers/helpers";

export class Game {
    constructor(p5, level = 1, score = 0) {
        this.gameover = false;
        this.gameoverScreen;
        this.lifes = [];
        this.score = new Score(score);
        this.level = level;
        this.lvlCompleted = false;

        this.stars = new Stars(p5);
        this.ship = new Ship(p5);
        this.asteroids = [];
        this.asteroidDebris = [];
    }

    stop() {
        // stop everything from moving
    }

    setup(p5, shipImage, heartImage) {
        this.ship.image = shipImage;
        for (let i = 0; i < 3; i++) this.lifes.push(new Life(heartImage))
        this.createInitialAsteroids(p5, this.level ** 2 + 5, 'X');
    }

    // ASTEROIDS
    createInitialAsteroids(p5, howMany, size) {
        for (let i = 0; i < howMany; i++) {
            let initialPosition = this.initialAsteroidPosition(p5);
            let initialVelocity = this.initialAsteroidVelocity(4);
            this.asteroids.push(new Asteroid(size, initialPosition, initialVelocity));
        }
    }

    initialAsteroidVelocity(num) {
        return {
            x: num * (Math.random() - Math.random()),
            y: num * (Math.random() - Math.random()),
        }
    }

    initialAsteroidPosition(p5) {
        let x = p5.width * Math.random();
        let y = p5.height * Math.random();
        // while asteroid is overlapping with the ship's initial position:
        while (p5.dist(x, y, p5.width / 2, p5.height / 2) < 200) {
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
                    shot.hit = true;
                    if (asteroid.size === 'X') this.score.value += 50;
                    if (asteroid.size === 'M') this.score.value += 100;
                    if (asteroid.size === 'S') this.score.value += 200;
                }
            })
        });
    }

    ifExplotionsCreateNewAsteroids() {
        let explodedAsteroids = this.asteroids.filter(asteroid => asteroid.exploded);

        explodedAsteroids.map(explodedAsteroid => {
            this.createDebris(explodedAsteroid);

            let { size, position } = { ...explodedAsteroid };

            if (size === 'X') {
                this.asteroids = this.asteroids.concat([
                    new Asteroid('M', { x: position.x, y: position.y }, this.initialAsteroidVelocity(6)),
                    new Asteroid('M', { x: position.x, y: position.y }, this.initialAsteroidVelocity(6)),
                ]);
            } else if (size === 'M') {
                this.asteroids = this.asteroids.concat([
                    new Asteroid('S', { x: position.x, y: position.y }, this.initialAsteroidVelocity(8)),
                    new Asteroid('S', { x: position.x, y: position.y }, this.initialAsteroidVelocity(8)),
                ]);
            }
        });
    }

    randomNumOfDebris(radius) {
        return Math.floor(randomInteger(1, 3) * Math.sqrt(radius));
    };

    createDebris(explodedAsteroid) {
        const totalAmountOfDebris = this.randomNumOfDebris(explodedAsteroid.radius);
        for (let i = 0; i < totalAmountOfDebris; i++) {
            this.asteroidDebris.push(new AsteroidDebris(totalAmountOfDebris, explodedAsteroid));
        }
    }

    cleanExplodedAsteroids() {
        this.asteroids = this.asteroids.filter(asteroid => !asteroid.exploded)
        if (this.asteroids.length === 0) {
            this.lvlCompleted = true;
        }
    }

    checkIfCollisions(p5) {
        this.asteroids.forEach(asteroid => {
            const { x, y } = { ...asteroid.position }
            const distance = p5.dist(x, y, this.ship.position.x, this.ship.position.y);

            if (distance < asteroid.radius + 20) {
                if (this.lifes.length === 0) {
                    this.gameover = true;
                } else {
                    this.lifes.pop();
                }
                this.ship.explosion();
            }
        });
    }

    // DRAW
    draw(p5) {
        this.stars.draw(p5);
        this.asteroidDebris = this.asteroidDebris.filter(debris => debris.faded === false);
        this.asteroidDebris.forEach(debris => debris.draw(p5));
        this.ship.shots.forEach(shot => shot.draw(p5));
        this.ship.draw(p5);
        this.asteroids.forEach(asteroid => asteroid.draw(p5));


        // collisions (asteroids & ship)
        this.checkIfCollisions(p5);

        // collisions (asteroids & shots)
        this.checkForHits(p5);
        this.ifExplotionsCreateNewAsteroids();
        this.cleanExplodedAsteroids();
        this.ship.filterOldShots(p5);

        // draw lifes && score
        this.lifes.forEach((life, index) => life.draw(p5, index + 1));
        this.score.draw(p5);
    }
}