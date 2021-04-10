
export default class Shot {
    constructor(x, y, direction) {
        this.position = { x: x, y: y }
        this.direction = direction;
        this.velocity = { x: 0, y: 0 };
        this.hit = false;
    }

    calcVelocityComponents() {
        const absoluteSpeed = 15;
        return {
            x: Math.cos(this.direction) * absoluteSpeed,
            y: Math.sin(this.direction) * absoluteSpeed,
        }
    }

    calcPosition() {
        return {
            x: this.position.x + this.velocity.x,
            y: this.position.y + this.velocity.y
        }
    }

    draw(p5) {
        // calculations
        this.velocity = this.calcVelocityComponents();
        this.position = this.calcPosition();

        // draw the shot
        p5.push();
        p5.strokeWeight(8);
        p5.stroke("#ff01ef");
        p5.point(this.position.x, this.position.y);
        p5.pop();
    }
}