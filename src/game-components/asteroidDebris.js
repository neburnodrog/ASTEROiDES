import { drawPolygon, randomInteger } from '../helpers/helpers'

export default class AsteroidDebris {
    constructor(amountOfDebris, explodedAsteroid) {
        this.radius = explodedAsteroid.radius / (amountOfDebris / 2);
        this.color = [
            randomInteger(100, 250),
            randomInteger(0, 100),
            randomInteger(0, 100),
            randomInteger(150, 255),
        ]

        this.strokecolor = [
            randomInteger(0, 250),
            randomInteger(0, 250),
            randomInteger(0, 250),
            randomInteger(150, 255),
        ];

        this.sides = randomInteger(5, 9);
        this.position = { ...explodedAsteroid.position };
        this.direction = Math.random() * 2 * Math.PI;
        this.rotation = { angle: 0, velocity: Math.random() / 60 }
        this.velocity = this.calcInitialVelocityVectors();
        this.faded = false;
    }

    calcInitialVelocityVectors() {
        const absoluteVelocity = 1;
        return {
            x: absoluteVelocity * Math.cos(this.direction),
            y: absoluteVelocity * Math.sin(this.direction),
        }
    }

    calcPosition() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    calcRotation() {
        this.rotation.angle += this.rotation.velocity;
    }

    calcVelocity() {
        this.velocity.x -= this.velocity.x * .01;
        this.velocity.y -= this.velocity.y * .01;
    }

    calcColor() {
        if (this.color[3] > 0) {
            this.color[3] -= 10;
        } else if (this.strokecolor[3] > 0) {
            this.strokecolor[3] -= 2;
        } else {
            this.faded === true;
        }
    }

    draw(p5) {
        p5.push();
        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.rotation.angle);
        p5.strokeWeight(2);
        p5.stroke(...this.strokecolor);
        p5.fill(...this.color);
        drawPolygon(p5, 0, 0, this.radius, this.sides);
        p5.pop();

        this.calcPosition();
        this.calcRotation();
        this.calcColor();
        this.calcVelocity();
    }
}