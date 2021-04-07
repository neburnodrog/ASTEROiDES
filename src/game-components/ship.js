// import p5 from 'p5';
import { calcOverflowedPosition } from '../helperFuncs/helpers';

export class Ship {
    constructor() {
        // image props
        this.image;
        this.shipLength = 50;
        this.shipWidth = 30;

        this.position = {
            x: 400,
            y: 400
        }

        this.velocity = {
            x: 0,
            y: 0,
        }

        this.acceleration = 0; // only when arrow_up is pressed
        this.resistance = .01;

        // directions (of ship = where its pointing / of movement = where its flying)
        this.angleOfMovement = 0;
        this.angleOfShip = 0; // expressed in radians
    }

    rotateShip(p5, angleOfShip) {
        let newAngle = angleOfShip;

        if (p5.keyIsDown(39)) {
            newAngle += Math.PI / 60;
        } else if (p5.keyIsDown(37)) {
            newAngle -= Math.PI / 60;
        }

        if (newAngle > 2 * Math.PI) {
            return newAngle % (2 * Math.PI);
        }

        if (newAngle < 0) {
            return newAngle + 2 * Math.PI;
        }

        return newAngle;
    }

    hyperspace(p5, velocity) {
        if (p5.keyIsDown(40)) {
            console.log('ready for hyperspace!')
            // for now its stop
            velocity.x = 0;
            velocity.y = 0;
        }
    }

    calcVelocity(velocity, acceleration, resistance, direction) {
        let { x, y } = { ...velocity };

        if (Math.sqrt(y ** 2 + x ** 2) < 10) {
            x += acceleration * Math.cos(direction);
            y += acceleration * Math.sin(direction);
        }

        const newX = x - (x * resistance);
        const newY = y - (y * resistance);

        return { x: newX, y: newY };
    }

    accelerate(p5, acceleration) {
        if (p5.keyIsDown(38)) {
            acceleration += .006;
        } else {
            acceleration = 0;
        }

        return acceleration;
    }

    calcAngleOfMovement() {
        const { x, y } = { ...this.velocity };

        return Math.asin(y / Math.sqrt(y ** 2 + x ** 2));
    }

    calcPosition(position, velocity) {
        const newX = position.x + velocity.x;
        const newY = position.y + velocity.y;

        return { x: newX, y: newY };
    }

    draw(p5) {
        console.log(this.angleOfShip)
        this.angleOfShip = this.rotateShip(p5, this.angleOfShip);
        console.log(this.angleOfShip)
        this.acceleration = this.accelerate(p5, this.acceleration);
        console.log(this.velocity)
        this.velocity = this.calcVelocity(this.velocity, this.acceleration, this.resistance, this.angleOfShip);
        console.log(this.velocity)
        this.hyperspace(p5, this.velocity);
        this.angleOfMovement = this.calcAngleOfMovement();
        this.position = this.calcPosition(this.position, this.velocity);


        if (
            this.position.x < 0
            || this.position.x > 800
            || this.position.y < 0
            || this.position.y > 800
        ) {
            console.log('calculating overflow')
            this.position = calcOverflowedPosition(p5, this.position, this.angleOfMovement);
        }

        p5.push()
        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.angleOfShip);
        p5.image(this.image, 5, 0, this.shipLength, this.shipWidth)
        p5.pop();
    }
}