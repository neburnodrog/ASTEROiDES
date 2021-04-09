import Shot from "./shot";
import { randomInteger } from '../helpers/helpers';

export default class Ship {
    constructor(p5) {
        this.image;
        this.shipLength = 50;
        this.shipWidth = 30;
        this.position = {
            x: p5.width / 2,
            y: p5.height / 2,
        }
        this.velocity = {
            x: 0,
            y: 0,
        }
        this.acceleration = 0; // only when arrow_up is pressed
        this.resistance = .01;
        this.angleOfMovement = 0;
        this.angleOfShip = 0; // expressed in radians
        this.shots = [];
        this.shipDebris = [];
    }

    rotateShip(p5) {
        if (p5.keyIsDown(68) || p5.keyIsDown(39)) {
            this.angleOfShip += Math.PI / 60;
        } else if (p5.keyIsDown(65) || p5.keyIsDown(37)) {
            this.angleOfShip -= Math.PI / 60;
        }

        if (this.angleOfShip > 2 * Math.PI) {
            this.angleOfShip % (2 * Math.PI);
        }

        if (this.angleOfShip < 0) {
            this.angleOfShip + 2 * Math.PI;
        }
    }

    calcAcceleration(p5) {
        if (p5.keyIsDown(87) || p5.keyIsDown(38)) {
            this.acceleration += .06;
        } else {
            this.acceleration = 0;
        }
    }

    backwardsEngines(p5) {
        let { x, y } = { ...this.velocity };
        if (p5.keyIsDown(83) || p5.keyIsDown(40)) {
            x -= .1 * Math.cos(this.angleOfShip);
            y -= .1 * Math.sin(this.angleOfShip);
        }

        this.velocity = { x: x, y: y };
    }

    calcVelocity() {
        let { x, y } = { ...this.velocity };

        if (Math.sqrt(y ** 2 + x ** 2) < 10) {
            x += this.acceleration * Math.cos(this.angleOfShip);
            y += this.acceleration * Math.sin(this.angleOfShip);
        }

        const newX = x - (x * this.resistance);
        const newY = y - (y * this.resistance);

        return { x: newX, y: newY };
    }

    calcAngleOfMovement() {
        const { x, y } = { ...this.velocity };
        return Math.asin(y / Math.sqrt(y ** 2 + x ** 2));
    }

    calcPosition() {
        const newX = this.position.x + this.velocity.x;
        const newY = this.position.y + this.velocity.y;

        return { x: newX, y: newY };
    }

    ifOverflowed(p5) {
        let { x, y } = { ...this.position };

        if (x < 0) {
            return { x: x + p5.width, y: y }
        }
        if (x > p5.width) {
            return { x: x % p5.width, y: y }
        }

        if (y < 0) {
            return { x: x, y: y + p5.height }
        }

        if (y > p5.height) {
            return { x: x, y: y % p5.height }
        }

        return { x: x, y: y };
    }

    shoot(p5) {
        p5.keyPressed = () => {
            if (p5.keyCode === 71 || p5.keyCode === 190) {
                this.shots.push(new Shot(this.position.x, this.position.y, this.angleOfShip));
            }
        }
    }

    filterOldShots(p5) {
        this.shots = this.shots.filter(shot => 0 < shot.position.x < p5.width && 0 < shot.position.y < p5.height && shot.hit === false);
    }

    explosion() {
        console.log("explosion")
        const randomDebris = randomInteger(5, 10);
    }

    draw(p5) {
        this.rotateShip(p5);
        this.calcAcceleration(p5);
        this.backwardsEngines(p5);
        this.velocity = this.calcVelocity();
        this.angleOfMovement = this.calcAngleOfMovement();
        this.position = this.calcPosition();
        this.position = this.ifOverflowed(p5);

        p5.push()
        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.angleOfShip);
        p5.image(this.image, 5, 0, this.shipLength, this.shipWidth)
        p5.pop();

        // shots
        this.shoot(p5);
    }
}