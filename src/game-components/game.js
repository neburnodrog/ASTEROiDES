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
        this.createAsteroids(p5);
        this.createStars(p5);
    }

    createStars(p5) {
        for (let i = 0; i < 1000; i++) {
            this.stars.push(new Star(p5))
        }
    }

    createAsteroids(p5) {
        for (let i = 0; i < 10; i++) {
            this.asteroids.push(new Asteroid(p5, 'big'));
        }
    }

    draw(p5) {
        if (this.started) {
            this.asteroids.forEach(asteroid => asteroid.draw(p5));
            this.ship.draw(p5);
            this.ship.shots.forEach(shot => shot.draw(p5));

        } else {
            this.menu.draw(p5)
        }
    }
}