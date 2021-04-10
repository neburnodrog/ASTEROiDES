import { drawPolygon, randomInteger } from '../helpers/helpers';

export default class Asteroid {
    constructor(size, position, velocity) {
        this.size = size;
        this.position = position;
        this.radius = this.initialRadius(size);
        this.sides = randomInteger(7, 12);
        this.rotation = { angle: 0, velocity: Math.random() / 50 }
        this.velocity = velocity;
        this.exploded = false;
        this.strokes = { X: 8, M: 6, S: 4 }
    }

    initialRadius(size) {
        if (size === 'X') return Math.random() * 25 + 70;
        if (size === 'M') return Math.random() * 15 + 40;
        if (size === 'S') return Math.random() * 10 + 20;
    }

    calcRotation() {
        this.rotation.angle += this.rotation.velocity;
    }

    calcPosition(p5) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x > p5.width + this.radius) {
            this.position.x = 0 - this.radius;
        }

        if (this.position.x < 0 - this.radius) {
            this.position.x = p5.width + this.radius;
        }

        if (this.position.y > p5.height + this.radius) {
            this.position.y = 0 - this.radius;
        }

        if (this.position.y < 0 - this.radius) {
            this.position.y = p5.height + this.radius;
        }
    }

    draw(p5) {
        this.calcRotation();
        this.calcPosition(p5);

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