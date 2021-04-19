import { randomInteger } from '../helpers';

export default class ShipTrace {
    constructor(p5, ship) {
        this.p5 = p5;

        this.radius = randomInteger(5, 20);
        this.color = this.getInitialColor();
        this.position = this.getInitialPosition({ ...ship.position });
        this.faded = false;
        setTimeout(() => {
            this.faded = true;
        }, 400 * Math.random());
    }

    getInitialColor() {
        return {
            fill: {
                R: randomInteger(200, 255),
                G: randomInteger(0, 255),
                B: randomInteger(0, 125),
                A: randomInteger(200, 255),
            },
            stroke: {
                R: randomInteger(200, 255),
                B: randomInteger(0, 255),
                B: randomInteger(0, 125),
                A: randomInteger(200, 255),
            },
        }

    }

    getInitialPosition(position) {
        return {
            x: position.x + (4 * Math.random() - 2),
            y: position.y + (4 * Math.random() - 2),
        }
    }

    calcColor() {
        if (this.color.fill.A > 0) {
            this.color.fill.A -= 5;
        }

        if (this.color.stroke.A > 0) {
            this.color.stroke.A -= 5;
        }

        if (this.color.fill < 0 && this.color.stroke < 0) {
            this.faded = true;
        }
    }

    calcRadius() {
        this.radius -= 0.1;

        if (this.radius < 0) {
            this.faded = true;
        }
    }


    draw() {
        const p5 = this.p5;

        /** CALCULATIONS */
        this.calcColor();

        /** RENDER DEBRIS */
        p5.push();

        p5.translate(this.position.x, this.position.y);
        p5.strokeWeight(1);
        p5.stroke(...Object.values(this.color.stroke));
        p5.fill(...Object.values(this.color.fill));
        p5.circle(0, 0, this.radius);

        p5.pop();


    }
}