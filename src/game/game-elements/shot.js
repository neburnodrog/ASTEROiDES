import { calcVelocityComponents } from '../helpers';

export default class Shot {
    constructor(p5, x, y, direction) {
        this.p5 = p5;
        this.position = { x, y }
        this.absoluteSpeed = 15;
        this.velocity = calcVelocityComponents(direction, this.absoluteSpeed);
        this.hit = false;
    }

    calcPosition() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    draw() {
        const p5 = this.p5;

        // calculations
        this.calcPosition();

        // draw the shot
        p5.push();
        p5.strokeWeight(8);
        p5.stroke("#ff01ef");
        p5.point(this.position.x, this.position.y);
        p5.pop();
    }
}