/** STATES */
import GameOverScreen from "./state/gameOverScreen";
import { StartMenuScreen, LevelUpScreen } from "./state/startMenuScreen";

/** GAME ELEMENTS */
import Ship from "./elements/ship";
import Score from "./elements/score";
import Asteroids from "./elements/asteroids";
import Life from "./elements/life";

export default class Game {
  constructor(p5, soundManager, started, level) {
    this.p5 = p5;
    this.soundManager = soundManager;

    // STATES
    this.started = started;
    this.paused = false;
    this.gameOver = false;
    this.levelCompleted = false;
    this.restartLevel = false;
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

  setup(shipImage, heartImage, score, lifes) {
    /** INITIALIZING STATE COMPONENTS */
    this.gameOverScreen = new GameOverScreen(this.p5, this);
    this.startMenuScreen = new StartMenuScreen(this.p5, this);
    this.levelUpScreen = new LevelUpScreen(this.p5, this);
    this.score = score || new Score(this.p5);

    /* INITIALIZING GAME ELEMENTS */
    this.ship = new Ship(this.p5, this, shipImage);
    this.lifes =
      lifes || new Array(3).fill().map(() => new Life(this.p5, heartImage));
    this.asteroids = new Asteroids(this.p5, this.level);
  }

  checkForHits() {
    this.asteroids.array.forEach((asteroid) => {
      this.ship.shots.forEach((shot) => {
        let distance = this.p5.dist(
          asteroid.position.x,
          asteroid.position.y,
          shot.position.x,
          shot.position.y
        );

        if (distance < asteroid.radius) {
          asteroid.exploded = true;
          shot.hit = true;

          if (asteroid.size === "X") {
            this.soundManager.play("asteroidBreakL");
            this.score.value += 20;
          }
          if (asteroid.size === "M") {
            this.soundManager.play("asteroidBreakM");
            this.score.value += 50;
          }
          if (asteroid.size === "S") {
            this.soundManager.play("asteroidBreakS");
            this.score.value += 75;
          }
        }
      });
    });
  }

  checkIfExplodedAsteroids() {
    let explodedAsteroids = this.asteroids.array.filter(
      (asteroid) => asteroid.exploded
    );
    this.asteroids.handleExplodedAsteroids(explodedAsteroids);
    this.asteroids.cleanExplodedAsteroids();
  }

  checkIfLevelCompleted() {
    if (this.asteroids.array.length === 0) {
      this.levelCompleted = true;
      this.level++;

      if (this.soundManager) {
        this.soundManager.play("levelUp");
      }
    }
  }

  checkIfCollisions() {
    this.asteroids.array.forEach((asteroid) => {
      const { x, y } = asteroid.position;
      const distance = this.p5.dist(
        x,
        y,
        this.ship.position.x - 5,
        this.ship.position.y
      );

      if (distance < asteroid.radius + 20) {
        this.ship.handleExplosion();

        if (this.soundManager) {
          this.soundManager.play("shipExplosion");
        }

        if (this.lifes.length === 0) {
          this.gameOver = true;

          if (this.soundManager) {
            this.soundManager.play("gameOver");
          }
        } else {
          this.lifes.pop();
          setTimeout(() => {
            this.restartLevel = true;
          }, 3000);
        }
      }
    });
  }

  // DRAW
  playGame() {
    this.p5.frameRate(60);
    // CHECK STATES
    this.checkIfCollisions();
    this.checkForHits();
    this.checkIfExplodedAsteroids();
    this.checkIfLevelCompleted();

    // RENDER ELEMENTS
    this.asteroids.draw();
    if (this.ship.exploded) {
    } else {
      this.ship.draw();
    }
    this.lifes.forEach((life, i) => life.draw(i + 1));
    this.score.draw();
  }

  draw() {
    // GENERAL GAME STATE CHECK
    if (this.started === false) this.startMenuScreen.draw();
    else if (this.gameOver) this.gameOverScreen.draw();
    else if (this.levelCompleted) this.levelUpScreen.draw();
    else this.playGame();
  }
}
