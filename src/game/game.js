/** STATES */
import { GameOverScreen } from './game-state/gameOverScreen';
import { StartMenuScreen } from './game-state/startMenuScreen';

/** GAME ELEMENTS */
import Ship from './game-elements/ship';
import { AsteroidArray } from './game-elements/asteroids';
import Life from './game-elements/life';
import Score from './game-elements/score';
import AsteroidDebris from './game-elements/debris';
import { randomInteger } from "./helpers";

export default class Game {
    constructor(p5, started = false, level = 1) {
        this.p5 = p5;

        // STATES
        this.started = started;
        this.paused = false;
        this.gameOver = false;
        this.levelCompleted = false;
        this.level = level;
        this.score;

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

    setup(shipImage, heartImage, score) {
        /** INITIALIZING STATE COMPONENTS */
        this.gameOverScreen = new GameOverScreen(this.p5, this);
        this.startMenuScreen = new StartMenuScreen(this.p5, this);
        this.levelUpScreen = new LevelUpScreen(this.p5, this);
        this.score = score

        /* INITIALIZING GAME ELEMENTS */
        this.ship = new Ship(this.p5, shipImage);
        this.lifes = new Array().fill(3).map(() => new Life(heartImage))
        this.asteroids = new AsteroidArray(this.p5, this);
    }

    checkForHits() {
        this.asteroids.array.forEach(asteroid => {
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

    createDebris(explodedAsteroid) {
        const totalAmountOfDebris = this.randomNumOfDebris(explodedAsteroid.radius);
        for (let i = 0; i < totalAmountOfDebris; i++) {
            this.asteroidDebris.push(new AsteroidDebris(totalAmountOfDebris, explodedAsteroid));
        }
    }

    randomNumOfDebris(radius) {
        return Math.floor(randomInteger(1, 3) * Math.sqrt(radius));
    };

    cleanExplodedAsteroids() {
        this.asteroids = this.asteroids.filter(asteroid => !asteroid.exploded)
        if (this.asteroids.length === 0) {
            this.lvlCompleted = true;
        }
    }

    checkIfCollisions() {
        this.asteroids.forEach(asteroid => {
            const { x, y } = { ...asteroid.position }
            const distance = this.p5.dist(x, y, this.ship.position.x - 5, this.ship.position.y);

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
    playGame() {
        // CHECK STATES   
        this.checkIfCollisions();
        this.checkForHits();
        this.ifExplotionsCreateNewAsteroids();
        this.cleanExplodedAsteroids();

        // RENDER ELEMENTS
        this.asteroidDebris.forEach(debris => debris.draw());
        this.asteroids.forEach(asteroid => asteroid.draw());
        this.ship.shots.forEach(shot => shot.draw());
        this.ship.draw();
        this.lifes.forEach((life, index) => life.draw(index + 1));
        this.score.draw();

        // CLEAN-UP
        this.asteroidDebris = this.asteroidDebris.filter(debris => debris.faded === false);
    }

    draw() {
        // GENERAL GAME STATE CHECK
        if (this.started) this.startMenuScreen.draw();
        else if (this.gameOver) this.gameOverScreen.draw();
        else if (this.levelCompleted) {
            this.level++;
            this.levelUpScreen.draw()
        } 
                    : this.playGame();
    }
}