import { drawPolygon, randomInteger } from '../helpers';
import AsteroidDebris from './asteroidDebris';

export default class Asteroids {
    constructor(p5, level, size = 'X') {
        this.p5 = p5;
        this.level = level;
        this.array = this.createInitialAsteroids(size);
        this.asteroidDebris = [];
    }

    createInitialAsteroids() {
        return new Array(this.level * 2)
            .fill()
            .map(() => new Asteroid(this.p5, 'X', this.initialPosition()));
    }

    initialPosition() {
        const { width, height } = this.p5

        let x = width * Math.random();
        let y = height * Math.random();

        while (this.p5.dist(x, y, width / 2, height / 2) < 300) {
            x = width * Math.random();
            y = height * Math.random();
        }

        return { x: x, y: y, }
    }

    handleExplodedAsteroids(explodedAsteroids) {
        explodedAsteroids.forEach(asteroid => {
            this.createDebris(asteroid);

            let { size, position } = { ...asteroid };
            if (size === 'X') this.addAsteroids(2, 'M', { ...position })
            else if (size === 'M') this.addAsteroids(2, 'S', { ...position });
        });
    }

    addAsteroids(howMany, size, position) {
        this.array = this.array
            .concat(new Array(howMany).fill()
                .map(() => new Asteroid(this.p5, size, { ...position })))
    }

    cleanExplodedAsteroids() {
        this.array = this.array.filter(asteroid => !asteroid.exploded)
    }

    createDebris(asteroid) {
        const totalDebris = this.randomNumOfDebris(asteroid.radius);
        for (let i = 0; i < totalDebris; i++) {
            this.asteroidDebris.push(new AsteroidDebris(this.p5, totalDebris, asteroid));
        }
    }

    randomNumOfDebris(radius) {
        return Math.floor(randomInteger(1, 3) * Math.sqrt(radius));
    };

    draw() {
        this.array.forEach(asteroid => asteroid.draw());
        this.asteroidDebris.forEach(debris => debris.draw());
        // this.asteroidDebris = this.asteroidDebris.filter(debris => debris.faded === false);
    }
}


class Asteroid {
    constructor(p5, size, position) {
        this.p5 = p5;

        this.size = size;
        this.position = position;

        this.asteroidVelocityMap = { X: 4, M: 7, S: 10 }
        this.velocity = this.initialVelocity();
        this.sides = randomInteger(7, 13);
        this.radius = this.initialRadius(size);
        this.rotation = this.initialRotation();

        this.strokes = { X: 8, M: 6, S: 4 }
        // this.color = {
        //     fill: { R: randomInteger(119, 166), G: randomInteger(67, 94), B: 5 },
        //     stroke: { R: randomInteger(174, 200), G: randomInteger(110, 160), B: randomInteger(40, 80) },
        // }
        this.exploded = false;
    }

    initialVelocity() {
        return {
            x: (Math.random() - 0.5) * this.asteroidVelocityMap[this.size],
            y: (Math.random() - 0.5) * this.asteroidVelocityMap[this.size],
        }
    }

    initialRadius(size) {
        if (size === 'X') return Math.random() * 25 + 70;
        if (size === 'M') return Math.random() * 15 + 40;
        if (size === 'S') return Math.random() * 10 + 20;
    }

    initialRotation() {
        return { angle: 0, velocity: (Math.random() - 0.5) * this.asteroidVelocityMap[this.size] / 50 }
    }

    // CALCULATIONS
    calcRotation() {
        this.rotation.angle += this.rotation.velocity;
    }

    calcPosition() {
        const { width, height } = { ...this.p5 }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x > width + this.radius) this.position.x = 0 - this.radius;
        if (this.position.x < 0 - this.radius) this.position.x = width + this.radius;
        if (this.position.y > height + this.radius) this.position.y = 0 - this.radius;
        if (this.position.y < 0 - this.radius) this.position.y = height + this.radius;
    }

    draw() {
        const p5 = this.p5;

        // CALCULATIONS
        this.calcRotation();
        this.calcPosition(p5);

        // RENDERING
        p5.push();

        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.rotation.angle);
        p5.strokeWeight(this.strokes[this.size]);
        // p5.stroke(...Object.values(this.color.stroke));
        // p5.fill(...Object.values(this.color.fill))
        p5.stroke("#F29F38");
        p5.fill("#A65E05")
        drawPolygon(p5, 0, 0, this.radius, this.sides);

        p5.pop();
    }
}