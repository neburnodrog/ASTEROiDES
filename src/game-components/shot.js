
export class Shot {
    constructor(x, y, direction) {
        this.position = { x: x, y: y }
        this.direction = direction;
        this.velocity = { x: 0, y: 0 };
    }

    calcVelocityComponents() {
        const absoluteSpeed = 10;
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
        console.log("draw method of shot")
        this.velocity = this.calcVelocityComponents();
        // draw the shot
        p5.strokeWeight(8);
        p5.stroke("#ff01ef");
        p5.point(this.position.x, this.position.y);

        // calculate next position
        this.position = this.calcPosition();
    }
}