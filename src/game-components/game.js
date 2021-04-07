import { Ship } from './ship';
import { Menu } from './menu';
import { Asteroid } from './asteroid';

export class Game {
    constructor() {
        this.started = true;
        this.ship = new Ship();
        this.asteroids = [];
        this.menu = new Menu();
    }

    setup(p5, shipImage, asteroidImage) {
        this.ship.image = shipImage;
        // const asteroidImage = this.randomAsteroidImage(asteroidImagesArray)
        this.createAsteroids(p5, asteroidImage);
    }

    createAsteroids(p5, asteroidImage) {
        for (let i = 0; i < 10; i++) {
            this.asteroids.push(new Asteroid(p5, asteroidImage));
        }
    }

    randomAsteroidImage(asteroidImagesArray) {
        return asteroidImagesArray[Math.floor(asteroidImagesArray.length * (Math.random()))];
    }

    draw(p5) {
        if (this.started) {
            this.ship.draw(p5);
            this.asteroids.forEach(asteroid => asteroid.draw(p5));
        } else {
            this.menu.draw(p5)
        }
    }
}