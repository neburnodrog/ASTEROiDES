import Ship from './ship';
import Asteroid from './asteroid';
import { Stars } from './stars';
import Life from './life';
import Score from './score';
import AsteroidDebris from './asteroidDebris';
import { randomInteger } from "../helpers/helpers";

export class Game {
    constructor(p5) {
        this.p5 = p5;

        // STATES
        this.started = false;
        this.paused = false;
        this.gameOver = false;
        this.levelCompleted = false;
        this.level = 1;
        this.score = 0;

        // VIEWS
        this.gameOverScreen;
        this.startMenuScreen;
        this.levelUpScreen;

        /* GAME ELEMENTS */
        this.lifes;
        this.ship;
        this.asteroids = [];
        this.asteroidDebris = [];
    }

    setup(shipImage, heartImage) {
        /** INITIALIZING STATE COMPONENTS */
        this.gameOverScreen = new GameOverScreen(this.p5, this);
        this.startMenuScreen = new StartMenuScreen(this.p5, this);
        this.levelUpScreen = new LevelUpScreen(this.p5, this);

        /* INITIALIZING GAME ELEMENTS */
        this.ship = new Ship(this.p5, shipImage);
        this.lifes = new Array().fill(3).map(slot => new Life(heartImage))
        this.createInitialAsteroids(this.level ** 2 + 5, 'X');
    }

    // ASTEROIDS
    createInitialAsteroids(howMany, size) {
        for (let i = 0; i < howMany; i++) {
            let initialPosition = this.initialAsteroidPosition();
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

    initialAsteroidPosition() {
        const p5 = this.p5;

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

    checkForHits() {
        this.asteroids.forEach(asteroid => {
            this.ship.shots.forEach(shot => {
                let distance = this.p5.dist(
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

    checkIfCollisions() {
        this.asteroids.forEach(asteroid => {
            const { x, y } = { ...asteroid.position }
            const distance = this.p5.dist(x, y, this.ship.position.x, this.ship.position.y);

            if (distance < asteroid.radius + 20) {
                if (this.lifes.length === 0) {
                    this.gameOver = true;
                } else {
                    this.lifes.pop();
                }
                this.ship.explosion();
            }
        });
    }

    // DRAW
    draw() {
        const p5 = this.p5

        this.stars.draw();
        this.asteroidDebris = this.asteroidDebris.filter(debris => debris.faded === false);
        this.asteroidDebris.forEach(debris => debris.draw());
        this.ship.shots.forEach(shot => shot.draw());
        this.ship.draw();
        this.asteroids.forEach(asteroid => asteroid.draw());


        // collisions (asteroids & ship)
        this.checkIfCollisions();

        // collisions (asteroids & shots)
        this.checkForHits();
        this.ifExplotionsCreateNewAsteroids();
        this.cleanExplodedAsteroids();
        this.ship.filterOldShots();

        // draw lifes && score
        this.lifes.forEach((life, index) => life.draw(, index + 1));
        this.score.draw();
    }
}