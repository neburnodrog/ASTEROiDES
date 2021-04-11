/** STATES */
import GameOverScreen from './game-state/gameOverScreen';
import { StartMenuScreen, LevelUpScreen } from './game-state/startMenuScreen';

/** GAME ELEMENTS */
import Ship from './game-elements/ship';
import Asteroids from './game-elements/asteroids';
import Life from './game-elements/life';

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
    }

    setup(shipImage, heartImage, score) {
        /** INITIALIZING STATE COMPONENTS */
        this.gameOverScreen = new GameOverScreen(this.p5, this);
        this.startMenuScreen = new StartMenuScreen(this.p5, this);
        this.levelUpScreen = new LevelUpScreen(this.p5, this);
        this.score = score

        /* INITIALIZING GAME ELEMENTS */
        this.ship = new Ship(this.p5, shipImage);
        this.lifes = new Array(3).fill().map(() => new Life(this.p5, heartImage))
        console.log(this);
        this.asteroids = new Asteroids(this.p5, this.level);
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

    checkIfExplodedAsteroids() {
        let explodedAsteroids = this.asteroids.array.filter(asteroid => asteroid.exploded);
        this.asteroids.handleExplodedAsteroids(explodedAsteroids);
        this.asteroids.cleanExplodedAsteroids();
    }

    checkIfLevelCompleted() {
        if (this.asteroids.array.length === 0) {
            this.levelCompleted = true;
        }
        return false;
    }

    checkIfCollisions() {
        this.asteroids.array.forEach(asteroid => {
            const { x, y } = { ...asteroid.position }
            const distance = this.p5.dist(x, y, this.ship.position.x - 5, this.ship.position.y);

            if (distance < asteroid.radius + 20) {
                if (this.lifes.length === 0) {
                    this.gameOver = true;
                } else {
                    this.lifes.pop();
                }
                this.ship.handleExplosion();
            }
        });
    }

    // DRAW
    playGame() {
        // CHECK STATES   
        this.checkIfCollisions();
        this.checkForHits();
        this.checkIfExplodedAsteroids();
        this.levelCompleted = this.checkIfLevelCompleted();

        // RENDER ELEMENTS
        this.asteroids.draw();
        this.ship.draw();
        this.lifes.forEach((life, i) => life.draw(i + 1));
        this.score.draw();
    }

    draw() {
        // GENERAL GAME STATE CHECK
        if (this.started) this.startMenuScreen.draw();
        else if (this.gameOver) this.gameOverScreen.draw();
        else if (this.levelCompleted) {
            this.level++;
            this.levelUpScreen.draw()
        } else this.playGame();
    }
}