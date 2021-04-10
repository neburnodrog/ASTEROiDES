import { drawPolygon, randomInteger } from '../helpers';


export class AsteroidArray {
    constructor(p5, game, size = 'X') {
        this.p5 = p5;
        this.game = game;
        this.asteroids = this.createInitialAsteroids(size);
    }

    createInitialAsteroids(size = 'X') {
        function initialPosition() {
            const { width, height, dist } = { ...this.p5 }

            let x = width * Math.random();
            let y = height * Math.random();

            while (dist(x, y, width / 2, height / 2) < 200) {
                x = width * Math.random();
                y = height * Math.random();
            }

            return { x: x, y: y, }
        }

        function initialVelocity() {
            return {
                x: Math.random() * (this.game.level + 1),
                y: Math.random() * (this.game.level + 1),
            }
        }

        const howMany = 3 + 2 * this.level;
        this.asteroids = new Array(howMany)
            .fill()
            .map(() => new Asteroid(this.p5, size, initialPosition(), initialVelocity()));
    }

    draw() {
        this.asteroids.forEach(asteroid => asteroid.draw());
    }
}


class Asteroid {
    constructor(p5, size, position, velocity) {
        this.p5 = p5;

        this.size = size;
        this.position = position;
        this.velocity = velocity;

        this.sides = randomInteger(7, 12);
        this.radius = this.initialRadius(size);
        this.rotation = this.initialRotation();

        this.strokes = { X: 8, M: 6, S: 4 }
        // this.color = {R: 255, G: 255, B: 255} BUT RANDOM
        this.exploded = false;
    }

    initialRadius(size) {
        if (size === 'X') return Math.random() * 25 + 70;
        if (size === 'M') return Math.random() * 15 + 40;
        if (size === 'S') return Math.random() * 10 + 20;
    }

    initialRotation() {
        return { angle: 0, velocity: Math.random() / 50 }
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
        p5.stroke("#F29F38");
        p5.fill("#A65E05")
        drawPolygon(p5, 0, 0, this.radius, this.sides);

        p5.pop();
    }
}