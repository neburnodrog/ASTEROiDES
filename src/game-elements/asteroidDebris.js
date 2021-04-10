import { drawPolygon, randomInteger } from '../game/helpers/helpers'

export default class AsteroidDebris {
    constructor(amountOfDebris, explodedAsteroid) {
        this.radius = explodedAsteroid.radius / (Math.random() * amountOfDebris);
        // this.radius = randomInteger(3, 5) * explodedAsteroid.radius / (amountOfDebris);
        this.color = this.getInitialColor();
        this.sides = randomInteger(5, 14);
        this.position = { ...explodedAsteroid.position };
        this.direction = Math.random() * 2 * Math.PI;
        this.rotation = { angle: 0, velocity: Math.random() / 50 }
        this.velocity = this.calcInitialVelocityVectors();
        this.time;
        this.faded = false;
        setInterval(() => this.time++, 1000);
    }

    getInitialColor() {
        const radius = this.radius;
        let maxAlpha;
        if (radius < 10) maxAlpha = randomInteger(200, 250);
        else if (radius < 100) maxAlpha = randomInteger(150, 200);
        else if (radius < 200) maxAlpha = randomInteger(100, 150);
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

    checkIfFaded() {
        if (this.time > 1) this.faded = true;
        if (this.faded === true) console.log(this.faded);

    }

    draw(p5) {
        p5.push();
        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.rotation.angle);
        p5.strokeWeight(2);
        p5.stroke(...Object.values(this.color.stroke));
        p5.fill(...Object.values(this.color.fill));
        drawPolygon(p5, 0, 0, this.radius, this.sides);
        p5.pop();

        this.checkIfFaded();
        this.calcPosition();
        this.calcRotation();
        this.calcColor();
        this.calcVelocity();
    }
}