import { drawPolygon, randomInteger } from '../helpers'

export default class AsteroidDebris {
    constructor(amountOfDebris, explodedAsteroid) {
        this.radius = explodedAsteroid.radius / (Math.random() * amountOfDebris);
        // this.radius = randomInteger(3, 5) * explodedAsteroid.radius / (amountOfDebris);
        this.color = this.getInitialColor();
        this.sides = randomInteger(5, 14);
        this.position = { ...explodedAsteroid.position };
        this.direction = 2 * Math.random() * Math.PI;
        this.rotation = { angle: 0, velocity: Math.random() / 50 }
        this.velocity = this.calcInitialVelocityVectors();
        this.faded = false;
    }

    // DYNAMICALLY COMPUTED INITIAL PROPERTY VALUES
    getInitialColor() {
        let maxAlpha;

        if (this.radius < 10) maxAlpha = randomInteger(200, 250);
        else if (this.radius < 100) maxAlpha = randomInteger(150, 200);
        else if (this.radius < 200) maxAlpha = randomInteger(100, 150);
        else maxAlpha = randomInteger(50, 100);

        return {
            fill: {
                R: randomInteger(0, 250),
                G: randomInteger(0, 250),
                B: randomInteger(0, 250),
                A: maxAlpha,
            },
            stroke: {
                R: randomInteger(0, 250),
                B: randomInteger(0, 250),
                B: randomInteger(0, 250),
                A: maxAlpha,
            },
        }

    }

    calcInitialVelocityVectors() {
        const absoluteVelocity = 5;
        return {
            x: absoluteVelocity * Math.cos(this.direction),
            y: absoluteVelocity * Math.sin(this.direction),
        }
    }

    // CALCULATIONS
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
        if (this.color.fill.A > 0) {
            this.color.fill.A -= 2;
        }

        if (this.color.stroke.A > 0) {
            this.color.stroke.A -= 2;
        }
    }

    // STATE CHECK
    checkIfFaded() {
        if (this.color.stroke.A <= 0) this.faded = true;
    }

    draw() {
        const p5 = this.p5;

        // STATE
        this.checkIfFaded();

        // CALCULATIONS
        this.calcPosition();
        this.calcRotation();
        this.calcColor();
        this.calcVelocity();

        // RENDERING
        p5.push();

        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.rotation.angle);
        p5.strokeWeight(2);
        p5.stroke(...Object.values(this.color.stroke));
        p5.fill(...Object.values(this.color.fill));
        drawPolygon(p5, 0, 0, this.radius, this.sides);

        p5.pop();
    }
}