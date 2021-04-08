import { Shot } from "./shot";

export class Ship {
    constructor() {
        this.image;
        this.shipLength = 50;
        this.shipWidth = 30;
        this.position = {
            x: 600,
            y: 400,
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
    }

    rotateShip(p5, angleOfShip) {
        let newAngle = angleOfShip;

        if (p5.keyIsDown(68) || p5.keyIsDown(39)) {
            newAngle += Math.PI / 60;
        } else if (p5.keyIsDown(65) || p5.keyIsDown(37)) {
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
        if (p5.keyIsDown(83) || p5.keyIsDown(40)) {
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
        if (p5.keyIsDown(87) || p5.keyIsDown(38)) {
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

    ifOverflowed(p5, position) {
        let { x, y } = { ...position };

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

        return position;
    }

    shoot(p5, position, angleOfShip) {
        const shots = [...this.shots];

        p5.keyPressed = () => {
            if (p5.keyCode === 71 || p5.keyCode === 190) {
                shots.push(new Shot(position.x, position.y, angleOfShip));
            }
        }

        return shots;
    }

    draw(p5) {
        this.angleOfShip = this.rotateShip(p5, this.angleOfShip);
        this.acceleration = this.accelerate(p5, this.acceleration);
        this.velocity = this.calcVelocity(this.velocity, this.acceleration, this.resistance, this.angleOfShip);
        this.hyperspace(p5, this.velocity);
        this.angleOfMovement = this.calcAngleOfMovement();
        this.position = this.calcPosition(this.position, this.velocity);
        this.position = this.ifOverflowed(p5, this.position);

        p5.push()
        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.angleOfShip);
        p5.image(this.image, 5, 0, this.shipLength, this.shipWidth)
        p5.pop();

        // shots
        this.shots = this.shoot(p5, this.position, this.angleOfShip);
        this.shots.filter(
            shot => 0 < shot.position.x < p5.windowWidth
                && 0 < shot.position.y < p5.windowHeight);
    }
}