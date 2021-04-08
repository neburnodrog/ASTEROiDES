
export class Asteroid {
    constructor(size, position, velocity) {
        this.size = size;
        this.position = position;
        this.radius = this.initialRadius(size);
        this.sides = Math.floor(Math.random() * 4) + 7;
        this.rotation = { angle: 0, velocity: Math.random() / 50 }
        this.velocity = velocity;
        this.exploded = false;
    }

    initialRadius(size) {
        if (size === 'X') return Math.random() * 25 + 50;
        if (size === 'M') return Math.random() * 15 + 30;
        if (size === 'S') return Math.random() * 10 + 8;
    }

    drawPolygon(p5, x, y, radius, npoints) {
        let angle = p5.TWO_PI / npoints;
        p5.beginShape();
        for (let a = 0; a < p5.TWO_PI; a += angle) {
            let sx = x + p5.cos(a) * radius;
            let sy = y + p5.sin(a) * radius;
            p5.vertex(sx, sy);
        }
        p5.endShape(p5.CLOSE);
    }

    calcRotation() {
        this.rotation.angle += this.rotation.velocity;
    }

    calcPosition(p5) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x > p5.width + this.radius) {
            this.position.x = 0 - this.radius;
        }

        if (this.position.x < 0 - this.radius) {
            this.position.x = p5.width + this.radius;
        }

        if (this.position.y > p5.height + this.radius) {
            this.position.y = 0 - this.radius;
        }

        if (this.position.y < 0 - this.radius) {
            this.position.y = p5.height + this.radius;
        }
    }

    draw(p5) {
        this.calcRotation();
        this.calcPosition(p5);

        p5.push();
        p5.translate(this.position.x, this.position.y);
        p5.rotate(this.rotation.angle);
        p5.strokeWeight(8);
        p5.stroke('gray');
        p5.fill(52, 53, 55)
        this.drawPolygon(p5, 0, 0, this.radius, this.sides);
        p5.pop();
    }
}