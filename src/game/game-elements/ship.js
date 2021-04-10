import Shot from "./shot";
import { randomInteger, spaceOrEnterPressed } from '../helpers';

const PI = Math.PI;

export default class Ship {
    constructor(p5, image) {
        this.p5 = p5

        // STATIC PROPERTIES
        this.image = image;
        this.shipLength = 50;
        this.shipWidth = 30;

        // DYNAMIC PROPERTIES
        this.acceleration = 0; // only when arrow_up is pressed
        this.resistance = .01;
        this.velocity = { x: 0, y: 0, }
        this.position = { x: p5.width / 2, y: p5.height / 2, }
        this.angleOfShip = 0; // expressed in radians

        // DEPENDANT ELEMENTS
        this.shots = [];
        this.shipDebris = [];
    }

    /** USER ACTION METHODS */
    rotateShip() {
        if (this.p5.keyIsDown(68) || this.p5.keyIsDown(39)) {
            this.angleOfShip += PI / 40;
        } else if (p5.keyIsDown(65) || p5.keyIsDown(37)) {
            this.angleOfShip -= PI / 40;
        }

        if (this.angleOfShip > 2 * PI) this.angleOfShip % (2 * PI);
        if (this.angleOfShip < 0) this.angleOfShip + 2 * PI;
    }

    accelerate() {
        if (this.p5.keyIsDown(87) || this.p5.keyIsDown(38)) {
            this.acceleration += .009;
        } else {
            this.acceleration = 0;
        }
    }

    reverseEngines() {
        if (this.p5.keyIsDown(83) || this.p5.keyIsDown(40)) {
            this.velocity.x -= .2 * Math.cos(this.angleOfShip);
            this.velocity.y -= .2 * Math.sin(this.angleOfShip);
        }
    }

    shoot() {
        if (spaceOrEnterPressed(this.p5)) {
            this.shots.push(new Shot(this.position.x, this.position.y, this.angleOfShip));
        }
    }

    /** EVENTS => handled in game.js */
    explosion() {
        console.log("explosion")
        // not implemented yet
        // const randomDebris = randomInteger(5, 10);
    }

    /** CALCULATIONS */
    calcVelocity() {
        let { x, y } = { ...this.velocity };

        // The absolute velocity is the hypotenuse of the x & y components (Pythagorean theorem)
        absoluteVelocity = Math.sqrt(y ** 2 + x ** 2);

        if (absoluteVelocity < 10) {
            x += this.acceleration * Math.cos(this.angleOfShip);
            y += this.acceleration * Math.sin(this.angleOfShip);
        }

        return {
            x: x - x * this.resistance,
            y: y - y * this.resistance,
        };
    }

    calcPosition() {
        return {
            x: this.position.x + this.velocity.x,
            y: this.position.y + this.velocity.y,
        };
    }

    ifOverflowed() {
        const { width, height } = { ...this.p5 };
        let { x, y } = { ...this.position };

        if (x < 0) return { x: x + width, y: y }
        if (x > width) return { x: x % width, y: y }
        if (y < 0) return { x: x, y: y + height }
        if (y > height) return { x: x, y: y % height }

        return { x: x, y: y };
    }

    /** CLEANUP */
    filterOldShots() {
        this.shots = this.shots.filter(
            shot => 0 < shot.position.x < this.p5.width
                && 0 < shot.position.y < this.p5.height
                && shot.hit === false
        );
    }

    /** LOOP */
    draw() {
        const p5 = this.p5;

        // USER ACTIONS
        this.rotateShip(p5);
        this.accelerate(p5);
        this.reverseEngines(p5)
        this.shoot(p5);

        // CALCULATIONS
        this.velocity = this.calcVelocity();
        this.position = this.calcPosition();
        this.position = this.ifOverflowed(p5);

        // CLEANUP
        this.filterOldShots();

        // RENDERING
        p5.push()
        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.angleOfShip);
        p5.image(this.image, 5, 0, this.shipLength, this.shipWidth)
        p5.pop();
    }
}